import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import LockClosedIcon from "@heroicons/react/24/outline/LockClosedIcon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

import { axiosApi } from "../api/api";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { LoginPageIcon } from "../components/common/SvgIcons";
import { useLogin } from "../hooks/useLogin";
import { ROUTES } from "../routes/routes";

export function LoginPage() {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<z.TypeOf<typeof loginFromSchema>>({
    resolver: zodResolver(loginFromSchema),
  });
  const login = useLogin();
  const loginApi = useMutation({
    mutationKey: ["loginApi"],
    mutationFn: async (params: z.TypeOf<typeof loginFromSchema>) => {
      const resp = axiosApi({
        url: "user/login/",
        method: "POST",
        data: {
          email: params.email,
          password: params.password,
        },
      }).then((e) => {
        if (e.data.isSuccess) return e.data.data;
        else throw new Error(e.data.message);
      });
      return resp;
    },
  });

  const onSubmit = (data: z.TypeOf<typeof loginFromSchema>) => {
    loginApi
      .mutateAsync({
        email: data.email,
        password: data.password,
      })
      .then((data) => {
        login.setUser({
          role: data.user.role,
          token: data.token,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          id: data.user.id,
          change_password: data.user.change_password,
        });
        toast.success("Logged in succesfully");
      })
      .catch((e) => {
        const msg = e?.message?.toLowerCase().includes("login failed")
          ? e?.message
          : "Some error ocurred";
        console.log("err");

        toast.error(msg);
      });
  };

  return (
    <FromLayout className="w-full p-4 sm:p-12.5 xl:p-17.5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          disabled={loginApi.isPending}
          containerClassName="mb-4"
          label="Email"
          // type="email"
          icon={<EnvelopeIcon className="h-6 w-6 opacity-50" />}
          placeholder="Enter your email"
          error={errors.email?.message}
          name="email"
          register={register}
        />

        <Input
          disabled={loginApi.isPending}
          containerClassName="mb-4"
          label="Password"
          type="password"
          icon={<LockClosedIcon className="h-6 w-6 opacity-50" />}
          placeholder="Enter your Password"
          error={errors.password?.message}
          register={register}
          name="password"
        />
        <Link to={ROUTES.FORGOT_PASSWORD.path}>
          <div className="mb-4 text-sm text-primary">Forgot password ?</div>
        </Link>
        <div className="mb-5">
          <Button
            isLoading={loginApi.isPending}
            type="submit"
            className="w-full justify-center"
          >
            Sign In
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
          Sign In
        </h2>
      </div>
      <div className="dark:bg-boxdark dark:border-strokedark rounded-sm border border-stroke bg-white shadow-default">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="px-26 py-17.5 text-center">
              <p className="2xl:px-20"></p>
              <span className="mt-15 inline-block">
                <LoginPageIcon />
              </span>
            </div>
          </div>
          <div className="dark:border-strokedark w-full border-stroke xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
);

const loginFromSchema = z.object({
  email: z.string(), //.email().min(1, "Please enter a valid email"),
  password: z.string().min(1, "Please enter a password"),
});
