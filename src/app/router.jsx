import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ROUTES } from "./routes.constant";
import PageShell from "../components/layout/PageShell";
import RequireAuth from "../auth/RequireAuth";

const Dashboard = lazy(() => import("../pages/dashboard.page.jsx"));
const Login = lazy(() => import("../pages/login.page.jsx"));
const NotFound = lazy(() => import("../pages/not-found.page.jsx"));

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<div />}>
        <Login />
      </Suspense>
    ),
  },

  {
    element: (
      <RequireAuth>
        <PageShell />
      </RequireAuth>
    ),
    errorElement: (
      <Suspense fallback={<div />}>
        <NotFound />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div />}>
            <Dashboard />
          </Suspense>
        ),
      },
      { path: ROUTES.CONTRACTORS, element: <div>Contractors</div> },
      { path: ROUTES.CONTRACTOR_DETAIL, element: <div>Contractor detail</div> },
      { path: ROUTES.INVITATIONS, element: <div>Invitations</div> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
