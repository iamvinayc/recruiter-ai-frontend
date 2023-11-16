import { ReactNode, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useLogin } from "../../hooks/useLogin";
import { ROUTES } from "../../routes/routes";

export const ProtectPage = ({
  children,
  isProtected,
}: {
  children?: ReactNode;
  isProtected?: boolean;
}) => {
  const { user } = useLogin();
  const _navigate = useNavigate();
  const navigate = useCallback(_navigate, [_navigate]);

  useEffect(() => {
    const isLoggedIn = user !== null;
    if (isProtected) {
      if (isLoggedIn) {
        if (user.role === "RECRUITER") {
          if (user.change_password) {
            return navigate(ROUTES.RECRUITER.CHANGE_PASSWORD.path);
          }
        }
      } else return navigate(ROUTES.LOGIN.path);
      // if (isLoggedIn) return navigate(ROUTES.DASHBOARD.path);
      // else return navigate(ROUTES.LOGIN.path);
    } else {
      if (isLoggedIn) {
        console.log(
          "ROUTES.RECRUITER.DASHBOARD.path",
          ROUTES.RECRUITER.DASHBOARD.path,
          isLoggedIn,
        );

        if (user.role === "RECRUITER") {
          if (user.change_password) {
            return navigate(ROUTES.RECRUITER.CHANGE_PASSWORD.path);
          }
          return navigate(ROUTES.RECRUITER.DASHBOARD.path, { replace: true });
        }
        if (user.role === "ADMIN") {
          return navigate(ROUTES.ADMIN.DASHBOARD.path, { replace: true });
        } else {
          alert(`case not handler for ${user.role}`);
        }
      }
    }
  }, [user, isProtected, navigate]);

  // TODO: prevent showing the page for a flash seconds if the permissions are not correct
  return <>{children}</>;
};
