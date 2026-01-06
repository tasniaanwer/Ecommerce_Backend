// utils/response.js
import { getReasonPhrase } from "http-status-codes";

export const response = (res, code, status, data, message) => {
  if (!message) {
    message = getReasonPhrase(code);
  }
  return res.status(code).json({
    status: status,
    data: data,
    message: message,
  });
};
