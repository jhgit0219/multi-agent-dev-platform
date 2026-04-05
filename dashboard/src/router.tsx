import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import ProjectOverview from "./pages/ProjectOverview";
import IterationTimeline from "./pages/IterationTimeline";
import TeamPanels from "./pages/TeamPanels";
import LogStream from "./pages/LogStream";
import ReportsArchive from "./pages/ReportsArchive";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ProjectOverview /> },
      { path: "timeline", element: <IterationTimeline /> },
      { path: "teams", element: <TeamPanels /> },
      { path: "logs", element: <LogStream /> },
      { path: "reports", element: <ReportsArchive /> },
      { path: "users", element: <UserManagement /> },
    ],
  },
]);
