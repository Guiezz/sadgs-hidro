const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "NEXT_PUBLIC_API_URL não definida. Configure a variável de ambiente no Vercel.",
  );
}

export const config = {
  apiBaseUrl:
    API_URL || "https://drought-plan-dashboard-api.onrender.com/api",
};
