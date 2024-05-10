import { cn } from "@/utils";
import { CircleSlash } from "lucide-react";
import { SpinnerIcon } from "./SvgIcons";

export function BlockButton({
  is_blocked,
  isLoading,
  onClick,
}: {
  onClick: VoidFunction;
  isLoading: boolean;
  is_blocked: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 rounded-md  px-3 py-2 text-white hover:bg-opacity-70",
        is_blocked ? "bg-primary" : "bg-red-500",
      )}
    >
      {isLoading ? (
        <SpinnerIcon className="m-0" />
      ) : (
        <CircleSlash className="h-4 w-4 " />
      )}{" "}
      <span>{is_blocked ? "Unblock" : "Block"}</span>
    </button>
  );
}
