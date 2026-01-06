import { StatusCodes } from "http-status-codes";
import fetch from "node-fetch";
import bkashConfig from "../config/bkashConfig.json" assert { type: "json" };
import { authHeaders } from "../helpers/authHeader.js";
import { response } from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";

export const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const result = await fetch(bkashConfig.create_payment_url, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({
        mode: "0011",
        payerReference: " ",
        callbackURL: bkashConfig.backend_callback_url,
        amount: amount || "1",
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: "Inv" + uuidv4(),
      }),
    });

    const data = await result.json();
    return response(res, StatusCodes.CREATED, true, { data }, "");
  } catch (error) {
    console.log(error);
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      "bKash payment failed"
    );
  }
};

export const bkashCallback = async (req, res) => {
  try {
    if (req.query.status === "success") {
      const { paymentID } = req.query;

      const executeResponse = await fetch(bkashConfig.execute_payment_url, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ paymentID }),
      });

      const result = await executeResponse.json();

      if (result.statusCode === "0000") {
        return res.redirect(
          `${bkashConfig.frontend_success_url}?msg=${result.statusMessage}`
        );
      }
    }
    return res.redirect(bkashConfig.frontend_fail_url);
  } catch (e) {
    return res.redirect(bkashConfig.frontend_fail_url);
  }
};
