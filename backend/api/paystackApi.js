require("dotenv").config();
const {
  convertObjectFromSnakeToCamelCase,
} = require("../utils/snakeToCamelCase");
const BaseApi = require("./baseApi");

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const paystackUrl = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

class PaystackApi extends BaseApi {
  constructor() {
    super(paystackUrl);
    this.requestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paystackSecret}`,
      },
    };
  }

  initializePayment = async (paymentDetails) => {
    const response = await this.post(
      "/transaction/initialize",
      paymentDetails,
      undefined,
      this.requestInit
    );

    return convertObjectFromSnakeToCamelCase(response.data);
  };

  verifyPayment = async (reference) => {
    if (!reference) {
      throw new Error("Reference is required for verification");
    }

    try {
      const response = await this.get(
        `/transaction/verify/${encodeURIComponent(reference)}`,
        undefined,
        this.requestInit
      );

      if (!response || response.status === "error") {
        throw new Error(response?.message || "Verification failed");
      }

      return {
        status: response.status || "success",
        data: convertObjectFromSnakeToCamelCase(response.data || response),
      };
    } catch (error) {
      console.error("Paystack verification API error:", error);
      throw error;
    }
  };
}

module.exports = new PaystackApi();
