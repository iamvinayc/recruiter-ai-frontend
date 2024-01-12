import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { FeedbackPage } from "@/pages/FeedbackPage";
import { EmployerCandidateSubmitPage } from "@/pages/EmployerCandidateSubmitPage";
import { QuestionnairePage } from "@/pages/QuestionnairePage";
import { ListScoringPage } from "@/pages/ListScoringPage";
import { ProtectPage } from "../components/common/ProtectPage";
import { AdminDashboardLayout } from "../layouts/AdminDashboardLayout";
import { RecruiterDashboardLayout } from "../layouts/RecruiterDashboardLayout";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminListCandidatePage } from "../pages/AdminListCandidatePage";
import { AdminListDepartmentPage } from "../pages/AdminListDepartmentPage";
import { AdminListJobPage } from "../pages/AdminListJobPage";
import { AdminListLocationPage } from "../pages/AdminListLocationPage";
import { AdminListRecruiterPage } from "../pages/AdminListRecruiterPage";
import { ChangePasswordPage } from "../pages/ChangePasswordPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { LoginPage } from "../pages/LoginPage";
import { ROUTES } from "./routes";
import OnboardingListPage from "@/pages/OnboardingListPage";
import { ReportListPage } from "@/pages/ReportListPage";

export function AppRouter() {
  return (
    <WithProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTES.ADMIN.path}
            element={
              <ProtectPage isProtected>
                <AdminDashboardLayout />
              </ProtectPage>
            }
          >
            <Route
              path={ROUTES.ADMIN.DASHBOARD.path}
              element={<AdminDashboardPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_SKILL.path}
              element={<AdminListDepartmentPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_RECRUITER.path}
              element={<AdminListRecruiterPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_LOCATION.path}
              element={<AdminListLocationPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_JOBS.path}
              element={<AdminListJobPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_CANDIDATE.path}
              element={<AdminListCandidatePage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_SCORING.path}
              element={<ListScoringPage />}
            />
            <Route
              path={ROUTES.ADMIN.ONBOARDING.path}
              element={<OnboardingListPage />}
            />
            <Route
              path={ROUTES.ADMIN.LIST_REPORT.path}
              element={<ReportListPage />}
            />
          </Route>

          <Route
            path={ROUTES.RECRUITER.path}
            element={
              <ProtectPage isProtected>
                <RecruiterDashboardLayout />
              </ProtectPage>
            }
          >
            <Route
              path={ROUTES.RECRUITER.DASHBOARD.path}
              element={<AdminDashboardPage />}
            />
            <Route
              path={ROUTES.RECRUITER.CHANGE_PASSWORD.path}
              element={<ChangePasswordPage />}
            />
            <Route
              path={ROUTES.RECRUITER.LIST_JOBS.path}
              element={<AdminListJobPage />}
            />
            <Route
              path={ROUTES.RECRUITER.LIST_CANDIDATE.path}
              element={<AdminListCandidatePage />}
            />
            <Route
              path={ROUTES.RECRUITER.LIST_SCORING.path}
              element={<ListScoringPage />}
            />
            <Route
              path={ROUTES.RECRUITER.ONBOARDING.path}
              element={<OnboardingListPage />}
            />
            <Route
              path={ROUTES.RECRUITER.LIST_REPORT.path}
              element={<ReportListPage />}
            />
          </Route>
          <Route
            path={ROUTES.FORGOT_PASSWORD.path}
            element={<ForgotPasswordPage />}
          />

          <Route
            path={ROUTES.LOGIN.path}
            element={
              <ProtectPage>
                <LoginPage />
              </ProtectPage>
            }
          />
          <Route
            path={ROUTES.QUESTIONNAIRE.path}
            element={<QuestionnairePage />}
          />
          <Route
            path={ROUTES.EMPLOYER.CANDIDATE_SUBMIT.path}
            element={<EmployerCandidateSubmitPage />}
          />
          <Route path={ROUTES.FEEDBACKSUBMIT.path} element={<FeedbackPage />} />
        </Routes>
      </BrowserRouter>
    </WithProvider>
  );
}

//#region provider
const queryClient = new QueryClient();
const WithProvider = ({ children }: { children: JSX.Element | string }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" containerStyle={{ zIndex: 100000 }} />
    </QueryClientProvider>
  );
};
//#endregion
