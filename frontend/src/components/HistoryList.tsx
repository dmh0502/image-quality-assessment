import React from 'react';
import { History, Trash2, ArrowRight, Clock, Image as ImageIcon } from 'lucide-react';
import type { EvaluationResult } from '../types';

interface HistoryListProps {
  history: EvaluationResult[];
  selectedId: string | null;
  onSelectItem: (item: EvaluationResult) => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}) => {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 shadow-xl backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Lịch Sử Chấm Điểm</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
            title="Xóa toàn bộ lịch sử"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa hết</span>
          </button>
        )}
      </div>

      {/* History Items Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[700px] scrollbar-thin scrollbar-thumb-slate-800">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">Chưa có ảnh nào được đánh giá</p>
            <p className="text-xs mt-1 text-slate-600">
              Hãy tải ảnh lên hoặc chọn ảnh mẫu để xem lịch sử
            </p>
          </div>
        ) : (
          history.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/60 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate" title={item.filename}>
                    {item.filename}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-bold text-white font-mono bg-slate-800 px-1.5 py-0.2 rounded">
                      MOS: {item.predicted_mos.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {item.noise_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{item.created_at.split(' ')[1] || item.created_at}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => onDeleteItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Xóa bản ghi này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
