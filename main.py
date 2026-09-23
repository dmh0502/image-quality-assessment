import os
import sys

# Đảm bảo hiển thị tiếng Việt và emoji mượt mà trên console Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models import EfficientNet_B0_Weights

# 1. Cấu hình tiền xử lý ảnh
data_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Spatial Attention Module ---
class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super().__init__()
        # Gom cụm điểm ảnh theo 2 kênh: Max Pooling và Average Pooling
        self.conv = nn.Conv2d(2, 1, kernel_size=kernel_size, padding=kernel_size // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        # Nối 2 ma trận lại và đưa qua mạng chập để tìm ra "Vùng cần chú ý"
        x_cat = torch.cat([avg_out, max_out], dim=1)
        attention_map = self.sigmoid(self.conv(x_cat))
        # Nhân ma trận chú ý vào ma trận ảnh gốc
        return x * attention_map

# --- Kiến trúc Model Nâng cao ---
class NriqaAdvancedModel(nn.Module):
    def __init__(self, pretrained=False):
        super().__init__()
        weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        base_model = models.efficientnet_b0(weights=weights)

        # 1. Đóng băng toàn bộ trọng số trước
        for param in base_model.parameters():
            param.requires_grad = False

        # 2. GRADUAL UNFREEZING: Mở khóa các Block cuối cùng (từ index 6 trở đi)
        # EfficientNet-B0 features có các block từ 0 đến 8.
        for param in base_model.features[6:].parameters():
            param.requires_grad = True

        self.backbone = base_model.features

        # 3. Tích hợp Spatial Attention ngay sau Backbone
        self.spatial_attention = SpatialAttention(kernel_size=7)

        self.pool = nn.AdaptiveAvgPool2d(1)
        self.flatten = nn.Flatten()

        # 4. Tăng nhẹ Dropout để chống Overfitting khi rã đông
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

        # Ảnh đi qua Attention trước khi pooling
        features = self.spatial_attention(features)

        features = self.pool(features)
        vector_1280 = self.flatten(features)

        mos_score = self.mos_head(vector_1280)
        distortion_logits = self.distortion_head(vector_1280)

        return mos_score, distortion_logits

# Từ điển biên dịch mã lỗi (25 loại biến dạng của KADID-10k)
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

def evaluate_and_compare(image_path, model_path, csv_path=None):
    if not os.path.exists(image_path):
        print(f"❌ Không tìm thấy ảnh tại: {image_path}")
        return

    if not os.path.exists(model_path):
        print(f"❌ Không tìm thấy checkpoint mô hình tại: {model_path}")
        return

    # 1. Nạp mô hình
    infer_model = NriqaAdvancedModel(pretrained=False)
    infer_model.load_state_dict(torch.load(model_path, map_location=device))
    infer_model = infer_model.to(device)
    infer_model.eval()

    # 2. Tiền xử lý ảnh
    image = Image.open(image_path).convert('RGB')
    input_tensor = data_transforms(image).unsqueeze(0).to(device)

    # 3. AI Dự đoán
    with torch.no_grad():
        score_mos, noise_logits = infer_model(input_tensor)

    predicted_mos = score_mos.item()
    predicted_noise_code = noise_logits.argmax(dim=1).item() + 1
    predicted_noise_name = KADID_DISTORTIONS_VN.get(predicted_noise_code, "Lỗi không xác định")

    # 4. Truy xuất Đáp án thực tế từ CSV (Ground Truth)
    img_filename = os.path.basename(image_path)
    true_mos = None
    true_noise_code = None
    true_noise_name = "Chưa rõ"

    if csv_path and os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        # Hỗ trợ cả cột 'dist_img' (chuẩn của dmos.csv) và 'image'
        col_name = 'dist_img' if 'dist_img' in df.columns else ('image' if 'image' in df.columns else df.columns[0])
        row = df[df[col_name] == img_filename]
        if not row.empty:
            if 'dmos' in row.columns:
                true_mos = float(row['dmos'].values[0])
            elif 'mos' in row.columns:
                true_mos = float(row['mos'].values[0])

            if 'noise' in row.columns:
                true_noise_code = int(row['noise'].values[0])
            else:
                # Tự động trích xuất mã nhiễu theo tên file KADID (ví dụ: I81_14_03.png -> mã nhiễu 14)
                parts = os.path.splitext(img_filename)[0].split('_')
                if len(parts) >= 2 and parts[1].isdigit():
                    true_noise_code = int(parts[1])

            if true_noise_code is not None:
                true_noise_name = KADID_DISTORTIONS_VN.get(true_noise_code, "Lỗi không xác định")
    elif csv_path:
        print(f"⚠️ Cảnh báo: Không tìm thấy file CSV tại: {csv_path}")

    # 5. Trực quan hóa ảnh
    plt.figure(figsize=(7, 5))
    plt.imshow(image)
    plt.axis('off')
    plt.title(f"Ảnh: {img_filename}", fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.show()

    # 6. In bảng so sánh
    print("=" * 65)
    print("📊 BẢNG ĐỐI CHIẾU KẾT QUẢ: AI vs THỰC TẾ")
    print("=" * 65)

    print("🔍 1. NHẬN DIỆN LỖI (CLASSIFICATION):")
    if true_noise_code is not None:
        print(f"   - Thực tế (Ground Truth) : {true_noise_name} (Mã: {true_noise_code})")
    print(f"   - AI Dự đoán             : {predicted_noise_name} (Mã: {predicted_noise_code})")

    if true_noise_code is not None:
        if true_noise_code == predicted_noise_code:
            print("   👉 Đánh giá: ✅ CHÍNH XÁC")
        else:
            print("   👉 Đánh giá: ❌ SAI (Điểm nghẽn cần cải thiện)")

    print("\n📈 2. CHẤM ĐIỂM CHẤT LƯỢNG (MOS REGRESSION):")
    if true_mos is not None:
        print(f"   - Thực tế (Ground Truth) : {true_mos:.2f} / 5.00")
    print(f"   - AI Dự đoán             : {predicted_mos:.2f} / 5.00")

    if true_mos is not None:
        diff = abs(true_mos - predicted_mos)
        print(f"   👉 Sai số tuyệt đối      : {diff:.2f} điểm")
        if diff <= 0.5:
            print("   👉 Đánh giá: 🌟 RẤT CHUẨN (Khó phân biệt bằng mắt người)")
        elif diff <= 1.0:
            print("   👉 Đánh giá: 👍 CHẤP NHẬN ĐƯỢC")
        else:
            print("   👉 Đánh giá: ⚠️ LỆCH NHIỀU")
    print("=" * 65)


# ================= CẤU HÌNH ĐƯỜNG DẪN & CHẠY DEMO =================
if __name__ == "__main__":
    # Thư mục gốc chứa file script hiện tại
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # Đường dẫn tự động nhận diện trên máy local
    MODEL_PATH = os.path.join(BASE_DIR, "nriqa_efficientnet_head_ver2.pth")
    CSV_DATA = os.path.join(BASE_DIR, "kadid10k", "dmos.csv")
    
    # Đường dẫn ảnh kiểm tra (ảnh mẫu ngay tại thư mục dự án)
    IMAGE_PATH = os.path.join(BASE_DIR, "I81_14_03.png")
    # Bạn cũng có thể kiểm tra ảnh trong kadid10k/images:
    # IMAGE_PATH = os.path.join(BASE_DIR, "kadid10k", "images", "I81_14_03.png")

    print(f"🖥️ Thiết bị sử dụng: {device}")
    print(f"📁 Đang đánh giá ảnh: {IMAGE_PATH}")
    evaluate_and_compare(IMAGE_PATH, MODEL_PATH, csv_path=CSV_DATA)