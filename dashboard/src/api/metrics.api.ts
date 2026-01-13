import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export interface Metrics {
  revenue: number;
  revenueChange: number;
  views: number;
  viewsChange: number;
  clicks: number;
  clicksChange: number;
  activeProducts: number;
  avgOrderValue: number;
}

export const fetchMetrics = async (): Promise<Metrics> => {
  const res = await axios.get(`${API}/metrics`);
  return res.data;
};
