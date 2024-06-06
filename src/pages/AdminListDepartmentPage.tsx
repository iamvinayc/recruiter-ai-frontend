import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { PopupDialog } from "@/components/PopupDialog";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { emptyArray } from "@/utils";
import { axiosApi } from "../api/api";
import { InfinityLoaderComponent } from "./common/InfinityLoaderComponent";

export function AdminListDepartmentPage() {
  const [showAddDepartmentPopup, setShowAddDepartmentPopup] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.TypeOf<typeof formState>>({
    resolver: zodResolver(formState),
  });
  const departmentListQuery = useInfiniteQuery({
    queryKey: ["AdminListDepartmentPage", showAddDepartmentPopup],
    queryFn: async ({ pageParam }) =>
      axiosApi({
        url: (pageParam
          ? pageParam
          : "data-sourcing/department/") as "data-sourcing/department/",
        method: "GET",
        params: { type: 1, page_size: 200 },
      }).then((e) => e.data),
    getNextPageParam(lastPage) {
      return lastPage?.next;
    },
    initialPageParam: "",
  });

  const addDepartmentMutation = useMutation({
    mutationKey: ["addDepartmentMutation"],
    mutationFn: async ({ name }: { name: string }) =>
      axiosApi({
        url: "data-sourcing/department/" as "data-sourcing/department",
        method: "POST",
        data: { name: name, description: name },
      }).then((e) => e.data),
  });

  const onNewDepartmentAdd = (data: z.TypeOf<typeof formState>) => {
    addDepartmentMutation
      .mutateAsync({ name: data.department })
      .then((data) => {
        if (data.isSuccess) {
          toast.success("New Skill added successfully");
          setShowAddDepartmentPopup(false);
          reset({ department: "" });
          departmentListQuery.refetch();
          return;
        } else if (data.message) {
          return toast.error(data.message);
        } else {
          throw new Error("Some error ocurred");
        }
      })
      .catch(() => {
        toast.error("Some error ocurred");
      });
  };

  useEffect(() => {
    reset({
      department: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddDepartmentPopup]);

  const skillList =
    departmentListQuery.data?.pages?.map((e) => e.data).flat() || emptyArray;
  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Skills
          </h2>
          <button
            type="button"
            onClick={() => {
              setShowAddDepartmentPopup(true);
            }}
            className="flex items-center gap-2 rounded-none bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
          >
            <PlusIcon className="h-6 w-6 stroke-2" />
            Add Skills
          </button>
        </div>
        {departmentListQuery.isLoading ? (
          <div className="flex h-[30vh] items-center justify-center text-2xl font-bold">
            Loading....
          </div>
        ) : null}
        <InfinityLoaderComponent
          dataLength={skillList.length}
          hasMore={departmentListQuery.hasNextPage}
          next={() => {
            departmentListQuery.fetchNextPage();
            console.log("fetching next page", departmentListQuery.hasNextPage);
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-2">
            {skillList?.map(({ id, name }) => (
              <span
                key={id}
                className=" inline-flex  text-ellipsis  rounded-none  bg-[#3BA2B8]  px-2 py-1 text-lg font-medium text-white hover:bg-opacity-90"
              >
                {name}
              </span>
            ))}
          </div>
        </InfinityLoaderComponent>
      </div>
      <PopupDialog
        isOpen={showAddDepartmentPopup}
        setIsOpen={setShowAddDepartmentPopup}
        title="Add new Skills"
        containerClassName="relative"
      >
        <button
          className="absolute right-0 top-0 p-4 outline-none ring-0"
          onClick={() => setShowAddDepartmentPopup(false)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit(onNewDepartmentAdd)}>
          <div className="mb-4 py-4">
            <Input
              label="Skills"
              placeholder="Skills"
              containerClassName=""
              className="px-3 py-3"
              disabled={addDepartmentMutation.isPending}
              register={register}
              error={errors.department?.message}
              name="department"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={addDepartmentMutation.isPending}
              className="py-2"
            >
              Add Skills
            </Button>
          </div>
        </form>
      </PopupDialog>
    </main>
  );
}
// interface DepartmentListingResponseData {
//   id: number;
//   name: string;
//   description: string;
// }
// const columns = [
//   {
//     name: "Name",
//     selector: (row: DepartmentListingResponseData) => row.name,
//   },
//   {
//     name: "Description",
//     selector: (row: DepartmentListingResponseData) => row.description,
//   },
// ];
// const emptyArr: [] = [];
const formState = z.object({
  department: z.string().min(1, "Please enter a skill"),
});
