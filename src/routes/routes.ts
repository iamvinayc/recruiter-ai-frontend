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
      LIST_EMPLOYER: route("list-employer", {
        searchParams: {
          name: string().default(""),
        },
      }),
      LIST_JOBS: route("list-jobs", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
          scrape_from: string().default(""),
          scrape_to: string().default(""),
          sort_by: string().default(SortBy.Latest),
          common: string().default(""),
          search: string().default(""),
          job_id: string().default(""),
        },
      }),
      LIST_CANDIDATE: route("list-candidate"),
      LIST_SCORING: route("list-scoring", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
        },
      }),
      ONBOARDING: route("onboarding", {
        searchParams: {
          id: string().default(""),
          notification_id: string().default(""),
          onboarding_id: string().default(""),
        },
      }),
      LIST_REPORT: route("list-report", {
        searchParams: {
          status: string().default(""),
          from_date: string().default(""),
          to_date: string().default(""),
          employer: string().default(""),
          employer_name: string().default(""),
        },
      }),
      LIST_NOTIFICATION: route("list-notification", {
        searchParams: {
          notification_id: string().default(""),
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
      LIST_EMPLOYER: route("list-employer"),
      LIST_JOBS: route("list-jobs"),
      LIST_CANDIDATE: route("list-candidate"),
      LIST_SCORING: route("list-scoring", {
        searchParams: {
          skill: string().default(""),
          location: string().default(""),
        },
      }),
      ONBOARDING: route("onboarding", {
        searchParams: {
          id: string().default(""),
          notification_id: string().default(""),
          onboarding_id: string().default(""),
        },
      }),
      LIST_REPORT: route("list-report", {
        searchParams: {
          status: string().default(""),
          from_date: string().default(""),
          to_date: string().default(""),
          employer: string().default(""),
          employer_name: string().default(""),
        },
      }),
      LIST_NOTIFICATION: route("list-notification"),
    },
  ),
  QUESTIONNAIRE: route("questionnaire", {
    searchParams: {
      candidate: string().default(""),
    },
  }),
  EMPLOYER: route(
    "employer",
    {},
    {
      CANDIDATE_SUBMIT: route("candidate-submit", {
        searchParams: {
          employer: string().default(""),
        },
      }),
      AGREEMENT: route("agreement", {
        searchParams: {
          employer: string().default(""),
        },
      }),
    },
  ),
  FEEDBACKSUBMIT: route("feedback", {
    searchParams: {
      employer: string().default(""),
      candidate: string().default(""),
      id: string().default(""),
    },
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
