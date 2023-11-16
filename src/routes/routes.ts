import { route } from "react-router-typesafe-routes/dom";

export const ROUTES = {
  LOGIN: route(""),
  FORGOT_PASSWORD: route("forgot-password"),
  //
  ADMIN: route(
    "admin",
    {},
    {
      LOGIN: route("login"),
      DASHBOARD: route("dashboard"),
      LIST_DEPARTMENT: route("list-department"),
      LIST_RECRUITER: route("list-recruiter"),
      LIST_LOCATION: route("list-location"),
    },
  ),
  //
  RECRUITER: route(
    "recruiter",
    {},
    {
      LOGIN: route("login"),
      DASHBOARD: route("dashboard"),
      CHANGE_PASSWORD: route("change-password"),
    },
  ),
  //
  // DASHBOARD: route(
  //   "dashboard",
  //   {},
  //   {
  //     CUSTOMER: route("customer/:id", {
  //       params: {
  //         id: number().defined(),
  //       },
  //     }),
  //   },
  // ),
};
