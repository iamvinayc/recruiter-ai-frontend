import { useState } from "react";

export function ChipGroup({
  items,
  onAdd,
}: {
  items: { id: number; name: string }[];
  onAdd?: VoidFunction;
}) {
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-2">
      {items
        .filter((_, i) => (showMore ? true : i < 2))
        .map(({ id, name }) => (
          <button
            key={id}
            className="inline-flex  rounded bg-[#3BA2B8] px-2 py-1  font-medium text-white hover:bg-opacity-90"
          >
            {name}
          </button>
        ))}
      {items.length > 2 && !showMore ? (
        <button
          onClick={() => setShowMore(true)}
          className="inline-flex rounded border border-[#3BA2B8] px-2 py-1  font-medium text-[#3BA2B8] hover:opacity-80"
        >
          More...
        </button>
      ) : null}
      {onAdd ? (
        <button
          onClick={() => onAdd()}
          type="button"
          className="inline-flex rounded border border-primary px-2 py-1  font-medium text-primary hover:opacity-80"
        >
          + Add
        </button>
      ) : null}
    </div>
  );
}
