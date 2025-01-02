import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

import clsx from "clsx";
import { SearchIcon } from "lucide-react";
import { cn } from "../../utils";

export function Input<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: InputProps<TFieldValues, TName>) {
  const { icon, label, containerClassName, error, register, ...rest } = props;
  return (
    <div className={containerClassName}>
      <label className="mx-4 mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          {...(register && rest.name ? register(rest.name) : {})}
          className={cn(
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-none border border-stroke bg-transparent py-2 pl-4  outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
            icon ? "pr-10" : "pr-4",
            rest.className,
          )}
        />

        <span className="absolute right-2 top-2">{icon}</span>
      </div>
      {error ? (
        <span className="mt-2 text-sm text-red-500">{error}</span>
      ) : null}
    </div>
  );
}

export function DateTimeInput(props: DateTimeInputProps) {
  const { icon, label, containerClassName, error, onChange, value } = props;
  return (
    <div className={containerClassName}>
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <DatePicker
          className={cn(
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-lg border border-stroke bg-transparent py-2  pl-4 outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
            icon ? "pr-10" : "pr-4",
          )}
          calendarClassName="w-full"
          onChange={onChange}
          selected={value}
          portalId="date-time-picker"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="time"
          dateFormat="dd/MM/yyyy HH:mm"
          placeholderText="dd/mm/yyyy, --:-- --"
        />

        <span className="absolute right-2 top-2">{icon}</span>
      </div>
      {error ? (
        <span className="mt-2 text-sm text-red-500">{error}</span>
      ) : null}
    </div>
  );
}

interface DateTimeInputProps {
  icon?: JSX.Element;
  label: string;
  containerClassName?: string;
  error?: string;
  value?: Date;
  onChange: (date: Date) => void;
}
export function TextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: TextAreaProps<TFieldValues, TName>) {
  const { icon, label, containerClassName, error, register, ...rest } = props;
  return (
    <div className={containerClassName}>
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <div className="relative">
        <textarea
          {...rest}
          {...(register && rest.name ? register(rest.name) : {})}
          className={cn(
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-none border border-stroke bg-transparent py-2 pl-4  outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
            icon ? "pr-10" : "pr-4",
            rest.className,
          )}
        />
        <span className="absolute right-2 top-2">{icon}</span>
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
interface TextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends React.ComponentProps<"textarea"> {
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
  fullWidth = false,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  fullWidth?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);
  const isFirstRun = useRef(true);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // const handleClear = () => {
  //   setValue('');
  //   onChange('');
  // };

  return (
    <div className={clsx("relative inline-block", fullWidth && "flex-1")}>
      <input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {/* {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-5 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      )} */}
    </div>
  );
}

export const DebouncedSearchInput = ({
  placeholder,
  value,
  onChange,
  className,
  parentClassName,
}: {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  parentClassName?: string;
}) => {
  return (
    <div
      className={clsx(
        ` flex items-center justify-center gap-2 rounded-none border border-slate-200 px-2 py-1 shadow-sm sm:justify-start md:justify-start `,
        parentClassName,
      )}
    >
      <SearchIcon size={20} />
      <DebouncedInput
        fullWidth
        className={` field-sizing w-52 text-base outline-none ${className} `}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(val) => {
          onChange("" + val);
        }}
      />
    </div>
  );
};
