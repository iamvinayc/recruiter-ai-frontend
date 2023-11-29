import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

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
      params?: undefined;
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
        department?: string;
        location?: string;
        scrape_from?: string;
        sort?: string;
      };
      data?: undefined;
    };
    response: JobListingResponse;
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
          phone2?: string;
        };
        departments: {
          id?: number;
          name: string;
          description: string;
        }[];
        city: string;

        handle: string;
        platform: string;
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
        department?: string;
        location?: string;
        scrape_from?: string;
        sort?: string;
      };
      data?: undefined;
    };
    response: CandidateListResponse;
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
        city: string;
        description?: string;
        phone?: string;
        profile_url?: string;
        resume_file?: string;
        handle: string;
        platform: string;
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
  message: string;
  isSuccess: boolean;
  status: number;
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
}

interface DashboardOverviewResponse {
  data: {
    total_candidates: number;
    total_jobs: number;
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
}

interface JobListingResponseData {
  id: number;
  employer: Employer;
  departments: Department[];
  location: Location;
  title: string;
  description: string;
  expires_on: string;
  platform: string;
  city: string;
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
}

interface CandidateListResponseData {
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
