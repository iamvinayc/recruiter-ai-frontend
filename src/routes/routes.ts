import { route, string } from "react-router-typesafe-routes/dom";

export enum SortBy {
  Alphabetical = "alphabetical",
  Latest = "latest",
}
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
      LIST_SKILL: route("list-skill"),
      LIST_RECRUITER: route("list-recruiter"),
      LIST_LOCATION: route("list-location"),
      LIST_JOBS: route("list-jobs", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
          scrape_from: string().default(""),
          scrape_to: string().default(""),
          sort_by: string().default(SortBy.Latest),
        },
      }),
      LIST_CANDIDATE: route("list-candidate"),
      LIST_SCORING: route("list-scoring", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
        },
      }),
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
      LIST_SCORING: route("list-scoring", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
        },
      }),
    },
  ),
  QUESTIONNAIRE: route("questionnaire", {
    searchParams: {
      candidate: string().default("")
    }
  }),
  EMPLOYERCANDIDATESUBMIT: route("employer-candidate-submit", {
    searchParams: {
      employer: string().default("")
    }
  }),
  FEEDBACKSUBMIT: route("feedback", {
    searchParams: {
      employer: string().default(""),
      candidate: string().default(""),
      id: string().default("")
    }
  }),
  
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
