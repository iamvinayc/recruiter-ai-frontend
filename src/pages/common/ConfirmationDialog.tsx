import { Dialog } from "@headlessui/react";

import { Button } from "@/components/common/Button";
import { PopupDialog } from "@/components/PopupDialog";

export function ConfirmationDialog({
  closeDialog,
  isOpen,
  onDelete,
  subtitle,
  title = "Conformation",
  isDeleteLoading,
}: ConfirmationDialogProps) {
  return (
    <PopupDialog
      isOpen={isOpen}
      setIsOpen={closeDialog}
      title={title}
      containerClassName="max-w-[95%] md:max-w-[50%] "
    >
      <Dialog.Title className="mb-8 mt-4">{subtitle}</Dialog.Title>
      <div className=" flex items-center justify-end space-x-2">
        <Button
          type="button"
          onClick={closeDialog}
          className="border-none bg-slate-200 py-2 text-black outline-slate-300"
        >
          Cancel
        </Button>
        <Button
          disabled={isDeleteLoading}
          isLoading={isDeleteLoading}
          type="button"
          onClick={onDelete}
          className="border-none bg-red-500 py-2 outline-red-300"
        >
          Delete
        </Button>
      </div>
    </PopupDialog>
  );
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title?: string;
  subtitle: JSX.Element;
  isDeleteLoading?: boolean;
  closeDialog: () => void;
  onDelete: () => void;
}
