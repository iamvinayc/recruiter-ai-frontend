/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import { CandidateReportListItem } from "@/pages/CandidateReportListPage";
import { EmployerReportListItem } from "@/pages/EmployerReportListPage";
import { API_BASE_URL } from "../utils/constants";

axios.interceptors.request.use((val) => {
  try {
    const token = JSON.parse(localStorage.getItem("user") as string).token;
    if (!val.headers.has("Authorization")) {
      localStorage.getItem("");
      val.headers.set("Authorization", `Token ${token}`);
    }
  } catch (error) {
    //
  }

  return val;
});
axios.interceptors.response.use(
  (res) => {
    return res;
  },
  (e: AxiosError) => {
    if (e?.response?.status === 401) {
      localStorage.setItem("user", JSON.stringify(null));
      window.location.href = "/";
    }
  },
);
export const axiosApi = <
  Url extends keyof AllApiEndpoints,
  T extends AllApiEndpoints[Url]["request"],
>({
  method,
  params,
  url,
  ...config
}: {
  url: Url;
  method: AllApiEndpoints[Url]["request"]["method"];
} & Omit<Omit<Omit<AxiosRequestConfig, "url">, "method">, "data"> & {
    // remove optional property
    [K in keyof T]-?: T[K];
  }): Promise<AxiosResponse<AllApiEndpoints[Url]["response"]>> => {
  return axios({
    url: url,
    method: method,
    params,
    baseURL: API_BASE_URL,
    ...config,
  });
};

export interface ResumeFileUploadResponse {
  resume_email: string;
  resume_phone: string;
  resume_file: string;
  resume_file_uuid: string;
  resume_text: string;
  resume_skills: {
    name: string;
    description: string;
  }[];
}

//#region

