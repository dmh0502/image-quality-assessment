import os
import sys
import uuid
import json
import shutil
from datetime import datetime
from typing import List, Optional

# Đảm bảo hiển thị tiếng Việt và console encoding
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from torchvision.models import EfficientNet_B0_Weights
from PIL import Image
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ================= CẤU HÌNH ĐƯỜNG DẪN =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "nriqa_efficientnet_head_ver2.pth")
CSV_PATH = os.path.join(BASE_DIR, "kadid10k", "dmos.csv")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
KADID_IMAGES_DIR = os.path.join(BASE_DIR, "kadid10k", "images")
HISTORY_FILE = os.path.join(BASE_DIR, "history.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Khởi tạo history.json nếu chưa tồn tại
if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)

# ================= ĐỊNH NGHĨA MODEL & XỬ LÝ ẢNH =================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

data_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size=kernel_size, padding=kernel_size // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        x_cat = torch.cat([avg_out, max_out], dim=1)
        attention_map = self.sigmoid(self.conv(x_cat))
        return x * attention_map

class NriqaAdvancedModel(nn.Module):
    def __init__(self, pretrained=False):
        super().__init__()
        weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        base_model = models.efficientnet_b0(weights=weights)

        for param in base_model.parameters():
            param.requires_grad = False

        for param in base_model.features[6:].parameters():
            param.requires_grad = True

        self.backbone = base_model.features
        self.spatial_attention = SpatialAttention(kernel_size=7)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.flatten = nn.Flatten()

        self.mos_head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features=1280, out_features=1)
        )

        self.distortion_head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features=1280, out_features=25)
        )

    def forward(self, x):
        features = self.backbone(x)
        features = self.spatial_attention(features)
        features = self.pool(features)
        vector_1280 = self.flatten(features)
        mos_score = self.mos_head(vector_1280)
        distortion_logits = self.distortion_head(vector_1280)
        return mos_score, distortion_logits

# Từ điển 25 loại biến dạng của KADID-10k
KADID_DISTORTIONS_VN = {
    1: "Mờ Gaussian (Gaussian blur)", 2: "Mờ ống kính / Lệch tiêu cự (Lens blur)",
    3: "Mờ do chuyển động (Motion blur)", 4: "Khuếch tán màu (Color diffusion)",
    5: "Lệch màu (Color shift)", 6: "Lượng tử hóa màu (Color quantization)",
    7: "Giảm bão hòa màu nhạt đi (Color saturation 1)", 8: "Tăng bão hòa màu rực rỡ (Color saturation 2)",
    9: "Lỗi nén JPEG2000 (JPEG2000)", 10: "Lỗi nén JPEG / Vỡ khối (JPEG)",
    11: "Nhiễu trắng (White noise)", 12: "Nhiễu hạt trên kênh màu (White noise in color component)",
    13: "Nhiễu xung / Muối tiêu (Impulse noise)", 14: "Nhiễu nhân / Đốm hạt (Multiplicative noise)",
    15: "Khử nhiễu quá mức làm mất chi tiết (Denoise)", 16: "Phơi sáng quá mức / Dư sáng (Brighten)",
    17: "Thiếu sáng (Darken)", 18: "Lệch độ sáng trung bình (Mean shift)",
    19: "Nhiễu răng cưa / Rung ảnh (Jitter)", 20: "Biến dạng mảng cục bộ (Non-eccentricity patch)",
    21: "Vỡ hạt Pixel (Pixelate)", 22: "Lượng tử hóa / Phân dải màu (Quantization)",
    23: "Vỡ khối màu (Color block)", 24: "Tăng sắc nét quá mức / Viền quầng (High sharpen)",
    25: "Thay đổi độ tương phản (Contrast change)"
}

# ================= NẠP MÔ HÌNH VÀ DỮ LIỆU CSV =================
print(f"🔄 Đang tải mô hình từ: {MODEL_PATH}")
model = NriqaAdvancedModel(pretrained=False)
if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    print("✅ Đã nạp thành công checkpoint trọng số!")
else:
    print(f"⚠️ Cảnh báo: Không tìm thấy checkpoint tại {MODEL_PATH}")
model = model.to(device)
model.eval()

# Nạp bảng dữ liệu KADID để đối chiếu Ground Truth nếu có
kadid_df = None
if os.path.exists(CSV_PATH):
    try:
        kadid_df = pd.read_csv(CSV_PATH)
        print(f"✅ Đã nạp dữ liệu ground truth ({len(kadid_df)} dòng) từ: {CSV_PATH}")
    except Exception as e:
        print(f"⚠️ Lỗi đọc file CSV: {e}")

