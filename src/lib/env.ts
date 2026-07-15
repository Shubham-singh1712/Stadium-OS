export function validateEnv() {
  const required = ["GEMINI_API_KEY"];
  for (const envName of required) {
    if (!process.env[envName]) {
      console.warn(`Environment variable validation warning: ${envName} is not set.`);
    }
  }
}
