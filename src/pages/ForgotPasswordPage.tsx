import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { LoginPageIcon } from "../components/common/SvgIcons";
import { ROUTES } from "../routes/routes";

export function ForgotPasswordPage() {
  const {
    handleSubmit,
    formState: { errors },
    setError,
    register,
  } = useForm<z.TypeOf<typeof forgotPasswordFromSchema>>({
    resolver: zodResolver(forgotPasswordFromSchema),
  });
  const [showOtpField, setShowOtpField] = useState(false);
  const navigate = useNavigate();
  const sendOtpMutation = useMutation({
    mutationKey: ["sendOtpMutation"],
    mutationFn: async (data: z.TypeOf<typeof forgotPasswordFromSchema>) => {
      const resp = axiosApi({
        url: "user/forget_password/",
        method: "POST",
        data: data,
      }).then((e) => {
        if (e.data.isSuccess) return e.data.data;
        else throw new Error(e.data.message);
      });
      return resp;
    },
  });
  const resetPasswordMutation = useMutation({
    mutationKey: ["resetPasswordMutation"],
    mutationFn: async ({
      otp,
      password,
    }: {
      otp: string;
      password: string;
    }) => {
      const resp = axiosApi({
        url: "user/reset_password/",
        method: "POST",
        data: { password, token: otp },
      }).then((e) => {
        if (e.data.isSuccess) return e.data.data;
        else throw new Error(e.data.message);
      });
      return resp;
    },
  });

  const onSubmit = (data: z.TypeOf<typeof forgotPasswordFromSchema>) => {
    if (showOtpField) {
      const { otp, password } = data;
      if (!otp) setError("otp", { message: "Please enter otp" });
      if (!password) setError("password", { message: "Please enter password" });
      if (otp && password) {
        return resetPasswordMutation
          .mutateAsync({ otp, password })
          .then(() => {
            toast.success("Password changed successfully");
            toast.success("Please login with new password");
            return navigate(ROUTES.LOGIN.path);
          })
          .catch((e) => {
            const msg = e?.message?.toLowerCase().includes("invalid")
              ? e?.message
              : "Some error ocurred";
            toast.error(msg);
          });
      }
    } else {
      return sendOtpMutation
        .mutateAsync(data)
        .then(() => {
          toast.success("OTP sent succesfully");
          setShowOtpField(true);
        })
        .catch((e) => {
          const msg = e?.message?.toLowerCase().includes("incorrect")
            ? e?.message
            : "Some error ocurred";

          toast.error(msg);
        });
    }
  };

  return (
    <FromLayout className="w-full p-4 sm:p-12.5 xl:p-17.5">
      <form onSubmit={handleSubmit(onSubmit)}>
        {showOtpField ? (
          <>
            <Input
              disabled={sendOtpMutation.isPending}
              containerClassName="mb-4"
              label="OTP"
              placeholder="Enter OTP"
              error={errors.otp?.message}
              name="otp"
              register={register}
              icon={<EnvelopeIcon className="h-6 w-6 opacity-50" />}
            />
            <Input
              disabled={sendOtpMutation.isPending}
              containerClassName="mb-4"
              label="Password"
              placeholder="Enter your new password"
              error={errors.password?.message}
              name="password"
              register={register}
              icon={<EnvelopeIcon className="h-6 w-6 opacity-50" />}
            />
          </>
        ) : (
          <Input
            disabled={sendOtpMutation.isPending}
            containerClassName="mb-4"
            label="Email"
            placeholder="Enter your email"
            error={errors.email?.message}
            name="email"
            type="email"
            register={register}
            icon={<EnvelopeIcon className="h-6 w-6 opacity-50" />}
          />
        )}

        <div className="mb-5">
          <Button
            isLoading={sendOtpMutation.isPending}
            type="submit"
            className="w-full justify-center"
          >
            {showOtpField ? "Reset password" : "Request Otp"}
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
          Rest Password
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

const forgotPasswordFromSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  otp: z.string().optional(),
});
