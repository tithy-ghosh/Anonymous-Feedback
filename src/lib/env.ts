import { z } from "zod"

const envSchema = z.object({
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  EMAIL_USER: z.string().email("EMAIL_USER must be a valid Gmail address"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment variables")
}

export const env = parsed.data