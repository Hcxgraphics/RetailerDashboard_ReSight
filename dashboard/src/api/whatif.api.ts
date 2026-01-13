import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export interface WhatIfPriceRequest {
  itemId: string;
  newPrice: number;
}

export interface WhatIfPriceResponse {
  rankChange: number;
}

export const simulatePriceChange = async (
  itemId: string,
  newPrice: number
): Promise<WhatIfPriceResponse> => {
  const res = await axios.post(`${API}/whatif/price`, {
    itemId,
    newPrice,
  });
  return res.data;
};
