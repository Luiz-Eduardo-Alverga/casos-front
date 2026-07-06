import axios, { type AxiosInstance } from "axios";
import { getSoftcomCloudConfig } from "./config";

let client: AxiosInstance | null = null;

export function getSoftcomCloudApi(): AxiosInstance {
  if (!client) {
    const { baseURL, apiKey } = getSoftcomCloudConfig();
    client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },
    });
  }
  return client;
}
