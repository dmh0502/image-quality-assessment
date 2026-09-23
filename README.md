# No-Reference Image Quality Assessment (NRIQA) Studio

Hệ thống đánh giá chất lượng ảnh không tham chiếu (No-Reference Image Quality Assessment) và nhận diện 25 loại lỗi biến dạng dựa trên kiến trúc mạng **EfficientNet-B0 kết hợp Spatial Attention**, hỗ trợ đối chiếu với bộ dữ liệu chuẩn **KADID-10k**.

---

## 🌟 Tính Năng Nổi Bật

- **Chấm điểm chất lượng ảnh (MOS Score Regression):** Dự đoán điểm MOS từ 1.00 đến 5.00 kèm phân cấp chất lượng trực quan.
- **Nhận diện lỗi biến dạng (Distortion Classification):** Phân loại chính xác 25 loại nhiễu/biến dạng ảnh (Blur, JPEG, Noise, Saturation, Quantization,...).
- **Tra cứu định nghĩa mã lỗi:** Xem chi tiết khái niệm, nguyên nhân và dấu hiệu nhận biết của từng mã lỗi chỉ với 1 click.
- **Đối chiếu Ground Truth:** Tự động so sánh kết quả AI với dữ liệu thực tế trong `kadid10k/dmos.csv`.
- **Lịch sử đánh giá:** Lưu trữ danh sách ảnh đã chấm điểm, xem lại chi tiết và quản lý lịch sử.

---

## 🏗️ Cấu Trúc Dự Án

```
Computer_Vision/
├── main.py                  # Script kiểm tra suy luận trên terminal
├── server.py                # FastAPI Backend server (Port 8000)
├── run_demo.bat             # Kịch bản khởi chạy nhanh cả Backend & Frontend
├── nriqa_efficientnet_head_ver2.pth # Checkpoint trọng số mô hình đã huấn luyện
├── I81_14_03.png            # Ảnh mẫu thử nghiệm
├── kadid10k/
│   └── dmos.csv             # Nhãn chất lượng và thông số KADID-10k
└── frontend/                # Ứng dụng web React + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── App.tsx          # Giao diện chính
    │   ├── components/      # Các component (Header, ImageUploader, ResultCard, HistoryList)
    │   ├── constants.ts     # Từ điển định nghĩa 25 mã lỗi KADID
    │   └── api.ts           # Gọi API backend
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- Python 3.10+
- Node.js 18+ & npm

### 2. Cài đặt thư viện Python (Backend)
```bash
pip install torch torchvision pandas pillow fastapi uvicorn python-multipart
```

### 3. Cài đặt gói phụ thuộc Frontend
```bash
cd frontend
npm install
cd ..
```

### 4. Khởi chạy ứng dụng
**Cách 1:** Nhấp đúp chuột vào file **`run_demo.bat`** (trên Windows).

**Cách 2:** Chạy thủ công trên 2 terminal:
- **Terminal 1 (Backend):**
  ```bash
  python server.py
  ```
- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```

Mở trình duyệt tại: **`http://localhost:5173`**

