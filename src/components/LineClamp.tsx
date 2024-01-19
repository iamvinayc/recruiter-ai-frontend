import { useLayoutEffect, useRef, useState } from "react";

export const LineClamp = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<React.ElementRef<"pre">>(null);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (!textRef.current) return;
      console.log(
        textRef.current.scrollHeight,
        textRef.current.clientHeight,
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );

      if (textRef.current.scrollHeight > textRef.current.clientHeight) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    }, 1);
  }, [text]);

  const toggleLines = () => {
    setExpanded(!expanded);
  };
  if (text === "") return <></>;
  return (
    <div>
      <pre
        className={`line-clamp w-full ${
          expanded ? "line-clamp-none" : "line-clamp-4"
        }`}
        ref={textRef}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "break-spaces",
        }}
      >
        {text}
      </pre>
      {
        <button
          className="text-blue-500 hover:underline focus:outline-none"
          onClick={toggleLines}
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      }
    </div>
  );
};
