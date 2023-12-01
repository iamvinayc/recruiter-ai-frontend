import { useLocalStorage } from "usehooks-ts";
import { z } from "zod";

export const UserSpec = z.object({
  token: z.string(),
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  change_password: z.boolean(),
  role: z.string(),
  // username: z.string(),
});

export type LoggedInUserData = z.TypeOf<typeof UserSpec>;
const KEY = "user";
export function useLogin() {
  const [user, setUser] = useLocalStorage<LoggedInUserData | null>(KEY, null);
  const isLoggedIn = user !== null;
  const logout = () => setUser(null);
  const isRecruiter = user?.role === "RECRUITER";
  return {
    user,
    isLoggedIn,
    isRecruiter,
    logout,
    setUser: (user: LoggedInUserData | null) => {
      const { success } = UserSpec.safeParse(user);
      if (success || user == null) {
        setUser(user);
      } else {
        console.log("invalid user object");
      }
      //
    },
  };
}

export const getLoginToken = () => {
  try {
    const user = JSON.parse(
      localStorage.getItem(KEY) ?? "",
    ) as LoggedInUserData;
    return user.token;
  } catch (error) {
    //
  }
  return "";
};
