import { cn } from "@/utils";

export function FlatList<T>({
  children,
  data,
  isLoading,
  loadingComponent,
  noDataComponent,
  className,
  hideSpinner,
}: FlatListProps<T>) {
  if (isLoading && data.length === 0) {
    return loadingComponent;
  }
  if (data.length === 0) {
    return noDataComponent || <NoData />;
  }
  if (hideSpinner) return children;
  return (
    <div className={cn("relative", className)}>
      {children}

      {isLoading ? (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
          <svg
            className="text-gray-400 h-12 w-12 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

interface FlatListProps<T> {
  children: React.ReactNode;
  noDataComponent?: React.ReactNode;
  loadingComponent: React.ReactNode;
  isLoading: boolean;
  data: T[];
  className?: string;
  hideSpinner?: boolean;
}

const NoData = () => (
  <div className="flex w-full items-center justify-center px-2 py-16">
    No Data
  </div>
);
