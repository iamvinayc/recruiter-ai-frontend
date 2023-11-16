import { config } from "dotenv";
import z from "zod";

config({ path: ".env" });
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
});
// eslint-disable-next-line no-undef
envSchema.parse(process.env);
