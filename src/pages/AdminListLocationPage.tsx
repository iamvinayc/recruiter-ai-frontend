import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import toast from "react-hot-toast";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { PopupDialog } from "../components/PopupDialog";

export function AdminListLocationPage() {
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [newLocation, setNewLocation] = useState("");
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
        url: "data-sourcing/location",
        method: "POST",
        data: { label },
      }).then((e) => e.data.isSuccess),
  });

  const onNewLocationAdd = () => {
    addLocationMutation
      .mutateAsync({ label: newLocation })
      .then((success) => {
        if (success) {
          toast.success("New location added successfully");
          setShowAddLocationDialog(false);
          setNewLocation("");
          locationListQuery.refetch();
          return;
        } else {
          throw new Error("Some error ocurred");
        }
      })
      .catch(() => {
        toast.error("Some error ocurred");
      });
  };

  return (
    <main>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            List Department
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
          <div className="dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark">
            <DataTable
              columns={columns}
              data={locationListQuery.data || []}
              progressPending={locationListQuery.isLoading}
            />
          </div>
        </div>
      </div>
      <PopupDialog
        isOpen={showAddLocationDialog}
        setIsOpen={setShowAddLocationDialog}
        title="Add new location"
      >
        <div className="mb-4 py-4">
          <Input
            label="Location"
            placeholder="Location"
            icon={<MapPinIcon className="h-5 w-5" />}
            containerClassName=""
            className="px-3 py-3"
            disabled={addLocationMutation.isPending}
            value={newLocation}
            onInput={(e) =>
              setNewLocation((e.target as HTMLInputElement).value)
            }
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onNewLocationAdd}
            isLoading={addLocationMutation.isPending}
            className="py-2"
          >
            Add Location
          </Button>
        </div>
      </PopupDialog>
    </main>
  );
}

const columns: TableColumn<{ id: number; name: string }>[] = [
  {
    name: "id",
    selector: (row) => row.id,
  },
  {
    name: "Location",
    selector: (row) => row.name,
  },
];
