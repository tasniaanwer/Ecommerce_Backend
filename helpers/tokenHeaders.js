// helpers/tokenHeaders.js
import bkashConfig from "../config/bkashConfig.json" assert { type: "json" };

export const tokenHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  username: bkashConfig.username,
  password: bkashConfig.password,
});
