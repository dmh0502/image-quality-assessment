import type { EvaluationResult, SampleImage, ServerStatus } from './types';

const API_BASE = '';

export async function getServerStatus(): Promise<ServerStatus> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error('Không thể kết nối với máy chủ API');
  return res.json();
}

export async function uploadAndPredict(file: File): Promise<EvaluationResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi không xác định' }));
    throw new Error(errorData.detail || 'Lỗi khi chấm điểm ảnh');
  }

  return res.json();
}

export async function predictSampleImage(sampleFilename: string): Promise<EvaluationResult> {
  const res = await fetch(`${API_BASE}/api/predict-sample`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sample_filename: sampleFilename }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Lỗi không xác định' }));
    throw new Error(errorData.detail || 'Lỗi khi chấm điểm ảnh mẫu');
  }

  return res.json();
}

export async function getSampleImages(): Promise<SampleImage[]> {
  const res = await fetch(`${API_BASE}/api/samples`);
  if (!res.ok) throw new Error('Không thể lấy danh sách ảnh mẫu');
  return res.json();
}

export async function getHistory(): Promise<EvaluationResult[]> {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error('Không thể lấy lịch sử chấm điểm');
  return res.json();
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Không thể xóa bản ghi');
}

export async function clearAllHistory(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/history`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Không thể xóa toàn bộ lịch sử');
}
