import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1"
});

export interface UploadResponse {
  task_id: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  progress?: string;
}

export interface SlideElement {
  slide: number;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TaskResultResponse {
  task_id: string;
  status: string;
  result?: {
    output_path: string;
    elements: SlideElement[];
  };
}

export const uploadFile = async (
  file: File,
  sourceLang: string,
  targetLang: string,
  engine: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_lang", sourceLang);
  formData.append("target_lang", targetLang);
  formData.append("engine", engine);

  const response = await client.post<UploadResponse>("/translate", formData);
  return response.data;
};

export const getTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
  const response = await client.get<TaskStatusResponse>(`/tasks/${taskId}`);
  return response.data;
};

export const getSlideDetails = async (taskId: string): Promise<TaskResultResponse> => {
  const response = await client.get<TaskResultResponse>(`/tasks/${taskId}/result`);
  return response.data;
};

export const submitFeedback = async (payload: {
  slide_id: string;
  corrected_text: string;
  corrected_bounding_boxes: SlideElement[];
  user_rating: number;
}): Promise<void> => {
  await client.post("/feedback", payload);
};