# ================= FASTAPI SETUP =================
app = FastAPI(title="NRIQA - Image Quality Assessment & Distortion Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ file tĩnh ảnh upload và ảnh mẫu
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
if os.path.exists(KADID_IMAGES_DIR):
    app.mount("/kadid_images", StaticFiles(directory=KADID_IMAGES_DIR), name="kadid_images")

def get_mos_rating(mos_score: float) -> dict:
    if mos_score >= 4.0:
        return {"label": "Rất tốt (Excellent)", "color": "emerald", "badge": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}
    elif mos_score >= 3.2:
        return {"label": "Tốt (Good)", "color": "teal", "badge": "bg-teal-500/10 text-teal-400 border-teal-500/30"}
    elif mos_score >= 2.4:
        return {"label": "Trung bình (Fair)", "color": "amber", "badge": "bg-amber-500/10 text-amber-400 border-amber-500/30"}
    elif mos_score >= 1.6:
        return {"label": "Kém (Poor)", "color": "orange", "badge": "bg-orange-500/10 text-orange-400 border-orange-500/30"}
    else:
        return {"label": "Rất kém (Bad)", "color": "rose", "badge": "bg-rose-500/10 text-rose-400 border-rose-500/30"}

def lookup_ground_truth(filename: str):
    if kadid_df is None:
        return None
    col_name = 'dist_img' if 'dist_img' in kadid_df.columns else ('image' if 'image' in kadid_df.columns else kadid_df.columns[0])
    row = kadid_df[kadid_df[col_name] == filename]
    if row.empty:
        return None
    
    true_mos = None
    if 'dmos' in row.columns:
        true_mos = float(row['dmos'].values[0])
    elif 'mos' in row.columns:
        true_mos = float(row['mos'].values[0])

    true_noise_code = None
    if 'noise' in row.columns:
        true_noise_code = int(row['noise'].values[0])
    else:
        parts = os.path.splitext(filename)[0].split('_')
        if len(parts) >= 2 and parts[1].isdigit():
            true_noise_code = int(parts[1])

    true_noise_name = KADID_DISTORTIONS_VN.get(true_noise_code, "Lỗi không xác định") if true_noise_code else None

    return {
        "dmos": round(true_mos, 2) if true_mos is not None else None,
        "noise_code": true_noise_code,
        "noise_name": true_noise_name
    }

def read_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_history(history_list):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history_list, f, ensure_ascii=False, indent=2)

# ================= API ENDPOINTS =================
@app.get("/api/status")
def get_status():
    return {
        "status": "online",
        "device": str(device),
        "cuda_available": torch.cuda.is_available(),
        "model_name": "EfficientNet-B0 + Spatial Attention",
        "checkpoint": os.path.basename(MODEL_PATH),
        "num_distortions": len(KADID_DISTORTIONS_VN)
    }

