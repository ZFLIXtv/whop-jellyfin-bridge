import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/lib/env";

const JFA_BASE_URL = env.JFA_BASE_URL.replace(/\/+$/, "");

let cachedToken: string | null = null;

async function loginAndGetToken(): Promise<string> {
  const basicAuth = Buffer.from(
    `${env.JFA_USERNAME}:${env.JFA_PASSWORD}`
  ).toString("base64");

const response = await axios.get(`${JFA_BASE_URL}/token/login`, {
        headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    timeout: 15000,
  });

  const token = response.data?.token;

  if (!token || typeof token !== "string") {
    throw new Error("JFA login succeeded but no token was returned");
  }

  cachedToken = token;
  return token;
}

export async function getJfaToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  return loginAndGetToken();
}

export async function jfaRequest<T = any>(
  config: AxiosRequestConfig,
  retry = true
): Promise<AxiosResponse<T>> {
  const token = await getJfaToken();

  try {
    return await axios.request<T>({
      baseURL: JFA_BASE_URL,
      timeout: 15000,
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
    });
  } catch (error: any) {
    const status = error?.response?.status;

    if (retry && status === 401) {
      cachedToken = null;
      const refreshedToken = await loginAndGetToken();

      return axios.request<T>({
        baseURL: env.JFA_BASE_URL,
        timeout: 15000,
        ...config,
        headers: {
          Authorization: `Bearer ${refreshedToken}`,
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
      });
    }

    throw error;
  }
}