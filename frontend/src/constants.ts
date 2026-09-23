export interface DistortionInfo {
  code: number;
  nameVn: string;
  nameEn: string;
  summary: string;
  cause: string;
  visualSign: string;
}

export const KADID_DISTORTIONS_DETAIL: Record<number, DistortionInfo> = {
  1: {
    code: 1,
    nameVn: "Mờ Gaussian",
    nameEn: "Gaussian blur",
    summary: "Ảnh bị mờ mịn toàn bộ do áp dụng bộ lọc toán học phân phối chuẩn Gaussian.",
    cause: "Thường do thuật toán làm mịn (smoothing), giảm độ nét hoặc quá trình nén làm mờ ảnh.",
    visualSign: "Các cạnh viền sắc nhọn bị nhòe dần ra xung quanh, chi tiết nhỏ bị xóa nhòa thành mảng mịn."
  },
  2: {
    code: 2,
    nameVn: "Mờ ống kính / Lệch tiêu cự",
    nameEn: "Lens blur",
    summary: "Hiện tượng nhòe mờ do thấu kính máy ảnh lấy nét sai khoảng cách tiêu cự.",
    cause: "Máy ảnh lấy nét vào tiền cảnh/hậu cảnh hoặc lỗi quang học của ống kính (out of focus).",
    visualSign: "Xuất hiện các đốm nhòe tròn hoặc đa giác (bokeh) quanh các điểm sáng, vật thể mất hoàn toàn độ sắc nét quang học."
  },
  3: {
    code: 3,
    nameVn: "Mờ do chuyển động",
    nameEn: "Motion blur",
    summary: "Vệt mờ kéo dài theo một hướng nhất định do vật thể chuyển động hoặc rung tay máy.",
    cause: "Vật thể di chuyển nhanh trong khi màn trập đang mở, hoặc tay người chụp bị rung lắc khi chụp tốc độ chậm.",
    visualSign: "Các chi tiết bị kéo vệt mờ song song theo hướng chuyển động (vệt bóng mờ)."
  },
  4: {
    code: 4,
    nameVn: "Khuếch tán màu",
    nameEn: "Color diffusion",
    summary: "Màu sắc bị lan tỏa, lem màu sang các vùng lân cận làm mất ranh giới màu tự nhiên.",
    cause: "Do cảm biến màu bị nhiễu chéo (cross-talk) giữa các điểm ảnh hoặc thuật toán nội suy màu (demosaicing) kém.",
    visualSign: "Ranh giới giữa các khối màu bị lem, nhòe màu sắc ra ngoài đường viền vật thể."
  },
  5: {
    code: 5,
    nameVn: "Lệch màu",
    nameEn: "Color shift",
    summary: "Toàn bộ tông màu của bức ảnh bị lệch hoặc ám hẳn sang một dải màu bất thường.",
    cause: "Thiết lập cân bằng trắng (White Balance) không chính xác, cảm biến bị lệch bước sóng hoặc bộ lọc màu lỗi.",
    visualSign: "Ảnh bị ám sắc rõ rệt (ví dụ toàn bộ ảnh ám vàng, ám xanh lơ, hoặc ám tím đỏ) làm sai lệch màu da và cảnh quan."
  },
  6: {
    code: 6,
    nameVn: "Lượng tử hóa màu",
    nameEn: "Color quantization",
    summary: "Giảm mạnh số lượng màu khả dụng trong ảnh, biến các dải chuyển màu thành từng vệt phẳng.",
    cause: "Giảm độ sâu bit màu (ví dụ từ 24-bit TrueColor xuống 256 màu 8-bit hoặc bảng màu giới hạn).",
    visualSign: "Xuất hiện các mảng màu phẳng với đường ranh giới thô thiển (posterization / color banding) trên nền trời hay mặt da."
  },
  7: {
    code: 7,
    nameVn: "Giảm bão hòa màu nhạt đi",
    nameEn: "Color saturation 1 (Desaturation)",
    summary: "Độ tươi của màu sắc bị suy giảm, khiến bức ảnh trông nhợt nhạt và thiếu sức sống.",
    cause: "Bộ lọc xử lý ảnh làm giảm độ bão hòa (Saturation), hoặc do ánh sáng chụp bị tán xạ mạnh làm trôi màu.",
    visualSign: "Màu sắc bị xỉn, bạc màu, các gam màu đỏ, xanh, vàng mất độ tươi và tiệm cận dần về ảnh xám (grayscale)."
  },
  8: {
    code: 8,
    nameVn: "Tăng bão hòa màu rực rỡ",
    nameEn: "Color saturation 2 (Over-saturation)",
    summary: "Cường độ màu sắc bị đẩy lên quá mức khiến màu trở nên chói gắt, bết dính và phi thực tế.",
    cause: "Thuật toán tăng độ rực màu quá đà (vivid/boosted saturation) vượt quá dải hiển thị màu chuẩn.",
    visualSign: "Màu sắc chói lọi, các vùng màu đỏ/vàng/xanh bị bết đặc (clipping), mất chi tiết khối và đường nét bên trong mảng màu."
  },
  9: {
    code: 9,
    nameVn: "Lỗi nén JPEG2000",
    nameEn: "JPEG2000 compression",
    summary: "Biến dạng sinh ra do thuật toán nén ảnh chuẩn sóng con (Wavelet Transform).",
    cause: "Nén ảnh JPEG2000 với tỷ lệ nén quá cao làm lược bỏ các hệ số tần số cao.",
    visualSign: "Ảnh xuất hiện các gợn sóng mờ dạng quầng, chi tiết nhỏ bị xóa nhòa mượt nhưng để lại vết nhòe đặc trưng của wavelet."
  },
  10: {
    code: 10,
    nameVn: "Lỗi nén JPEG / Vỡ khối",
    nameEn: "JPEG compression / Blocking",
    summary: "Biến dạng điển hình của chuẩn nén JPEG dựa trên biến đổi DCT (Discrete Cosine Transform).",
    cause: "Nén ảnh với hệ số chất lượng (Quality factor) thấp, lượng tử hóa mạnh các ma trận 8x8 pixel.",
    visualSign: "Bức ảnh bị phân thành các ô vuông khối bàn cờ 8x8 (blockiness) và có viền muỗi râm ran quanh các đường viền sắc nét."
  },
  11: {
    code: 11,
    nameVn: "Nhiễu trắng",
    nameEn: "White noise (Additive Gaussian)",
    summary: "Nhiễu ngẫu nhiên phân bố đều trên toàn bộ không gian ảnh với phổ tần số phẳng.",
    cause: "Nhiễu nhiệt điện tử trong cảm biến ảnh, mạch khuếch đại tín hiệu analog hoặc nhiễu đường truyền.",
    visualSign: "Toàn bộ bức ảnh như có một lớp sương hạt mịn phủ lên, làm giảm độ tương phản và che khuất chi tiết mịn."
  },
  12: {
    code: 12,
    nameVn: "Nhiễu hạt trên kênh màu",
    nameEn: "White noise in color component",
    summary: "Nhiễu hạt xuất hiện chủ yếu trên các kênh sắc độ (Chrominance: Cb, Cr hoặc U, V).",
    cause: "Chụp ảnh trong điều kiện ánh sáng yếu với độ nhạy ISO cao, cảm biến khuếch đại tín hiệu màu yếu.",
    visualSign: "Xuất hiện các đốm hạt lốm đốm màu xanh lá, đỏ hoặc tím bất thường rải rác, đặc biệt thấy rõ trên các mảng màu đồng nhất."
  },
  13: {
    code: 13,
    nameVn: "Nhiễu xung / Muối tiêu",
    nameEn: "Impulse noise / Salt & Pepper",
    summary: "Các điểm ảnh ngẫu nhiên bị chuyển đột ngột thành màu trắng tinh hoặc đen tuyền cực đoan.",
    cause: "Lỗi trong quá trình chuyển đổi tương tự - số (ADC), hạt photon đánh bật cảm biến hoặc lỗi rớt gói tin bit dữ liệu.",
    visualSign: "Các chấm đốm đen và trắng nhỏ li ti rải rác khắp bề mặt ảnh trông giống như rắc hạt muối và tiêu."
  },
  14: {
    code: 14,
    nameVn: "Nhiễu nhân / Đốm hạt",
    nameEn: "Multiplicative noise / Speckle",
    summary: "Nhiễu có biên độ tỷ lệ thuận với cường độ sáng của từng điểm ảnh (vùng sáng bị nhiễu mạnh hơn).",
    cause: "Giao thoa sóng tán xạ kết hợp trong các hệ thống thu nhận hình ảnh như ảnh siêu âm, ảnh radar viễn thám (SAR), ảnh laser.",
    visualSign: "Đốm hạt nổi hạt thô trên các vùng sáng, trong khi các vùng tối hạt nhiễu lại rất nhỏ hoặc mờ."
  },
  15: {
    code: 15,
    nameVn: "Khử nhiễu quá mức làm mất chi tiết",
    nameEn: "Denoising artifact",
    summary: "Hậu quả của việc áp dụng thuật toán khử nhiễu (Denoising Filter) quá mạnh tay.",
    cause: "Bộ lọc trung bình (Median filter, Bilateral, BM3D, Deep Learning) làm sạch nhiễu nhưng xóa luôn chi tiết vi mô.",
    visualSign: "Bề mặt trông bóng bẩy, mịn màng như phủ sáp hoặc nhựa hóa (waxy look), sợi tóc và vân da bị bết dính biến mất."
  },
  16: {
    code: 16,
    nameVn: "Phơi sáng quá mức / Dư sáng",
    nameEn: "Brighten / Overexposure",
    summary: "Bức ảnh nhận lượng ánh sáng quá nhiều khiến toàn cảnh bị sáng chói.",
    cause: "Thời gian mở màn trập quá lâu, khẩu độ quá lớn hoặc thiết lập độ bù phơi sáng (EV) quá cao.",
    visualSign: "Các vùng sáng bị cháy trắng (highlight blowout/clipping), mất hoàn toàn các chi tiết vân mây, vải vóc hoặc bề mặt phản quang."
  },
  17: {
    code: 17,
    nameVn: "Thiếu sáng",
    nameEn: "Darken / Underexposure",
    summary: "Lượng ánh sáng vào cảm biến không đủ làm cho toàn bộ bức ảnh bị tối tăm.",
    cause: "Chụp ảnh với tốc độ màn trập quá nhanh, thiếu đèn trợ sáng hoặc khẩu độ khép quá sâu.",
    visualSign: "Toàn bộ ảnh ngả màu u tối, các chi tiết trong vùng bóng tối chìm hoàn toàn vào màu đen (crushed shadows)."
  },
  18: {
    code: 18,
    nameVn: "Lệch độ sáng trung bình",
    nameEn: "Mean shift",
    summary: "Giá trị độ sáng trung bình của toàn thể bức ảnh bị dịch chuyển bất thường.",
    cause: "Lỗi hiệu chỉnh độ lợi (gain calibration) của thiết bị thu nhận tín hiệu hoặc dịch chuyển offset điểm 0 của cảm biến.",
    visualSign: "Ảnh trông như bị phủ một màn sương mờ xám hoặc bị thay đổi mức sáng nền chung nhưng độ tương phản cục bộ không đổi."
  },
  19: {
    code: 19,
    nameVn: "Nhiễu răng cưa / Rung ảnh",
    nameEn: "Jitter",
    summary: "Các đường viền ngang dọc bị gợn sóng, răng cưa giật cục theo từng dòng quét.",
    cause: "Lỗi đồng bộ xung nhịp quét dòng (sync pulse) trong camera analog hoặc rung chấn cơ học của cảm biến.",
    visualSign: "Các đường thẳng bị bẻ cong gãy khúc li ti, mép ảnh xuất hiện viền răng cưa rung rinh không liên tục."
  },
  20: {
    code: 20,
    nameVn: "Biến dạng mảng cục bộ",
    nameEn: "Non-eccentricity patch",
    summary: "Xuất hiện các đốm hoặc mảng hoa văn dị thường tại một số vùng cục bộ trên ảnh.",
    cause: "Bụi bẩn bám trên thấu kính/cảm biến, khuyết tật lớp phủ quang học hoặc lỗi ô nhớ cục bộ của chip xử lý.",
    visualSign: "Các vết ố, đốm quầng mờ hoặc mảng cấu trúc biến dạng xuất hiện bất thường ở một vài vị trí cố định trên ảnh."
  },
  21: {
    code: 21,
    nameVn: "Vỡ hạt Pixel",
    nameEn: "Pixelate",
    summary: "Độ phân giải hiển thị bị giảm cục bộ hoặc toàn phần, gom nhiều pixel thành các ô vuông to.",
    cause: "Thuật toán nội suy điểm gần nhất (Nearest Neighbor) khi phóng to ảnh hoặc xử lý làm mờ che thông tin (mosaic).",
    visualSign: "Hình ảnh bị vỡ hạt thô, các vật thể trông như khối xếp hình LEGO với các góc cạnh vuông sắc nhọn."
  },
  22: {
    code: 22,
    nameVn: "Lượng tử hóa / Phân dải màu",
    nameEn: "Quantization",
    summary: "Sai số làm tròn khi chuyển đổi các mức tín hiệu liên tục thành các giá trị số hữu hạn.",
    cause: "Giảm số lượng bit mã hóa mức sáng của tín hiệu ảnh (ADC resolution bit truncation).",
    visualSign: "Xuất hiện các đường viền phân tầng bậc thang rõ rệt (contouring artifacts) tại những vùng chuyển tiếp ánh sáng mềm mại."
  },
  23: {
    code: 23,
    nameVn: "Vỡ khối màu",
    nameEn: "Color block",
    summary: "Các mảng màu lớn hình chữ nhật hoặc hình vuông bị sai màu hoặc mất chi tiết đột ngột.",
    cause: "Lỗi giải mã gói tin dữ liệu luồng video/ảnh bị gián đoạn, rớt khung hình hoặc lỗi bộ nhớ đệm (buffer corrupt).",
    visualSign: "Xuất hiện các khối hộp màu xanh, hồng hoặc xám kỳ dị nằm đè lên khung cảnh của bức ảnh."
  },
  24: {
    code: 24,
    nameVn: "Tăng sắc nét quá mức / Viền quầng",
    nameEn: "High sharpen",
    summary: "Áp dụng thuật toán làm nét ảnh (High Sharpening / Unsharp Masking) với cường độ quá lớn.",
    cause: "Khuếch đại độ tương phản cạnh biên quá đà để đánh lừa mắt nhìn về độ sắc nét.",
    visualSign: "Quanh mép viền các vật thể xuất hiện các vệt quầng sáng trắng hoặc viền tối đậm (halo artifacts), làm ảnh bị gắt và nhân tạo."
  },
  25: {
    code: 25,
    nameVn: "Thay đổi độ tương phản",
    nameEn: "Contrast change",
    summary: "Sự phân bố dải tương phản giữa vùng sáng nhất và tối nhất bị co cụm hoặc giãn nở quá mức.",
    cause: "Hiệu chỉnh đường cong Gamma hoặc cân chỉnh dải tương phản (Histogram stretching/equalization) không phù hợp.",
    visualSign: "Ảnh có thể bị mờ đục xám xịt (khi giảm tương phản) hoặc quá gắt gao mất chi tiết trung gian (khi tăng tương phản quá cao)."
  }
};

