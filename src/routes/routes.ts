import { route, string } from "react-router-typesafe-routes/dom";

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
      LIST_JOBS: route("list-jobs", {
        searchParams: {
          department: string().default(""),
          location: string().default(""),
          scrape_from: string().default(""),
        },
      }),
      LIST_CANDIDATE: route("list-candidate"),
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
      LIST_JOBS: route("list-jobs"),
      LIST_CANDIDATE: route("list-candidate"),
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
