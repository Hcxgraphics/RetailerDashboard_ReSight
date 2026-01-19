import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export interface AskAIRequest {
  question: string;
  context: {
    page: string;
    selected_item_id?: string | null;
    filters?: Record<string, any>;
  };
}

export interface AskAIResponse {
  answer: string;
}

export const askAI = async (request: AskAIRequest): Promise<string> => {
  const res = await axios.post<AskAIResponse>(`${API}/ask-ai`, request);
  return res.data.answer;
};
