import { XMarkIcon } from "@heroicons/react/20/solid";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import DataTable, {
  defaultThemes,
  TableColumn,
} from "react-data-table-component";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { PopupDialog } from "../components/PopupDialog";

export function AdminListLocationPage() {
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<z.TypeOf<typeof fromState>>({
    resolver: zodResolver(fromState),
  });

  const locationListQuery = useQuery({
    queryKey: ["AdminListLocationPage"],
    queryFn: async () =>
      axiosApi({
        url: "data-sourcing/location/",
        method: "GET",
      }).then((e) => e.data.data),
  });
  const addLocationMutation = useMutation({
    mutationKey: ["AdminAddLocationPage"],
    mutationFn: async ({ label }: { label: string }) =>
      axiosApi({
        url: "data-sourcing/location/" as "data-sourcing/location",
        method: "POST",
        data: { name: label },
      }).then((e) => e.data),
  });

  const onSubmit = (data: z.TypeOf<typeof fromState>) => {
    addLocationMutation
      .mutateAsync({ label: data.location })
      .then((data) => {
        if (data.isSuccess) {
          toast.success("New location added successfully");
          setShowAddLocationDialog(false);
          reset({ location: "" });
          locationListQuery.refetch();
          return;
        } else if (data.message) {
          toast.error(data.message);
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
      location: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddLocationDialog]);

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Location
          </h2>
          <div>
            <button
              type="button"
              onClick={() => setShowAddLocationDialog(true)}
              className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
            >
              <PlusIcon className="h-6 w-6 stroke-2" />
              Add Location
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
          <div className="dark:bg-boxdark dark:border-strokedark rounded-sm border border-stroke bg-white shadow-default">
            <DataTable
              columns={columns}
              data={locationListQuery.data || []}
              progressPending={locationListQuery.isLoading}
              customStyles={customStyles}
            />
          </div>
        </div>
      </div>
      <PopupDialog
        isOpen={showAddLocationDialog}
        setIsOpen={setShowAddLocationDialog}
        title="Add new location"
        containerClassName="relative"
      >
        <button
          className="absolute right-0 top-0 p-4 outline-none ring-0"
          onClick={() => setShowAddLocationDialog(false)}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 py-4">
            <Input
              label="Location"
              placeholder="Location"
              icon={<MapPinIcon className="h-5 w-5" />}
              containerClassName=""
              className="px-3 py-3"
              disabled={addLocationMutation.isPending}
              register={register}
              name="location"
              error={errors.location?.message}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={addLocationMutation.isPending}
              className="py-2"
            >
              Add Location
            </Button>
          </div>
        </form>
      </PopupDialog>
    </main>
  );
}

const columns: TableColumn<{ id: number; name: string }>[] = [
  {
    name: "id",
    selector: (row) => row.id,
    grow: 0,
  },
  {
    name: "Location",
    selector: (row) => row.name,
    grow: 1,
  },
];
const customStyles = {
  header: {
    style: {
      minHeight: "56px",
    },
  },
  headRow: {
    style: {
      borderTopStyle: "solid",
      borderTopWidth: "1px",
      borderTopColor: defaultThemes.default.divider.default,
    },
  },
  headCells: {
    style: {
      "&:not(:last-of-type)": {
        borderRightStyle: "solid",
        borderRightWidth: "1px",
        borderRightColor: defaultThemes.default.divider.default,
      },
    },
  },
  cells: {
    style: {
      "&:not(:last-of-type)": {
        borderRightStyle: "solid",
        borderRightWidth: "1px",
        borderRightColor: defaultThemes.default.divider.default,
      },
    },
  },
} as const;
const fromState = z.object({
  location: z.string().min(1, "Please enter a location"),
});
