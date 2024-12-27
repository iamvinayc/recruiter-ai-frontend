/* eslint-disable react-refresh/only-export-components */
import { XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useState } from "react";
import { ChipGroup } from "./common/ChipGroup";
import { PopupDialog } from "./PopupDialog";

export const useShowAllSkill = (
  initial: { id: number; name: string }[] | null = null,
) => {
  const [selectedSkills, setSelectedSkills] = useState<
    { id: number; name: string }[] | null
  >(initial);
  return {
    selectedSkills,
    setSelectedSkills,
  } as const;
};

const ShowAllSkillButton = ({
  dialogProps,
  className = "",
}: {
  dialogProps: ReturnType<typeof useShowAllSkill>;
  className?: string;
}) => {
  const { setSelectedSkills } = dialogProps;
  return (
    <button
      onClick={() => setSelectedSkills([])}
      className={clsx(
        "whitespace-nowrap rounded-none  bg-yellow-500 text-white hover:bg-opacity-70",
        className || "p-3",
      )}
    >
      View Skills
    </button>
  );
};

const ShowAllSkillDialog = ({
  dialogProps,
}: {
  dialogProps: ReturnType<typeof useShowAllSkill>;
}) => {
  const { selectedSkills, setSelectedSkills } = dialogProps;
  return (
    <PopupDialog
      isOpen={!!selectedSkills}
      setIsOpen={() => setSelectedSkills(null)}
      title="Skills"
      containerClassName="max-w-[95%] md:max-w-[70%] "
    >
      <div>
        <button
          className="absolute right-0 top-0 p-4"
          onClick={() => setSelectedSkills(null)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="mt-4 ">
          <ChipGroup items={selectedSkills || []} showAll />
        </div>
      </div>
    </PopupDialog>
  );
};

export const ShowAllSkill = {
  Button: ShowAllSkillButton,
  Dialog: ShowAllSkillDialog,
};
