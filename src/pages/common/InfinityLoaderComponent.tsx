import InfiniteScroll from "react-infinite-scroll-component";

import { SpinnerIcon } from "@/components/common/SvgIcons";

export function InfinityLoaderComponent({
  children,
  dataLength,
  next,
  hasMore,
  height,
}: {
  dataLength: number;
  children: JSX.Element;
  next: () => void;
  hasMore: boolean;
  height?: number;
}) {
  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={next}
      hasMore={hasMore}
      height={height}
      loader={
        <div className="flex items-center justify-center p-4 py-6">
          <div className="flex items-center space-x-2">
            <SpinnerIcon className="h-6 w-6 text-black" />
            <span>Loading....</span>
          </div>
        </div>
      }
      endMessage={
        dataLength > 0 ? (
          <div className="flex items-center justify-center p-4 py-6">
            You have reached to end
          </div>
        ) : null
      }
      scrollableTarget="layout"
    >
      {children}
    </InfiniteScroll>
  );
}