interface AllApiEndpoints {
  "user/login/": {
    request: {
      method: "POST";
      params?: undefined;
      data: {
        email: string;
        password: string;
      };
    };
    response: SuccessLoginResponse;
  };
  "data-sourcing/department/": {
    request: {
      method: "GET";
      params: DepartmentListingResponseParams;
      data?: undefined;
    };
    response: DepartmentListingResponse;
  };
  "data-sourcing/department": {
    request: {
      method: "POST";
      params?: undefined;
      data: { name: string; description: string };
    };
    response: SuccessResponse;
  };
  "dashboard/overview/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response: DashboardOverviewResponse;
  };
  "data-sourcing/location/": {
    request: {
      method: "GET";
      params?: {
        name?: string;
      };
      data?: undefined;
    };
    response: ListLocationResponse;
  };
  "data-sourcing/location": {
    request: {
      method: "POST";
      params?: undefined;
      data?: { name: string };
    };
    response: AddLocationResponse;
  };
  "user/recruiter/": {
    request: {
      method: "GET";
      params?: { location?: string; department?: string };
      data?: undefined;
    };
    response: RecruiterListResponse;
  };
  "user/register/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: { first_name: string; last_name: string; email: string };
    };
    response: RecruiterAddResponse;
  };
  "user/config/": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: { is_active: boolean };
    };
    response: SuccessResponse;
  };
  "user/recruiter_department": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: { departments: number[] };
    };
    response: SuccessResponse;
  };
  "user/change_password/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: { old_password: string; new_password: string };
    };
    response: SuccessResponse;
  };
  "user/forget_password/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: { email: string };
    };
    response: SuccessResponse;
  };
  "user/reset_password/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: { token: string; password: string };
    };
    response: SuccessResponse;
  };
  "user/recruiter_location/": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: {
        locations: number[];
      };
    };
    response: SuccessResponse;
  };
  "data-sourcing/job/": {
    request: {
      method: "GET";
      params: {
        department?: any;
        location?: string;
        from_date?: string;
        to_date?: string;
        sort?: string;
        common?: string;
        search?: string;
        id?: string;
        open_jobs?: string;
        non_responsive_jobs?: string;
        interview_scheduled_jobs?: string;
        today_scrapped_jobs?: string;
        responded_jobs?: string;
        non_matched_jobs?: string;
        employer_name?: string;
        job_id?: string;
      };
      data?: undefined;
    };
    response: JobListingResponse;
  };
  "data-sourcing/job/{{jobId}}/": {
    request: {
      method: "GET";
      params: {
        department?: string;
        location?: string;
        from_date?: string;
        to_date?: string;
        sort?: string;
        common?: string;
        search?: string;
        id?: string;
      };
      data?: undefined;
    };
    response: JobListingResponse;
  };
  "data-sourcing/job//": {
    request: {
      method: "DELETE";
      params?: undefined;
      data?: undefined;
    };
    response: SuccessResponse;
  };
  "data-sourcing/job": {
    request: {
      method: "POST";
      params?: undefined;
      data?: {
        title: string;
        description?: string;
        expires_on: string;
        employer: {
          employer_label: string;
          email: string;
          phone1?: string;
          phone2?: string | null;
        };
        departments: {
          id?: number;
          name: string;
          description: string;
        }[];
        location: {
          name: string;
        };
        handle: string;
        platform: string;
        sector: string;
        joining_period?: string | null;
        package?: string | null;
      };
    };
    response: {
      data: {
        id: number;
      };
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/job/{{id}}/": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: {
        title: string;
        description: string;
        departments: {
          name: string;
          description: string;
        }[];
        location: {
          name: string;
        };
        sector: string;
        joining_period: string | null;
        package: string | null;
        job_link: string;
        job_type: string;
      };
    };
    response: {
      data: {
        id: number;
      };
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/candidate/": {
    request: {
      method: "GET";
      params: {
        resume?: string;
        department?: any;
        location?: string;
        from_date?: string;
        to_date?: string;
        sort?: string;
        common?: string;
        search?: string;
        open_candidates?: string;
        non_responsive_candidates?: string;
        interview_scheduled_candidates?: string;
        today_scrapped_candidates?: string;
        responded_candidates?: string;
        non_matched_candidates?: string;
        final_followedup_candidates?: string;
      };
      data?: undefined;
    };
    response: CandidateListResponse;
  };
  "data-sourcing/candidate/{{candidateId}}/": {
    request: {
      method: "GET";
      params: {
        department?: string;
        location?: string;
        from_date?: string;
        to_date?: string;
        sort?: string;
        common?: string;
        search?: string;
      };
      data?: undefined;
    };
    response: CandidateListResponse;
  };
  "onboarding/history/:candidateId/:onboardingId/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response: OnboardingHistoryResponse;
  };
  "onboarding/comments/:onboardingId/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: FormData;
    };
    response: OnboardingHistoryResponse;
  };
  "onboarding/scoring/": {
    request: {
      method: "GET";
      params: {
        department?: string;
        location?: string;
      };
      data?: undefined;
    };
    response: ScoringListResponse;
  };
  "onboarding/job/history/{{jobId}}/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response: OnboardingJobHistory;
  };
  "onboarding/candidates_score/": {
    request: {
      method: "GET";
      params: {
        department?: string;
        location?: string;
        job_id?: string;
        candidate_id?: string; // TODO: check if it implemented
        is_employer_notified?: boolean;
        name?: string;
        email?: string;
      };
      data?: undefined;
    };
    response: CandidateScoringResponse;
  };
  "onboarding/scored_jobs/": {
    request: {
      method: "GET";
      params?: {
        search: string;
        employer: string;
      };
      data?: undefined;
    };
    response: ScoredJobsResponse;
  };
  "onboarding/questionnaire/": {
    request: {
      method: "GET";
      params: {
        candidate?: string;
      };
      data?: undefined;
    };
    response: QuestionnaireResponseData;
  };
  "onboarding/questionnaire_submit/": {
    request: {
      method: "POST";
      params: {
        candidate?: string;
      };
      data: {
        questionnaire: {
          question_id: number;
          selected_option_id: number;
        }[];
        availability: {
          available: boolean;
          available_on: string;
        };
        prefer_contract: boolean;
        file_token: string;
        phone_number: string;
      };
    };
    response: SuccessResponse;
  };

  "onboarding/employer/scoring/": {
    request: {
      method: "GET";
      params: {
        employer?: string;
      };
      data?: undefined;
    };
    response: EmployerMatchingCandidatesResponseData;
  };
  "onboarding/employer/candidate_submit/": {
    request: {
      method: "POST";
      data: {
        employer_email: string;
        jobs: {
          prefer_contract: boolean;
          expired: boolean;
          job_id: string;
          candidates: {
            candidate_id: string;
          }[];
        }[];
      };
    };
    response: SuccessResponse;
  };
  "onboarding/feedback/": {
    request: {
      method: "POST";
      data: {
        onboarding_handle: string;
        candidate_handle: string | null;
        employer_handle: string | null;
        feedback: string;
      };
    };
    response: SuccessResponse;
  };

  "data-sourcing/candidate//": {
    request: {
      method: "DELETE";
      params?: undefined;
      data?: undefined;
    };
    response: SuccessResponse;
  };
  "data-sourcing/candidate": {
    request: {
      method: "POST";
      params?: undefined;
      data?: {
        name: string;
        email: string;
        departments: {
          name: string;
          description?: string;
          id?: number;
        }[];
        location: {
          name: string;
        };
        description?: string;
        phone?: string;
        profile_url?: string | null;
        resume_file?: string | null;
        handle: string;
        platform: string;
        sector: string;
        resume_data?: ResumeFileUploadResponse;
        notice_period?: string | null;
        visa_details?: string | null;
        package?: string | null;
      };
    };
    response: {
      data: {
        id: number;
      };
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/public/add_candidate/": {
    request: {
      method: "POST";
      params?: undefined;
      data?: {
        name: string;
        email: string;
        departments: [];
        location: {
          name: string;
        };
        description?: string;
        phone?: string;
        profile_url?: string | null;
        handle?: string;
        platform: string;
        resume_data?: ResumeFileUploadResponse;
      };
    };
    response: {
      data: object;
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/candidate/:id": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: {
        name?: string;
        email?: string;
        phone?: string;
        description?: string;
        profile_url?: string;
        departments?: {
          name: string;
          description: string;
        }[];
        location?: {
          name: string;
        };
        notice_period?: string | null;
        visa_details?: string | null;
        package?: string | null;
        sector?: string;
        resume_data?: ResumeFileUploadResponse;
      };
    };
    response: {
      data: {
        id: number;
      };
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/candidate/resume_upload/": {
    request: {
      method: "POST";
      params?: undefined;
      data: FormData;
    };
    response: {
      message: string;
      isSuccess: boolean;
      status: number;
      data: ResumeFileUploadResponse;
    };
  };
  "data-sourcing/candidate/resume_download/:id/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response:
      | {
          message?: string;
          isSuccess?: boolean;
          status?: number;
          data?: undefined;
        }
      | Blob;
  };
  "onboarding/employee_onboarding/": {
    request: {
      method: "GET";
      params?: {
        id?: string;
        candidate_search?: string;
        job_search?: string;
        employer_search?: string;
      };
      data?: undefined;
    };
    response: OnboardingListingResponse;
  };
  "onboarding/status/{id}/": {
    request: {
      method: "PUT";
      params?: undefined;
      data: {
        status: OnboardingStatus;
        reason_for_rejection?: string;
        video_interview_on?: string;
        f2f_interview_on?: string;
        followup_reason?: string;
        followup_on?: string;
      };
    };
    response: SuccessResponse;
  };
  "report/onboarding/": {
    request: {
      method: "GET";
      params?: {
        status?: string;
        employer?: string;
        from_date?: string;
        to_date?: string;
      };
      data?: undefined;
    };
    response: ReportListResponse;
  };
  "report/candidate/": {
    request: {
      method: "GET";
      params?: {
        department?: any;
        candidate?: string;
        location?: string;
        from_date?: string;
        to_date?: string;
        sector?: string | null;
        export_to_excel?: boolean;
      };
      data?: undefined;
    };
    response: CandidateReportListResponse;
  };
  "report/employer/": {
    request: {
      method: "GET";
      params?: {
        department?: any;
        location?: string;
        from_date?: string;
        to_date?: string;
        sector?: string | null;
        export_to_excel?: boolean;
      };
      data?: undefined;
    };
    response: EmployerReportListResponse;
  };
  "data-sourcing/employer/": {
    request: {
      method: "GET";
      params?: {
        id?: string;
        per_page?: number;
        page?: number;
        name?: string;
        final_followedup_employers?: string;
        email?: string;
      };
      data?: undefined;
    };
    response: ListEmployerResponse;
  };
  "data-sourcing/employer/{{id}}": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: {
        employer_label: string;
        email: string;
        phone1?: string;
        phone2?: string;
        hr_url?: string;
      };
    };
    response: {
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "onboarding/resume_upload/": {
    request: {
      method: "POST";
      params: {
        candidate: string;
      };
      data?: FormData;
    };
    response: {
      data: {
        file_token: string;
      };
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "user/recruiter/actions/": {
    request: {
      method: "GET";
      params: {
        date: string;
      };
      data?: undefined;
    };
    response: {
      data: {
        candidate: {
          id: number;
          name: string;
        };
        job: {
          id: number;
          title: string;
        };
        employer: {
          id: number;
          name: string;
        };
        action: {
          interview: {
            onboarding_id: number;
            date: string;
            time: string;
          };
        };
        type: string;
      }[];
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/employer/show_interest/": {
    request: {
      method: "POST";
      params: {
        employer: string;
      };
      data?: FormData;
    };
    response: {
      data: object;
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/employer/block/:id/": {
    request: {
      method: "PATCH";
      params: undefined;
      data?: {
        blocked: boolean;
      };
    };
    response: {
      data: object;
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "data-sourcing/candidate/block/:id/": {
    request: {
      method: "PATCH";
      params: undefined;
      data?: {
        blocked: boolean;
      };
    };
    response: {
      data: object;
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "notification/": {
    request: {
      method: "GET";
      params?: {
        page?: number;
        page_size?: number;
      };
      data?: undefined;
    };
    response: NotificationListResponse;
  };
  "notification/{{notificationId}}/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response: {
      data: NotificationListData;
    };
  };
  "dashboard/calender_events/": {
    request: {
      method: "GET";
      params: {
        from_date: string;
        to_date: string;
      };
      data?: undefined;
    };
    response: CalendarEventsResponse;
  };
  "notification/:id/": {
    request: {
      method: "PUT";
      params?: undefined;
      data?: undefined;
    };
    response: {
      data: unknown;
      message: string;
      isSuccess: boolean;
      status: number;
    };
  };
  "dashboard/candidate_summary/": {
    request: {
      method: "GET";
      params?: {
        candidate_name?: string;
      };
      data?: undefined;
    };
    response: CandidateSummaryResponse;
  };
  "data-sourcing/employer/history/{{employerId}}/": {
    request: {
      method: "GET";
      params?: undefined;
      data?: undefined;
    };
    response: EmployerHistoryResponse;
  };
  "candidate/unsubscribe/": {
    request: {
      method: "GET";
      params: {
        candidate: string;
      };
      data?: undefined;
    };
    response: SuccessResponse;
  };
  "employer/unsubscribe/": {
    request: {
      method: "GET";
      params: {
        employer: string;
      };
      data?: undefined;
    };
    response: SuccessResponse;
  };
}
//#endregion

//#region

interface ScoredJobsResponse {
  data: ScoredJobsResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next: string;
  previous: null;
  count: number;
}

interface ScoredJobsResponseData {
  id: number;
  title: string;
  departments: ScoredJobsDepartment[];
  employer: ScoredJobsEmployer;
  location: ScoredJobsLocation;
}

interface ScoredJobsLocation {
  id: number;
  name: string;
}

interface ScoredJobsEmployer {
  id: number;
  employer_label: string;
  email: string;
  phone1: string;
  phone2: string;
  is_interested: boolean;
  is_final_followup_sent: boolean;
  is_unsubscribed: boolean;
  is_blocked: boolean;
}

interface ScoredJobsDepartment {
  id: number;
  name: string;
  description: string;
}
interface SuccessLoginResponse {
  data: SuccessLoginResponseData;
  message: string;
  isSuccess: boolean;
  status: number;
}

interface SuccessLoginResponseData {
  token: string;
  user: SuccessLoginResponseUser;
}

interface SuccessLoginResponseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  change_password: boolean;
}
interface DepartmentListingResponse {
  data: DepartmentListingResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next: string;
  previous: null;
  count: number;
}

interface DepartmentListingResponseData {
  id: number;
  name: string;
  description: string;
}
interface DepartmentListingResponseParams {
  /**
   * @type type = 0|1
   */
  type: number;
  page_size: number;
  name?: string;
}

interface CandidateSummaryResponse {
  data: CandidateSummaryResponseData[];
  message: string;
  isSuccess: boolean;
  status: number;
  next: string | null;
  previous?: string | null;
}

interface CandidateSummaryResponseData {
  id: number;
  name: string;
  email: string;
  jobs: {
    job_id: number;
    job_name: string;
    onboarding_id?: number;
    scoring_id: number;
    status: string;
  }[];
}

interface DashboardOverviewResponse {
  data: {
    total_candidates: number;
    total_jobs: number;
    total_non_responsive_candidates: number;
    total_non_responsive_jobs: number;
    total_open_candt: number;
    total_open_jobs: number;
    total_interview_scheduled_candidates: number;
    total_interview_scheduled_jobs: number;
    total_candt_scrapped_tdy: number;
    total_jobs_scrapped_tdy: number;
    total_responded_candidates: number;
    total_responded_jobs: number;
    total_non_matched_candidates: number;
    total_non_matched_jobs: number;
    total_final_followedup_candidates: number;
    total_final_followedup_employers: number;
  };
  message: string;
  isSuccess: boolean;
  status: number;
}
interface ListLocationResponse {
  data: {
    id: number;
    name: string;
  }[];
  message: string;
  isSuccess: boolean;
  status: number;
}
interface AddLocationResponse {
  data: {
    id: number;
    name: string;
  };
  message: string;
  isSuccess: boolean;
  status: number;
}

interface RecruiterListResponse {
  data: RecruiterListResponseData[];
  message: string;
  isSuccess: boolean;
  status: number;
}

interface RecruiterListResponseData {
  id: number;
  city: string;
  user: User;
  departments: RecruiterListResponseDataDepartment[];
  location: RecruiterListResponseDataLocation[];
}

interface RecruiterListResponseDataLocation {
  id: number;
  name: string;
}

interface RecruiterListResponseDataDepartment {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  change_password: boolean;
  is_active: boolean;
}

interface RecruiterAddResponse {
  data: RecruiterAddResponseData;
  message: string;
  isSuccess: boolean;
  status: number;
}

interface RecruiterAddResponseData {
  token: string;
  user: RecruiterAddResponseUser;
}

type RecruiterAddResponseUser = User;
interface SuccessResponse {
  data: Data;
  message: string;
  isSuccess: boolean;
  status: number;
}

interface Data {}

interface JobListingResponse {
  data: JobListingResponseData[];
  message: string;
  isSuccess: boolean;
  status: number;
  next: string | null;
  previous?: string | null;
}

export interface JobListingResponseData {
  id: number;
  employer: Employer;
  departments: Department[];
  location: Location;
  title: string;
  description: string;
  expires_on: string;
  platform: string;
  city: string;
  job_link: string | null;
  job_type: string;
  sector: string;
  joining_period: string | null;
  package: string | null;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

interface Employer {
  id: number;
  location: Location;
  employer_label: string;
  email: string;
  phone1: string;
  phone2: string;
  hr_url: string | null;
}

interface Location {
  id: number;
  name: string;
}

interface CandidateListResponse {
  data: CandidateListResponseData[];
  message: string;
  isSuccess: boolean;
  status: number;
  next?: string | null;
  previous?: string | null;
}

export interface CandidateListResponseData {
  id: number;
  departments: Department[];
  location: Location;
  name: string;
  description?: string;
  email: string;
  phone: string;
  profile_url: string;
  resume_file: string;
  handle: string;
  platform: string;
  city: string;
  is_blocked: boolean;
  sector: string;
  notice_period: string | null;
  visa_details: string | null;
  package: string | null;
}

interface Location {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}
//#endregion
//#region
interface CalendarEventsResponse {
  data: CalendarEventsData[];
  message: string;
  isSuccess: boolean;
  status: number;
}

interface CalendarEventsData {
  candidate: {
    id: number;
    name: string;
  };
  job: {
    id: number;
    title: string;
  };
  employer: {
    id: number;
    name: string;
  };
  action: {
    interview: {
      onboarding_id: number;
      date: string;
      time: string;
    };
  };
  type: string;
}

interface NotificationListResponse {
  data: NotificationListData[];
  status: number;
  is_success: boolean;
  message: string;
  next: string;
  previous: null;
  count: number;
  unread_count: number;
}

interface NotificationListData {
  id: number;
  recruiter_name: null;
  to_name: string;
  to_email: string;
  subject: string;
  content: string;
  is_followup: boolean;
  is_admin_read: boolean;
  is_user_read: boolean;
  created_at: string;
}
interface ScoringListResponse {
  data: ScoringListResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next?: string | null;
  previous?: string | null;
  count: number;
}

interface ScoringListResponseData {
  candidate_id: number;
  candidate_name: string;
  candidate_departments: ScoringListCandidateDepartment[];
  candidate_location: string;
  job_id: number;
  job_title: string;
  job_departments: ScoringListCandidateDepartment[];
  job_location: string;
  profile_score: string;
  overall_score?: null | number;
  reasons?: null | number;
  symmary: string;
}

interface ScoringListCandidateDepartment {
  id: number;
  name: string;
  description: string;
}

// ---

interface CandidateScoringResponse {
  data: ListCandidateScoringResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next?: string | null;
  previous?: string | null;
  count: number;
}

interface ListCandidateScoringResponseData {
  candidate: ListCandidateScoringResponseCandidate;
  profile_score: string;
  overall_score?: string | null;
  symmary: string;
  reasons?: string | string[] | null;
  is_employer_notified: boolean;
}

interface ListCandidateScoringResponseCandidate {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    change_password: boolean;
  };
  departments: {
    id: number;
    name: string;
    description: string;
  }[];
  location: {
    id: number;
    name: string;
  };
  city: string;
  questionnaire_score?: string | null;
  name: string;
  email: string;
  phone: string;
  description: string;
  profile_url: string;
  resume_file: string;
  platform: string;
  handle: string;
  online_on?: string | null;
}

interface QuestionnaireResponseData {
  data: QuestionnaireData[];
  message: string;
  isSuccess: boolean;
  status: number;
}
interface QuestionnaireData {
  id: number;
  question: string;
  options: {
    id: number;
    option: string;
  }[];
}

interface EmployerMatchingCandidatesResponseData {
  data: EmployerMatchingCandidatesData[];
  message: string;
  isSuccess: boolean;
  status: number;
}
interface EmployerMatchingCandidatesData {
  job_id: string;
  job_title: string;
  candidates: {
    candidate_id: string;
    candidate_name: string;
    skills: {
      name: string;
    }[];
    reasons: string | string[];
    details: string;
  }[];
}

interface OnboardingListingResponse {
  data: OnboardingListingResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next?: string;
  previous?: string;
  count: number;
}

interface OnboardingListingResponseData {
  id: number;
  job: Job;
  candidate: Candidate;
  employer: Employer;
  scoring: Scoring;
  interview_scheduled_recruiter_video?: string;
  interviewed_recruiter_video?: string;
  interview_scheduled_recruiter_f2f?: string;
  interviewed_recruiter_f2f?: string;
  employer_selection_marked_recruiter?: string;
  placed_marked_recruiter?: string;
  rejected_by_recruiter?: string;
  cancelled_by_recruiter?: string;
  status: OnboardingStatus;
  video_interview_on?: string;
  f2f_interview_on?: string;
  employer_feedback?: string;
  candidate_feedback?: string;
  reason_for_rejection?: string;
  followup?: boolean;
  followup_on?: string;
  followup_reason?: string;
  interview_rescheduled_recruiter_video?: string;
  interview_rescheduled_recruiter_f2f?: string;
  updated_at: string;
  is_editable: boolean;
}

interface Scoring {
  id: number;
  job: Job;
  candidate: Candidate;
  profile_score: string;
  overall_score: string;
  reasons: string | string[];
  symmary: string;
  is_employer_notified: boolean;
  is_calculating: boolean;
}

interface Candidate {
  id: number;
  user: User;
  departments: Department[];
  location: Location;
  city: string;
  questionnaire_score: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  profile_url: string;
  resume_file?: string;
  platform: string;
  handle: string;
  online_on?: string;
  is_unsubscribed: boolean;
}

interface Job {
  id: number;
  user: User;
  employer: Employer;
  departments: Department[];
  location: Location;
  city: string;
  title: string;
  description: string;
  expires_on: string;
  platform: string;
  handle: string;
}

interface Location {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

interface Employer {
  id: number;
  employer_label: string;
  email: string;
  phone1: string;
  phone2: string;
  is_interested: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  change_password: boolean;
}

interface ReportListResponse {
  data: ReportListResponseData[];
  message: string;
  isSuccess: boolean;
  status: number;
}

interface ReportListResponseData {
  candidate_name: string;
  job_title: string;
  employer_name: string;
  status: string;
}

interface CandidateReportListResponse {
  data: CandidateReportListItem[];
  message: string;
  isSuccess: boolean;
  status: number;
  next?: string | null;
  previous?: string | null;
}

interface EmployerReportListResponse {
  data: EmployerReportListItem[];
  message: string;
  isSuccess: boolean;
  status: number;
  next?: string | null;
  previous?: string | null;
}

interface ListEmployerResponse {
  data: ListEmployerResponseData[];
  status: number;
  is_success: boolean;
  message: string;
  next: string;
  previous: string;
  count: number;
}

interface ListEmployerResponseData {
  id: number;
  employer_label: string;
  email: string;
  phone1?: string;
  phone2?: string;
  is_interested: boolean;
  is_blocked: boolean;
  hr_url: string | null;
}

interface EmployerHistoryResponse {
  data: {
    job_id: number;
    job_title: string;
    candidates: {
      candidate_id: number;
      candidate_name: string;
      data:
        | {
            type: "comment" | "notification" | "status_change";
            datetime: string;
            title: string;
            related_message?: null | string;
            related_date?: null | string;
            status?:
              | "CANCELLED"
              | "REJECTED"
              | "PLACED"
              | "EMPLOYER_SELECTED"
              | "EMPLOYER_INTERVIEWED_F2F"
              | "EMPLOYER_INTERVIEW_RESCHEDULED_F2F"
              | "EMPLOYER_INTERVIEW_SCHEDULED_F2F"
              | "EMPLOYER_INTERVIEWED_VIDEO"
              | "EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO"
              | "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO"
              | "RECRUITER_INTERVIEWED"
              | "Recruiter Followup"
              | "FEEDBACK_SUBMITTED_BY_CANDIDATE"
              | "FEEDBACK_SUBMITTED_BY_EMPLOYER";
            notification_id?: number;
          }[]
        | [];
    }[];
  }[];
  message: string;
  isSuccess: boolean;
  status: number;
}

export type OnboardingHistoryResponseType =
  OnboardingHistoryResponse["data"][0]["type"];
interface OnboardingHistoryResponse {
  data: {
    type: "comment" | "notification" | "status_change";
    datetime: string;
    title: string;
    related_message?: null | string;
    related_date?: null | string;
    status?:
      | "CANCELLED"
      | "REJECTED"
      | "PLACED"
      | "EMPLOYER_SELECTED"
      | "EMPLOYER_INTERVIEWED_F2F"
      | "EMPLOYER_INTERVIEW_RESCHEDULED_F2F"
      | "EMPLOYER_INTERVIEW_SCHEDULED_F2F"
      | "EMPLOYER_INTERVIEWED_VIDEO"
      | "EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO"
      | "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO"
      | "RECRUITER_INTERVIEWED"
      | "Recruiter Followup"
      | "FEEDBACK_SUBMITTED_BY_CANDIDATE"
      | "FEEDBACK_SUBMITTED_BY_EMPLOYER";
    notification_id?: number;
  }[];
  message: string;
  isSuccess: boolean;
  status: number;
}

interface OnboardingJobHistory {
  data: {
    candidates: {
      onboarding_id: number;
      candidate_name: string;
      datetime: string;
      current_status: string;
    }[];
  };
  message: string;
  isSuccess: boolean;
  status: number;
}

export enum OnboardingStatus {
  SHORTLISTED = "SHORTLISTED",
  RECRUITER_INTERVIEWED = "RECRUITER_INTERVIEWED",
  EMPLOYER_INTERVIEW_SCHEDULED_VIDEO = "EMPLOYER_INTERVIEW_SCHEDULED_VIDEO",
  EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO = "EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO",
  EMPLOYER_INTERVIEWED_VIDEO = "EMPLOYER_INTERVIEWED_VIDEO",
  EMPLOYER_INTERVIEW_SCHEDULED_F2F = "EMPLOYER_INTERVIEW_SCHEDULED_F2F",
  EMPLOYER_INTERVIEW_RESCHEDULED_F2F = "EMPLOYER_INTERVIEW_RESCHEDULED_F2F",
  EMPLOYER_INTERVIEWED_F2F = "EMPLOYER_INTERVIEWED_F2F",
  EMPLOYER_SELECTED = "EMPLOYER_SELECTED",
  PLACED = "PLACED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EMPLOYER_FEEDBACK_SUBMITTED = "EMPLOYER_FEEDBACK_SUBMITTED",
  CANDIDATE_FEEDBACK_SUBMITTED = "CANDIDATE_FEEDBACK_SUBMITTED",
}
export const OnboardingStatusColorMap = {
  SHORTLISTED: "#9333EA",
  RECRUITER_INTERVIEWED: "#B5C18E",
  EMPLOYER_INTERVIEW_SCHEDULED_VIDEO: "#7AB2B2",
  EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO: "#C7B7A3",
  EMPLOYER_INTERVIEW_SCHEDULED_F2F: "#7469B6",
  EMPLOYER_INTERVIEW_RESCHEDULED_F2F: "#03AED2",
  EMPLOYER_INTERVIEWED_VIDEO: "#FF76CE",
  EMPLOYER_INTERVIEWED_F2F: "#5356FF",
  EMPLOYER_SELECTED: "#41B06E",
  PLACED: "#55BCE7",
  REJECTED: "#F7418F",
  CANCELLED: "#F7418F",
  EMPLOYER_FEEDBACK_SUBMITTED: "#9BCF53",
  CANDIDATE_FEEDBACK_SUBMITTED: "#9BCF53",
} as const;

export const OnboardingStatusMap = {
  SHORTLISTED: "Shortlisted",
  RECRUITER_INTERVIEWED: "Candidate called by the recruiter",
  EMPLOYER_INTERVIEW_SCHEDULED_VIDEO:
    "Video Conference Scheduled (Recruiter, Candidate, Employer)",
  EMPLOYER_INTERVIEW_RESCHEDULED_VIDEO:
    "Video Conference Rescheduled (Recruiter, Candidate, Employer)",
  EMPLOYER_INTERVIEWED_VIDEO:
    "Video Conference Completed (Recruiter, Candidate, Employer)",
  EMPLOYER_INTERVIEW_SCHEDULED_F2F:
    "Face to Face Interview Scheduled (Candidate, Employer)",
  EMPLOYER_INTERVIEW_RESCHEDULED_F2F:
    "Face to Face Interview Rescheduled (Candidate, Employer)",
  EMPLOYER_INTERVIEWED_F2F:
    "Face to Face Interview Completed (Candidate, Employer)",
  EMPLOYER_SELECTED: "Selected by Employer",
  PLACED: "Placed",
  EMPLOYER_FEEDBACK_SUBMITTED: "Feedback Submitted by Employer",
  CANDIDATE_FEEDBACK_SUBMITTED: "Feedback Submitted by Candidate",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};
export const formatOnboardingStatus = (status: string) =>
  OnboardingStatusMap[status as OnboardingStatus] || status;

export const sectorsMap = [
  { value: "IT", label: "IT" },
  { value: "Finance", label: "Finance" },
];
//#endregion
