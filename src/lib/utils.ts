import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeArrayParse = (e: string) => {
  try {
    const v = JSON.parse(e) as { name: string; id: string }[];
    const res = z
      .array(
        z.object({
          name: z.string(),
          id: z.coerce.string(),
        }),
      )
      .parse(v);
    console.log("::v", v, res);
    return res;
  } catch (error) {
    return [];
  }
};

export const convertToUrlParams = (e: string) => {
  const d = safeArrayParse(e);
  if (d.length === 0) return undefined;
  return JSON.stringify(d.map((e) => +e.id));
};
