import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

import { SearchIcon } from "lucide-react";
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
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-lg border border-stroke bg-transparent py-2 pl-4  outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
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
            "dark:bg-form-input dark:border-form-strokedark w-full rounded-lg border border-stroke bg-transparent py-2 pl-4  outline-none focus:border-primary focus-visible:shadow-none disabled:bg-opacity-80 dark:focus:border-primary",
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

export const DebouncedSearchInput = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-2 py-1 shadow-sm">
      <SearchIcon size={20} />
      <DebouncedInput
        className=" field-sizing w-52 text-base outline-none "
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(val) => {
          onChange("" + val);
        }}
      />
    </div>
  );
};
