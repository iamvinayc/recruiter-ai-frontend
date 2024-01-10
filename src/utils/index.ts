 import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const emptyArray = [];

export const convertEnumToStr = (status: string) => {
  return status
    .split("_")
    .map((e) => e.toLowerCase())
    .map((e) =>
      e
        .split("")
        .map((e, i) => (i === 0 ? e.toUpperCase() : e))
        .join(""),
    )
    .join(" ");
};
