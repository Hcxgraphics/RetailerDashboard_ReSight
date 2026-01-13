import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export interface PinRuleRequest {
  itemId: string;
}

export interface BoostClearanceRuleRequest {
  // Optional: can include category or other filters
  category?: string;
}

export const pinItem = async (itemId: string): Promise<void> => {
  await axios.post(`${API}/rules/pin`, { itemId });
};

export const boostClearance = async (category?: string): Promise<void> => {
  await axios.post(`${API}/rules/boost-clearance`, { category });
};
