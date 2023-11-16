import React from "react";

import { cn } from "../../utils";
import { SpinnerIcon } from "./SvgIcons";

export function Button(props: ButtonProps) {
  const { isLoading, className, children, ...rest } = props;
  return (
    <button
      {...rest}
      disabled={props.isLoading || props.disabled}
      className={cn(
        "flex cursor-pointer items-center rounded-lg border border-primary  bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:bg-opacity-80",
        className,
      )}
    >
      {isLoading ? <SpinnerIcon /> : null}
      {children}
    </button>
  );
}

interface ButtonProps extends React.ComponentProps<"button"> {
  isLoading?: boolean;
}
