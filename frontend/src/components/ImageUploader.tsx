import React, { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import type { SampleImage } from '../types';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sampleFilename: string) => void;
  samples: SampleImage[];
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFileSelect,
  onSampleSelect,
  samples,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-400" />
          Tải Ảnh Lên Để Chấm Điểm
        </h2>
        <span className="text-xs text-slate-400">Hỗ trợ JPG, PNG, WEBP</span>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-900/40'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp"
          className="hidden"
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-200">AI đang xử lý và phân tích chất lượng ảnh...</p>
            <p className="text-xs text-slate-400 mt-1">Đang trích xuất đặc trưng & áp dụng Spatial Attention</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400 shadow-inner">
              <ImageIcon className="w-7 h-7" />
            </div>
            <p className="text-sm font-medium text-slate-200">
              Kéo & thả ảnh vào đây, hoặc <span className="text-indigo-400 underline decoration-indigo-400/50">bấm để chọn ảnh từ máy</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Mô hình sẽ tự động trích xuất điểm chất lượng MOS và phân loại 25 dạng nhiễu
            </p>
          </div>
        )}
      </div>

      {/* Quick Sample Selector */}
      {samples.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hoặc thử nghiệm nhanh với ảnh mẫu KADID-10k:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample.filename}
                type="button"
                disabled={isLoading}
                onClick={() => onSampleSelect(sample.filename)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{sample.filename}</span>
                {sample.dmos !== null && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    MOS: {sample.dmos}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
