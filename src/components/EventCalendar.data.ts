import { EventItem } from "./EventCalendar";

const data: ActionsData[] = [
  {
    candidate: {
      id: 69,
      name: "dotcand",
    },
    job: {
      id: 99,
      title: ".Net Developer",
    },
    employer: {
      id: 83,
      name: "dotnet employer",
    },
    action: {
      interview: {
        onboarding_id: 8,
        status: "SHORTLISTED",
      },
    },
    type: "Recruiter Interview Pending",
  },
  {
    candidate: {
      id: 70,
      name: "dotcand2",
    },
    job: {
      id: 99,
      title: ".Net Developer",
    },
    employer: {
      id: 83,
      name: "dotnet employer",
    },
    action: {
      interview: {
        onboarding_id: 10,
        status: "SHORTLISTED",
      },
    },
    type: "Recruiter Interview Pending",
  },
  {
    candidate: {
      id: 69,
      name: "dotcand",
    },
    job: {
      id: 70,
      title: "software developer1",
    },
    employer: {
      id: 60,
      name: "sqltech",
    },
    action: {
      interview: {
        onboarding_id: 13,
        status: "SHORTLISTED",
      },
    },
    type: "Recruiter Interview Pending",
  },
  {
    candidate: {
      id: 74,
      name: "SeniorsSQLcand2",
    },
    job: {
      id: 70,
      title: "software developer1",
    },
    employer: {
      id: 60,
      name: "sqltech",
    },
    action: {
      interview: {
        onboarding_id: 14,
        status: "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO",
        date: "2024-04-17",
        time: "10:21:00",
      },
    },
    type: "Update Video Interview Scheduled Status to be Completed",
  },
  {
    candidate: {
      id: 74,
      name: "SeniorsSQLcand2",
    },
    job: {
      id: 70,
      title: "software developer1",
    },
    employer: {
      id: 60,
      name: "sqltech",
    },
    action: {
      interview: {
        onboarding_id: 14,
        status: "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO",
        date: "2024-04-18",
        time: "10:21:00",
      },
    },
    type: "Update Video Interview Scheduled Status to be Completed",
  },
];

export const events_data: EventItem[] = data
  .filter((e) => !!e.action.interview.date && !!e.action.interview.time)
  .map<EventItem>((e) => ({
    candidate_name: e.candidate.name,
    interview_date: [e.action?.interview?.date, e.action?.interview?.time].join(
      " ",
    ),
    job_title: e.job.title,
    pending_action: e.type,
    id: e.action.interview.onboarding_id,
    title: e.type,
  }));
//   .filter((e) => !!e.action.interview.date && !!e.action.interview.time)
//   .map((e) => ({
//     id: e.action.interview.onboarding_id,
//     date: new Date(`${e.action.interview.date}T${e.action.interview.time}Z`),
//     status: e.action.interview.status,
//     title: e.type,
//     candidate: e.candidate.name,
//     job: e.job.title,
//     employer: e.employer.name,
//   }));

export interface ActionsResponse {
  data: ActionsData[];
  message: string;
  isSuccess: boolean;
  status: number;
}

export interface ActionsData {
  candidate: Candidate;
  job: Job;
  employer: Candidate;
  action: Action;
  type: string;
}

export interface Action {
  interview: Interview;
}

export interface Interview {
  onboarding_id: number;
  status: string;
  date?: string;
  time?: string;
}

export interface Candidate {
  id: number;
  name: string;
}

export interface Job {
  id: number;
  title: string;
}
