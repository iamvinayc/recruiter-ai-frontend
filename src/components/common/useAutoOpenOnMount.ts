import { useRef } from "react";

// TODO: maybe remove it?
export function useAutoOpenOnMount() {
  const btnRef = useRef<React.ElementRef<"button">>(null);
  const inpRef = useRef<React.ElementRef<"input">>(null);
  // useEffect(() => {
  //   inpRef.current?.focus();
  //   const btn = btnRef.current;
  //   if (!btn) return console.log("No Button found", btn);
  //   if (btn.getAttribute("data-headlessui-state") !== "true") {
  //     btn.click();
  //   }
  // }, []);

  return { btnRef, inpRef };
}
