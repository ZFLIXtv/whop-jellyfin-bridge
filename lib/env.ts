export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  WHOP_API_KEY: process.env.WHOP_API_KEY || "",
  WHOP_WEBHOOK_SECRET: process.env.WHOP_WEBHOOK_SECRET || "",
  WHOP_PRODUCT_ID: process.env.WHOP_PRODUCT_ID || "",
  WHOP_CHECKOUT_URL: process.env.WHOP_CHECKOUT_URL || "",
  JFA_BASE_URL: process.env.JFA_BASE_URL || "",
  JFA_API_KEY: process.env.JFA_API_KEY || "",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "",
};

export function assertEnv() {
  const required = [
    "DATABASE_URL",
    "WHOP_API_KEY",
    "WHOP_WEBHOOK_SECRET",
    "WHOP_PRODUCT_ID",
    "WHOP_CHECKOUT_URL",
    "JFA_BASE_URL",
    "JFA_API_KEY",
    "ADMIN_API_KEY",
  ] as const;

  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}