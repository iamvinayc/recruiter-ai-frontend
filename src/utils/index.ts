import { formatOnboardingStatus } from "@/api/api";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const emptyArray = [];

export const convertEnumToStr = (status: string) => {
  return formatOnboardingStatus(status);
  // return status
  //   .split("_")
  //   .map((e) => e.toLowerCase())
  //   .map((e) =>
  //     e
  //       .split("")
  //       .map((e, i) => (i === 0 ? e.toUpperCase() : e))
  //       .join(""),
  //   )
  //   .join(" ");
};

export const replaceWith = <T extends string>(path: T, val?: string): T =>
  val ? (val as T) : path;
export const makeUrlWithParams = <T extends string>(
  url: T,
  params: ExtractUrlParams<T>,
) => {
  let finalUrl = url;
  Object.entries(params).map(([key, val]) => {
    const expr = new RegExp(`{{${key}}}`, "g");
    finalUrl = finalUrl.replace(expr, val as string) as T;
  });

  return finalUrl;
};

type ExtractUrlParams<T extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer _Start}/{{${infer Param}}}${infer Rest}`
    ? { [K in Param | keyof ExtractUrlParams<Rest>]: string }
    : // eslint-disable-next-line @typescript-eslint/ban-types
      {};
export const removeEmptyKeys = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach((key) => !obj[key] && delete obj[key]);
  return obj;
};
