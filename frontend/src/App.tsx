import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import {
  getServerStatus,
  getSampleImages,
  getHistory,
  uploadAndPredict,
  predictSampleImage,
  deleteHistoryItem,
  clearAllHistory,
} from './api';
import type { EvaluationResult, SampleImage, ServerStatus } from './types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [history, setHistory] = useState<EvaluationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Khởi tạo và nạp dữ liệu ban đầu
  const initApp = async () => {
    try {
      const status = await getServerStatus();
      setServerStatus(status);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    }

    try {
      const [sampleList, historyList] = await Promise.all([
        getSampleImages().catch(() => []),
        getHistory().catch(() => []),
      ]);
      setSamples(sampleList);
      setHistory(historyList);
      if (historyList.length > 0) {
        setCurrentResult(historyList[0]);
      }
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu:', err);
    }
  };

  useEffect(() => {
    initApp();
    // Thăm dò định kỳ server status mỗi 15 giây
    const interval = setInterval(async () => {
      try {
        const status = await getServerStatus();
        setServerStatus(status);
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý tải ảnh từ máy
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await uploadAndPredict(file);
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.filter((h) => h.id !== result.id)]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi chấm điểm ảnh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chọn ảnh mẫu KADID
  const handleSampleSelect = async (sampleFilename: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await predictSampleImage(sampleFilename);
      setCurrentResult(result);
      setHistory((prev) => [result, ...prev.filter((h) => h.id !== result.id)]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi chấm điểm ảnh mẫu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chọn mục trong lịch sử để xem lại
  const handleSelectItem = (item: EvaluationResult) => {
    setCurrentResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý xóa một mục trong lịch sử
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (currentResult?.id === id) {
        const remaining = history.filter((item) => item.id !== id);
        setCurrentResult(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể xóa mục này');
    }
  };

  // Xử lý xóa toàn bộ lịch sử
  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chấm điểm?')) return;
    try {
      await clearAllHistory();
      setHistory([]);
      setCurrentResult(null);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa lịch sử');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header status={serverStatus} serverOnline={serverOnline} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner cảnh báo nếu backend chưa bật */}
        {!serverOnline && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold">Không thể kết nối đến Backend Server (FastAPI)!</p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Vui lòng đảm bảo rằng bạn đã khởi chạy backend bằng lệnh: <code className="bg-rose-950/60 px-2 py-0.5 rounded font-mono text-rose-200">python server.py</code>
              </p>
            </div>
          </div>
        )}

        {/* Thông báo lỗi khi xử lý nếu có */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Bố cục 2 cột: Bên trái là Upload & Kết quả, bên phải là Lịch sử */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Upload & Kết quả */}
          <div className="lg:col-span-8 space-y-6">
            <ImageUploader
              onFileSelect={handleFileSelect}
              onSampleSelect={handleSampleSelect}
              samples={samples}
              isLoading={isLoading}
            />

            {currentResult && <ResultCard result={currentResult} />}
          </div>

          {/* Cột phải: Lịch sử chấm điểm */}
          <div className="lg:col-span-4 sticky top-24">
            <HistoryList
              history={history}
              selectedId={currentResult?.id || null}
              onSelectItem={handleSelectItem}
              onDeleteItem={handleDeleteItem}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>&copy; Mai Anh Luân - Dương Minh Hữu</p>
        <p>AI đánh giá chất lượng hình ảnh - Computer Vision 2026</p>
      </footer>
    </div>
  );
};

export default App;
