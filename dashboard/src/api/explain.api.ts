import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export interface SHAPExplanation {
  price?: number;
  stock?: number;
  recency?: number;
  popularity?: number;
  category?: number;
  [key: string]: number | undefined;
}

export const explainItem = async (itemId: string): Promise<SHAPExplanation> => {
  const res = await axios.get(`${API}/explain/${itemId}`);
  return res.data;
};
