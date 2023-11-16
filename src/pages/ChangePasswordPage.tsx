import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { LoginPageIcon } from "../components/common/SvgIcons";
import { useLogin } from "../hooks/useLogin";
import { ROUTES } from "../routes/routes";

export function ChangePasswordPage() {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<z.TypeOf<typeof changePasswordFromSchema>>({
    resolver: zodResolver(changePasswordFromSchema),
  });
  const login = useLogin();
  const navigate = useNavigate();
  const loginApi = useMutation({
    mutationKey: ["change_password"],
    mutationFn: async (data: z.TypeOf<typeof changePasswordFromSchema>) => {
      const resp = axiosApi({
        url: "user/change_password/",
        method: "POST",
        data: data,
      }).then((e) => {
        if (e.data.isSuccess) return e.data.data;
        else throw new Error(e.data.message);
      });
      return resp;
    },
  });

  const onSubmit = (data: z.TypeOf<typeof changePasswordFromSchema>) => {
    loginApi
      .mutateAsync(data)
      .then(() => {
        toast.success("Password changed succesfully");
        toast.success("Please login with new password");
        login.logout();
        navigate(ROUTES.LOGIN.path);
      })
      .catch((e) => {
        const msg = e?.message?.toLowerCase().includes("incorrect")
          ? e?.message
          : "Some error ocurred";
        console.log("err");

        toast.error(msg);
      });
  };
  useEffect(() => {
    if (!login.user) navigate(ROUTES.LOGIN.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login.user]);

  return (
    <FromLayout className="w-full p-4 sm:p-12.5 xl:p-17.5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          disabled={loginApi.isPending}
          containerClassName="mb-4"
          label="Old Password"
          placeholder="Enter your old password"
          error={errors.old_password?.message}
          name="old_password"
          type="password"
          register={register}
          icon={<EnvelopeIcon className="h-6 w-6 opacity-50" />}
        />

        <Input
          disabled={loginApi.isPending}
          containerClassName="mb-4"
          label="New Password"
          type="password"
          icon={<LockClosedIcon className="h-6 w-6 opacity-50" />}
          placeholder="Enter your new password"
          error={errors.new_password?.message}
          register={register}
          name="new_password"
        />

        <div className="mb-5">
          <Button
            isLoading={loginApi.isPending}
            type="submit"
            className="w-full justify-center"
          >
            Change Password
          </Button>
        </div>
      </form>
    </FromLayout>
  );
}

const FromLayout = ({ children }: React.ComponentProps<"div">) => (
  <main className="dark:bg-boxdark-2 dark:text-bodydark">
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Change Password
        </h2>
      </div>
      <div className="dark:bg-boxdark rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="px-26 py-17.5 text-center">
              <p className="2xl:px-20"></p>
              <span className="mt-15 inline-block">
                <LoginPageIcon />
              </span>
            </div>
          </div>
          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
);

const changePasswordFromSchema = z.object({
  old_password: z.string().min(1, "Please enter old password"),
  new_password: z.string().min(1, "Please enter new password"),
});
