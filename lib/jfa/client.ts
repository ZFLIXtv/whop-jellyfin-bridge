import axios from "axios";
import { env } from "@/lib/env";

export const jfaClient = axios.create({
  baseURL: env.JFA_BASE_URL,
  headers: {
    Authorization: `Bearer ${env.JFA_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 15000,
});