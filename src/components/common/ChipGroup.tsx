import { cn } from "@/utils";
import { useState } from "react";

export function ChipGroup({
  items,
  onAdd,
  addLabel = "+ Add",
  showAll = false,
  className,
}: {
  items: { id: number; name: string }[];
  onAdd?: VoidFunction;
  addLabel?: string;
  showAll?: boolean;
  className?: string;
}) {
  const [showMore, setShowMore] = useState(showAll);
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-2">
      {items
        .filter((_, i) => (showMore ? true : i < 2))
        .map(({ id, name }) => (
          <button
            type="button"
            key={id}
            className={cn(
              " inline-flex  text-ellipsis  rounded-none  bg-purple-600 px-2 py-1 font-medium text-white hover:bg-opacity-90",
              className,
            )}
          >
            {name}
          </button>
        ))}
      {items.length > 2 && !showMore ? (
        <button
          type="button"
          onClick={() => setShowMore(true)}
          className={
            "inline-flex rounded-none border bg-yellow-500 px-2 py-1  font-medium text-white hover:opacity-80"
          }
        >
          More...
        </button>
      ) : null}
      {onAdd ? (
        <button
          type="button"
          onClick={() => onAdd()}
          className="inline-flex rounded-none border bg-black px-2 py-1  font-medium text-white hover:opacity-80"
        >
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}
