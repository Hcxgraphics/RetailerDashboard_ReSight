import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export interface RankingItem {
  item_id: string;
  score: number;
  // optional fields if backend sends them
  views?: number;
  clicks?: number;
  revenue?: number;
  category?: string;
  name?: string;
  imageUrl?: string;
}

export const fetchRankedItems = async (): Promise<RankingItem[]> => {
  const res = await axios.post(`${API}/rank`, {
    user_id: "U123",
    items: [] // backend will load items for user
  });

  // Handle both direct array response and wrapped response
  if (Array.isArray(res.data)) {
    return res.data as RankingItem[];
  }
  if (res.data.recommendations && Array.isArray(res.data.recommendations)) {
    return res.data.recommendations as RankingItem[];
  }
  
  // Fallback: return empty array if format is unexpected
  console.warn('Unexpected response format from /rank endpoint:', res.data);
  return [];
};
