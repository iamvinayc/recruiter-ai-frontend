import { useEffect, useState } from "react";
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

import { cn } from "../../utils";

export function Input<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: InputProps<TFieldValues, TName>) {
  const { icon, label, containerClassName, error, register, ...rest } = props;
  return (
    <div className={containerClassName}>
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          {...(register && rest.name ? register(rest.name) : {})}
          className={cn(
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-lg border border-stroke bg-transparent py-2 pl-4 pr-10 outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
            rest.className,
          )}
        />
        <span className="absolute right-4 top-4">{icon}</span>
      </div>
      {error ? (
        <span className="mt-2 text-sm text-red-500">{error}</span>
      ) : null}
    </div>
  );
}

interface InputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends React.ComponentProps<"input"> {
  register?: UseFormRegister<TFieldValues>;
  name?: TName;
  icon?: JSX.Element;
  label: string;
  containerClassName?: string;
  error?: string;
}
// A debounced input react component
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
