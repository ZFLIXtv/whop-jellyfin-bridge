import axios, { AxiosRequestConfig } from "axios";
import { env } from "@/lib/env";

let cachedToken: string | null = null;

async function loginAndGetToken(): Promise<string> {
  const basicAuth = Buffer.from(
    `${env.JFA_USERNAME}:${env.JFA_PASSWORD}`
  ).toString("base64");

  const response = await axios.post(
    `${env.JFA_BASE_URL}/token/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const token = response.data?.token;

  if (!token || typeof token !== "string") {
    throw new Error("JFA token login succeeded but no token was returned");
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
) {
  const token = await getJfaToken();

  try {
    const response = await axios.request<T>({
      baseURL: env.JFA_BASE_URL,
      timeout: 15000,
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
    });

    return response;
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