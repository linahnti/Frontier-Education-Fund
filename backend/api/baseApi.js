const { StatusCodes } = require("http-status-codes");
const fetch = require("node-fetch");
const { BadRequestError } = require("../utils/apiError");

class BaseApi {
  constructor(url) {
    this.baseUrl = url;
  }

  fetch = async (url, body, args, requestInit) => {
    try {
      const urlObj = new URL(url, this.baseUrl);

      if (args) {
        urlObj.search = new URLSearchParams(args).toString();
      }

      const requestOptions = { ...requestInit, body };

      const response = await fetch(urlObj.toString(), requestOptions);

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new BadRequestError(errorMessage);
      }

      if (response.status === StatusCodes.NO_CONTENT) {
        return;
      }

      return response.json();
    } catch (e) {
      throw new BadRequestError(e.message);
    }
  };

  get = (url, args, requestInit) => {
    return this.fetch(url, undefined, args, { ...requestInit, method: "GET" });
  };

  post = (url, body, args, requestInit) => {
    const bodyString = body ? JSON.stringify(body) : undefined;

    return this.fetch(url, bodyString, args, {
      ...requestInit,
      method: "POST",
    });
  };
}

module.exports = BaseApi;
