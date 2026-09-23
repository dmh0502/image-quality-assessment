import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
  Info,
  BookOpen
} from 'lucide-react';
import type { EvaluationResult } from '../types';
import { KADID_DISTORTIONS_DETAIL } from '../constants';

interface ResultCardProps {
  result: EvaluationResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // Trạng thái bật/tắt định nghĩa cho từng mã lỗi
  const [expandedDefinitions, setExpandedDefinitions] = useState<Record<number, boolean>>({});

  const toggleDefinition = (code: number) => {
    setExpandedDefinitions((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Tính tỷ lệ % cho thanh điểm MOS (từ 1.0 đến 5.0)
  const mosPercent = Math.min(100, Math.max(0, ((result.predicted_mos - 1.0) / 4.0) * 100));

  // Kiểm tra độ lệch với ground truth nếu có
  const groundTruth = result.ground_truth;
  const mosDiff = groundTruth && groundTruth.dmos !== null
    ? Math.abs(groundTruth.dmos - result.predicted_mos)
    : null;

  const isDistortionCorrect = groundTruth && groundTruth.noise_code !== null
    ? groundTruth.noise_code === result.noise_code
    : null;

  // Lấy màu sắc dựa trên điểm MOS
  const getMosColor = (score: number) => {
    if (score >= 4.0) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/40', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (score >= 3.2) return { text: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500/40', badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
    if (score >= 2.4) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/40', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    if (score >= 1.6) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/40', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/40', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const mosTheme = getMosColor(result.predicted_mos);

  // Khung hiển thị chi tiết định nghĩa mã lỗi
  const renderDefinitionBox = (code: number) => {
    const info = KADID_DISTORTIONS_DETAIL[code];
    if (!info) return null;

    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-200 space-y-2 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
          <span className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[13px]">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Định nghĩa mã #{code}: {info.nameVn} ({info.nameEn})
          </span>
          <button
            type="button"
            onClick={() => toggleDefinition(code)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Đóng ✕
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed">
          <span className="text-indigo-400 font-semibold">📌 Khái niệm: </span>
          {info.summary}
        </p>

        <p className="text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">⚙️ Nguyên nhân phát sinh: </span>
          {info.cause}
        </p>

        <p className="text-slate-300 leading-relaxed">
          <span className="text-emerald-400 font-semibold">👁️ Dấu hiệu trực quan: </span>
          {info.visualSign}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Kết Quả Đánh Giá Chi Tiết
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mã định danh: <span className="font-mono text-slate-300">{result.id.slice(0, 8)}</span> • Thời gian: {result.created_at}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border font-medium ${mosTheme.badge}`}>
          {result.rating.label}
        </span>
      </div>

      {/* Grid: Ảnh xem trước & 2 chỉ số cốt lõi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Khung ảnh */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center relative group">
            <img
              src={result.image_url}
              alt={result.filename}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Metadata ảnh */}
          <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Tên file</span>
              <span className="font-medium text-slate-300 truncate block" title={result.filename}>
                {result.filename}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Độ phân giải</span>
              <span className="font-medium text-slate-300">{result.width} × {result.height}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase">Dung lượng</span>
              <span className="font-medium text-slate-300">{result.file_size_kb} KB</span>
            </div>
          </div>
        </div>

        {/* Khung chỉ số AI */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Điểm MOS Regression Card */}
          <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Điểm Chất Lượng MOS (Regression)
              </span>
              <span className="text-xs text-slate-400 font-mono">Thang điểm: 1.00 - 5.00</span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className={`text-4xl font-extrabold tracking-tight ${mosTheme.text}`}>
                {result.predicted_mos.toFixed(2)}
              </span>
              <span className="text-slate-400 text-sm font-medium">/ 5.00</span>
              <span className={`ml-auto text-xs px-2.5 py-1 rounded-md border font-semibold ${mosTheme.badge}`}>
                {result.rating.label}
              </span>
            </div>

            {/* Thanh tiến trình MOS */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 relative">
              <div
                className={`h-full transition-all duration-700 rounded-full ${mosTheme.bg}`}
                style={{ width: `${mosPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1.0 (Rất tệ)</span>
              <span>3.0 (Trung bình)</span>
              <span>5.0 (Hoàn hảo)</span>
            </div>
          </div>

          {/* Phân loại Lỗi / Biến dạng Card */}
          <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Nhận Diện Lỗi Biến Dạng (Classification)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Mã lỗi: #{result.noise_code}
              </span>
            </div>

            {/* Lỗi được nhận diện chính */}
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{result.noise_name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Độ tự tin dự đoán: <span className="font-semibold text-indigo-400">{result.confidence}%</span>
                </p>
              </div>

              {/* Nút biểu tượng chữ i xem định nghĩa cho lỗi chính */}
              <button
                type="button"
                onClick={() => toggleDefinition(result.noise_code)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  expandedDefinitions[result.noise_code]
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400/50'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500/50'
                }`}
                title={expandedDefinitions[result.noise_code] ? 'Bấm để tắt định nghĩa' : 'Bấm để xem định nghĩa mã lỗi này'}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Hiển thị định nghĩa của lỗi chính nếu được bật */}
            {expandedDefinitions[result.noise_code] && renderDefinitionBox(result.noise_code)}

            {/* Danh sách Top phân bố xác suất lỗi */}
            {result.top_distortions && result.top_distortions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2.5">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Top phân bố xác suất lỗi:
                </span>

                {result.top_distortions.map((item) => {
                  const isExpanded = !!expandedDefinitions[item.code];
                  return (
                    <div
                      key={item.code}
                      className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                        <span className="font-medium text-slate-200 text-xs truncate">
                          #{item.code} - {item.name}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-slate-300 font-semibold text-xs">
                            {item.probability}%
                          </span>

                          {/* Nút biểu tượng chữ i xem/tắt định nghĩa trên từng hàng */}
                          <button
                            type="button"
                            onClick={() => toggleDefinition(item.code)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400/50'
                                : 'bg-slate-800/90 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/50'
                            }`}
                            title={isExpanded ? 'Bấm để tắt định nghĩa' : 'Bấm để xem định nghĩa mã lỗi này'}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Thanh phần trăm xác suất */}
                      <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.code === result.noise_code ? 'bg-indigo-500' : 'bg-slate-600'
                          }`}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>

                      {/* Khối định nghĩa bung ra khi người dùng bấm nút */}
                      {isExpanded && renderDefinitionBox(item.code)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bảng đối chiếu Ground Truth (Nếu có trong tập KADID-10k) */}
      {groundTruth && (groundTruth.dmos !== null || groundTruth.noise_code !== null) && (
        <div className="bg-slate-950/70 rounded-xl p-5 border border-indigo-500/20 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Bảng Đối Chiếu: AI Dự Đoán vs Ground Truth (Dữ liệu thực tế KADID-10k)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* So sánh điểm MOS */}
            {groundTruth.dmos !== null && (
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block uppercase font-medium">Điểm MOS:</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm text-slate-300">Thực tế: <b className="text-white">{groundTruth.dmos.toFixed(2)}</b></span>
                  <span className="text-slate-500">|</span>
                  <span className="text-sm text-slate-300">AI: <b className={mosTheme.text}>{result.predicted_mos.toFixed(2)}</b></span>
                </div>
                {mosDiff !== null && (
                  <div className="mt-2 text-xs flex items-center gap-1.5">
                    <span className="text-slate-400">Sai số tuyệt đối:</span>
                    <span className="font-mono font-bold text-slate-200">{mosDiff.toFixed(2)} điểm</span>
                    {mosDiff <= 0.5 ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                        🌟 Rất chuẩn (mắt người khó phân biệt)
                      </span>
                    ) : mosDiff <= 1.0 ? (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                        👍 Chấp nhận được
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium">
                        ⚠️ Lệch nhiều
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* So sánh loại lỗi */}
            {groundTruth.noise_code !== null && (
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block uppercase font-medium">Loại Lỗi Biến Dạng:</span>
                <div className="mt-1 text-xs space-y-1">
                  <p className="text-slate-300 truncate">
                    Thực tế: <span className="font-semibold text-white">#{groundTruth.noise_code} - {groundTruth.noise_name}</span>
                  </p>
                  <p className="text-slate-300 truncate">
                    AI: <span className="font-semibold text-indigo-300">#{result.noise_code} - {result.noise_name}</span>
                  </p>
                </div>
                <div className="mt-2 text-xs flex items-center gap-1.5">
                  <span className="text-slate-400">Đánh giá phân loại:</span>
                  {isDistortionCorrect ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Sai khác
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
