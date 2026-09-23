export interface TopDistortion {
  code: number;
  name: string;
  probability: number;
}

export interface GroundTruth {
  dmos: number | null;
  noise_code: number | null;
  noise_name: string | null;
}

export interface RatingInfo {
  label: string;
  color: string;
  badge: string;
}

export interface EvaluationResult {
  id: string;
  filename: string;
  image_url: string;
  width: number;
  height: number;
  file_size_kb: number;
  predicted_mos: number;
  rating: RatingInfo;
  noise_code: number;
  noise_name: string;
  confidence: number;
  top_distortions: TopDistortion[];
  ground_truth: GroundTruth | null;
  created_at: string;
}

export interface SampleImage {
  filename: string;
  title: string;
  dmos: number | null;
  noise_code: number | null;
}

export interface ServerStatus {
  status: string;
  device: string;
  cuda_available: boolean;
  model_name: string;
  checkpoint: string;
  num_distortions: number;
}

