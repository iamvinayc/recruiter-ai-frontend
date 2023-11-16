import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";

export function AppRouter() {
  return (
    <WithProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WithProvider>
  );
}

//#region provider
const queryClient = new QueryClient();
const WithProvider = ({ children }: { children: JSX.Element | string }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
//#endregion
