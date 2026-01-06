// helpers/authHeader.js
import { getGlobalIdToken } from "./globalData.js";
import bkashConfig from "../config/bkashConfig.json" assert { type: "json" };

export const authHeaders = async () => {
  const token = await getGlobalIdToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: token,
    "x-app-key": bkashConfig.app_key,
  };
};
