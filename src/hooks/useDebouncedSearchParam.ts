import { useEffect, useRef, useState } from "react";
import {
  RawSearchParams,
  Route,
  useTypedSearchParams,
} from "react-router-typesafe-routes/dom";

export function useDebouncedSearchParam<
  TPath extends string,
  TPathTypes,
  TSearchTypes,
  THash extends string[],
  TStateTypes,
>(
  route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes>,
  key: keyof TSearchTypes,
) {
  const [searchParams, setSearchParams] = useTypedSearchParams(route);
  const searchParamsVal = searchParams[key];
  const [state, setState] = useState(searchParamsVal);
  const timeoutRef = useRef(-1);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    if (s.get(key as string) === state) return console.log("same");
    s.entries();
    const handler = setTimeout(
      () => {
        const v = [...s.entries()].reduce(
          (acc, [key, val]) => ({ ...acc, [key]: val }),
          {},
        );
        console.log("setting", key, state, v);
        setSearchParams(
          (prevParams) =>
            ({
              ...removeEmptyObjectEntries(prevParams),
              // ...v,
              [key]: state,
            }) as unknown as Partial<RawSearchParams<TSearchTypes, "in">>,
        );
      },
      timeoutRef.current === -1 ? 0 : 300,
    );
    timeoutRef.current = handler as unknown as number;
    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, key]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    setState(searchParamsVal);
  }, [searchParamsVal]);

  return [state, setState] as const;
}

const removeEmptyObjectEntries = (obj: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== ""),
  );
};

export function useIsFilterApplied<
  TPath extends string,
  TPathTypes,
  TSearchTypes,
  THash extends string[],
  TStateTypes,
>(
  route: Route<TPath, TPathTypes, TSearchTypes, THash, TStateTypes>,
  keys: (keyof TSearchTypes)[],
) {
  const [searchParams] = useTypedSearchParams(route);

  return keys.some((key) => searchParams[key]);
}
