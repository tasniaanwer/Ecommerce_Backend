// utils/grantToken.js
import bkashConfig from "../config/bkashConfig.json" assert { type: "json" };
import fetch from "node-fetch";
import { setGlobalIdToken } from "../helpers/globalData.js";
import { StatusCodes } from "http-status-codes";
import { response } from "./response.js";
import { tokenHeaders } from "../helpers/tokenHeaders.js";

export const grantToken = async (req, res, next) => {
  console.log("Grant Token API Start !!");
  try {
    const tokenResponse = await fetch(bkashConfig.grant_token_url, {
      method: "POST",
      headers: tokenHeaders(),
      body: JSON.stringify({
        app_key: bkashConfig.app_key,
        app_secret: bkashConfig.app_secret,
      }),
    });
    const tokenResult = await tokenResponse.json();

    setGlobalIdToken(tokenResult?.id_token);

    next();
  } catch (e) {
    console.log(e);
    return response(
      res,
      StatusCodes.UNAUTHORIZED,
      false,
      {},
      "You are not allowed"
    );
  }
};
