export function validateEnv() {
  const required = ["GEMINI_API_KEY"];
  for (const envName of required) {
    if (!process.env[envName]) {
      const msg = `Missing required environment variable: ${envName}`;
      if (process.env.NODE_ENV === "production") {
        throw new TypeError(msg);
      } else {
        console.warn(`[StadiumOS] ${msg}`);
      }
    }
  }
}
