import { useState } from "react";

export const ReadMore = ({
  prefix,
  text: _text = "",
}: {
  text?: string | null;
  prefix?: JSX.Element;
}) => {
  const text = _text || "";
  const [showAll, setShowAll] = useState(false);
  const textSm = text
    .split("\n")
    .filter((_, i) => i < 3)
    .join("\n")
    .slice(0, 140);
  const hasMore = textSm.length < text.length;
  const content = showAll ? text : textSm + (hasMore ? "...." : "");
  return (
    <div>
      <div className="whitespace-pre-wrap text-base font-normal ">
        {prefix}
        {content}
      </div>
      {hasMore ? (
        <button
          className="text-base  text-slate-500"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
};
