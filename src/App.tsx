import { useEffect } from "react";
import api from "./api/axios"; // sesuaikan path jika beda

import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import RootLayout from "layouts/RootLayout";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import ForgetPassword from "pages/auth/ForgetPassword";
import ForgotPasswordConfirm from "pages/auth/ForgotPasswordConfirm";
import ResetPassword from "pages/auth/ResetPassword";
import SignUp from "pages/auth/SignUp";
import VerifyOtp from "pages/auth/VerifyOtp";
import AkunWA from "pages/Akunwa";
import Target from "pages/Target";
import Wdsettings from "pages/Wdsettings";
import AppSettings from "pages/Appsetting";
import Withdraw from "pages/WdUser";
import Profile from "pages/Profile";
import WdManagement from "pages/WdManagement";
import UserManagement from "pages/UserManagement";
import LaporanManagement from "pages/LaporanManagement";

// Dashboard Pages
import Dashboard from "pages/dashboard/Index";
import NotFound from "pages/dashboard/pages/NotFound";

// Import ProtectedRoute
import ProtectedRoute from "hooks/ProtectedRoute";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/auth",
      Component: AuthenticationLayout,
      children: [
        { path: "sign-in", Component: SignIn },
        { path: "sign-up", Component: SignUp },
        { path: "forget-password", Component: ForgetPassword },
        { path: "forgot-password-confirm", Component: ForgotPasswordConfirm},
        { path: "reset-password", Component: ResetPassword },
        { path: "verify-otp", Component: VerifyOtp },
      ],
    },
    {
      // Semua route ini dilindungi login
      element: <ProtectedRoute />,
      children: [
        {
          id: "root",
          path: "/",
          Component: RootLayout,
          errorElement: <NotFound />,
          children: [
            { path: "/", Component: Dashboard },
            { path: "/pages/akunwa", Component: AkunWA },
            { path: "/pages/target", Component: Target },
            { path: "/pages/appsetting", Component: AppSettings },
            { path: "/pages/wdsettings", Component: Wdsettings },
            { path: "/pages/wduser", Component: Withdraw },
            { path: "/pages/profile", Component: Profile },
            { path: "/pages/wdmanagement", Component: WdManagement },
            { path: "/pages/usermanagement", Component: UserManagement },
            { path: "/pages/laporanmanagement", Component: LaporanManagement },
            
          ],
        },
      ],
    },
  ]);

  // ✅ Fetch app data dan update favicon + title
  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const res = await api.get("/app/first");
        const data = res.data;

        // ✅ Update Title
        document.title = data.nama_app || "Aplikasi WA Blast";

        // ✅ Update Favicon
        const faviconUrl = data.favicon
          ? `http://localhost:5000/uploads/app/${data.favicon}`
          : "/favicon.ico";

        let link: any = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = faviconUrl;
      } catch (err) {
        console.error("Gagal fetch app data:", err);
      }
    };

    fetchAppData();
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
