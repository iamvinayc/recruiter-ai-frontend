import { Trash2Icon, FileIcon } from "lucide-react";
import { Dispatch, SetStateAction, useRef, ElementRef } from "react";
import { SpinnerIcon } from "./common/SvgIcons";

export const FileUpload = ({
  file,
  setFile,
  isLoading,
}: {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  isLoading: boolean;
}) => {
  const fileRef = useRef<ElementRef<"input">>(null);

  const resetFile = () => {
    setFile(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };
  return (
    <>
      {file ? (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="relative flex cursor-move select-none flex-col items-center overflow-hidden rounded border bg-white pt-[100%] text-center">
            <button
              className="absolute  right-0 top-0 z-50 rounded-bl bg-white p-2 focus:outline-none"
              type="button"
              onClick={resetFile}
            >
              {isLoading ? (
                <SpinnerIcon className="m-0 text-primary" />
              ) : (
                <Trash2Icon size={18} />
              )}
            </button>
            <FileIcon
              size={24}
              className="text-gray-400 absolute top-1/2 h-12 w-12 -translate-y-2/3 transform"
            />

            <div className="absolute bottom-0 left-0 right-0 flex flex-col bg-white bg-opacity-50 p-2 text-xs">
              <span className="text-gray-900 w-full truncate font-bold">
                {file.name}
              </span>
              <span className="text-gray-900 text-xs">
                {(file.size / 1024).toFixed(2)} kB
              </span>
            </div>

            <div className="absolute inset-0 z-40 transition-colors duration-300"></div>
          </div>
        </div>
      ) : (
        <div className="text-gray-400 border-gray-200 relative flex cursor-pointer flex-col rounded border border-dashed bg-white">
          <input
            ref={fileRef}
            accept="application/pdf"
            type="file"
            className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
            title=""
            onChange={(e) => {
              const file = e.target?.files?.[0];
              if (file) {
                setFile(file);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileIcon size={34} className="text-current-50 mr-1 h-6 w-6" />

            <p className="m-0">Drag your files here or click in this area.</p>
          </div>
        </div>
      )}
    </>
  );
};