@app.post("/api/predict")
async def predict_image(file: UploadFile = File(...)):
    try:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
            raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP, BMP.")

        record_id = str(uuid.uuid4())
        safe_filename = f"{record_id}_{file.filename}"
        saved_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Mở và tiền xử lý ảnh
        pil_image = Image.open(saved_path).convert("RGB")
        width, height = pil_image.size
        input_tensor = data_transforms(pil_image).unsqueeze(0).to(device)

        with torch.no_grad():
            score_mos_tensor, noise_logits_tensor = model(input_tensor)

        predicted_mos = float(score_mos_tensor.item())
        # Cắt ngưỡng thang điểm 1.0 đến 5.0
        predicted_mos = max(1.0, min(5.0, predicted_mos))

        probs = F.softmax(noise_logits_tensor, dim=1)[0].cpu().numpy()
        predicted_noise_code = int(noise_logits_tensor.argmax(dim=1).item()) + 1
        predicted_noise_name = KADID_DISTORTIONS_VN.get(predicted_noise_code, "Lỗi không xác định")

        # Lấy top 3 lỗi có xác suất cao nhất
        top_indices = probs.argsort()[-3:][::-1]
        top_distortions = [
            {
                "code": int(idx + 1),
                "name": KADID_DISTORTIONS_VN.get(int(idx + 1), "Lỗi không xác định"),
                "probability": round(float(probs[idx]) * 100, 2)
            }
            for idx in top_indices
        ]

        rating_info = get_mos_rating(predicted_mos)
        ground_truth = lookup_ground_truth(file.filename)

        result_item = {
            "id": record_id,
            "filename": file.filename,
            "image_url": f"/uploads/{safe_filename}",
            "width": width,
            "height": height,
            "file_size_kb": round(os.path.getsize(saved_path) / 1024, 1),
            "predicted_mos": round(predicted_mos, 2),
            "rating": rating_info,
            "noise_code": predicted_noise_code,
            "noise_name": predicted_noise_name,
            "confidence": round(float(probs[predicted_noise_code - 1]) * 100, 2),
            "top_distortions": top_distortions,
            "ground_truth": ground_truth,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Lưu vào lịch sử (đưa lên đầu danh sách)
        history = read_history()
        history.insert(0, result_item)
        # Giới hạn tối đa 50 bản ghi
        if len(history) > 50:
            history = history[:50]
        save_history(history)

        return result_item

    except HTTPException:
        raise
    except Exception as e:
        print(f"Lỗi suy luận: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý ảnh: {str(e)}")

class SamplePredictRequest(BaseModel):
    sample_filename: str

@app.post("/api/predict-sample")
async def predict_sample(payload: SamplePredictRequest):
    sample_name = payload.sample_filename
    source_path = None

    if os.path.exists(os.path.join(BASE_DIR, sample_name)):
        source_path = os.path.join(BASE_DIR, sample_name)
    elif os.path.exists(os.path.join(KADID_IMAGES_DIR, sample_name)):
        source_path = os.path.join(KADID_IMAGES_DIR, sample_name)

    if not source_path or not os.path.exists(source_path):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy ảnh mẫu {sample_name}")

    record_id = str(uuid.uuid4())
    safe_filename = f"{record_id}_{sample_name}"
    saved_path = os.path.join(UPLOAD_DIR, safe_filename)
    shutil.copyfile(source_path, saved_path)

    pil_image = Image.open(saved_path).convert("RGB")
    width, height = pil_image.size
    input_tensor = data_transforms(pil_image).unsqueeze(0).to(device)

    with torch.no_grad():
        score_mos_tensor, noise_logits_tensor = model(input_tensor)

    predicted_mos = float(score_mos_tensor.item())
    predicted_mos = max(1.0, min(5.0, predicted_mos))

    probs = F.softmax(noise_logits_tensor, dim=1)[0].cpu().numpy()
    predicted_noise_code = int(noise_logits_tensor.argmax(dim=1).item()) + 1
    predicted_noise_name = KADID_DISTORTIONS_VN.get(predicted_noise_code, "Lỗi không xác định")

    top_indices = probs.argsort()[-3:][::-1]
    top_distortions = [
        {
            "code": int(idx + 1),
            "name": KADID_DISTORTIONS_VN.get(int(idx + 1), "Lỗi không xác định"),
            "probability": round(float(probs[idx]) * 100, 2)
        }
        for idx in top_indices
    ]

    rating_info = get_mos_rating(predicted_mos)
    ground_truth = lookup_ground_truth(sample_name)

    result_item = {
        "id": record_id,
        "filename": sample_name,
        "image_url": f"/uploads/{safe_filename}",
        "width": width,
        "height": height,
        "file_size_kb": round(os.path.getsize(saved_path) / 1024, 1),
        "predicted_mos": round(predicted_mos, 2),
        "rating": rating_info,
        "noise_code": predicted_noise_code,
        "noise_name": predicted_noise_name,
        "confidence": round(float(probs[predicted_noise_code - 1]) * 100, 2),
        "top_distortions": top_distortions,
        "ground_truth": ground_truth,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    history = read_history()
    history.insert(0, result_item)
    if len(history) > 50:
        history = history[:50]
    save_history(history)

    return result_item

@app.get("/api/samples")
def get_sample_images():
    samples = []
    # Thêm ảnh mẫu I81_14_03.png ở thư mục gốc
    if os.path.exists(os.path.join(BASE_DIR, "I81_14_03.png")):
        samples.append({
            "filename": "I81_14_03.png",
            "title": "I81_14_03.png (Nhiễu nhân / Multiplicative noise)",
            "dmos": 2.70,
            "noise_code": 14
        })

    # Tìm thêm một vài ảnh mẫu đại diện các loại nhiễu khác từ kadid10k/images
    candidate_samples = [
        ("I01_01_03.png", "Gaussian Blur (Mờ Gaussian)"),
        ("I01_02_03.png", "Lens Blur (Lệch tiêu cự)"),
        ("I01_09_03.png", "JPEG2000 Compression"),
        ("I01_10_03.png", "JPEG Compression (Vỡ khối)"),
        ("I01_11_03.png", "White Noise (Nhiễu trắng)"),
        ("I01_13_03.png", "Impulse Noise (Muối tiêu)"),
        ("I01_16_03.png", "Brighten (Dư sáng)"),
        ("I01_17_03.png", "Darken (Thiếu sáng)"),
        ("I01_21_03.png", "Pixelate (Vỡ hạt Pixel)")
    ]

    for fname, desc in candidate_samples:
        fpath = os.path.join(KADID_IMAGES_DIR, fname)
        if os.path.exists(fpath):
            gt = lookup_ground_truth(fname)
            samples.append({
                "filename": fname,
                "title": f"{fname} - {desc}",
                "dmos": gt.get("dmos") if gt else None,
                "noise_code": gt.get("noise_code") if gt else None
            })

    return samples

@app.get("/api/history")
def get_history():
    return read_history()

@app.delete("/api/history/{record_id}")
def delete_history_item(record_id: str):
    history = read_history()
    filtered = [item for item in history if item.get("id") != record_id]
    if len(filtered) == len(history):
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi")
    save_history(filtered)
    return {"success": True, "message": "Đã xóa bản ghi thành công"}

@app.delete("/api/history")
def clear_all_history():
    save_history([])
    return {"success": True, "message": "Đã xóa toàn bộ lịch sử"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Khởi chạy NRIQA API server tại http://localhost:8000 ...")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)

