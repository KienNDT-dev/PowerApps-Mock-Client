// @ts-check
import { z } from "zod";

/** Safe-parse helper that throws on invalid data. */
export function parseOrThrow(schema, data, context = "validation") {
  const res = schema.safeParse(data);
  if (!res.success) {
    console.error(`[Zod:${context}]`, res.error.format());
    throw new Error("Invalid data shape received from server");
  }
  return res.data;
}

/** ISO-8601 datetime string -> Date */
export const isoDate = z.iso.datetime().transform((s) => new Date(s));

/** Public env validation (Vite) */
export const envSchema = z.object({
  VITE_API_URL: z.url({ normalize: true }).optional(),
});
