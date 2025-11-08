import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import RootLayout from "layouts/RootLayout";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import ForgetPassword from "pages/auth/ForgetPassword";
import SignUp from "pages/auth/SignUp";
import AkunWA from "pages/Akunwa";

// Dashboard Pages
import Dashboard from "pages/dashboard/Index";
import NotFound from "pages/dashboard/pages/NotFound";
import LayoutVertical from "pages/dashboard/LayoutVertical";
import Documentation from "pages/dashboard/Documentation";
import ChangeLog from "pages/dashboard/Changelog";

// Bootstrap components
import Accordion from "./bootstrap-components/Accordions";
import Alerts from "./bootstrap-components/Alerts";
import Badges from "./bootstrap-components/Badges";
import Breadcrumbs from "./bootstrap-components/Breadcrumbs";
import ButtonGroup from "./bootstrap-components/ButtonGroup";
import Buttons from "./bootstrap-components/Buttons";
import Cards from "./bootstrap-components/Cards";
import Carousels from "./bootstrap-components/Carousels";
import CloseButtons from "./bootstrap-components/CloseButton";
import Collapses from "./bootstrap-components/Collapse";
import Dropdowns from "./bootstrap-components/Dropdowns";
import Listgroups from "./bootstrap-components/ListGroup";
import Modals from "./bootstrap-components/Modals";
import Navbars from "./bootstrap-components/Navbars";
import Navs from "./bootstrap-components/Navs";
import Offcanvas from "./bootstrap-components/Offcanvas";
import Overlays from "./bootstrap-components/Overlays";
import Paginations from "./bootstrap-components/Paginations";
import Popovers from "./bootstrap-components/Popovers";
import Progress from "./bootstrap-components/Progress";
import Spinners from "./bootstrap-components/Spinners";
import Toasts from "./bootstrap-components/Toasts";
import Tooltips from "./bootstrap-components/Tooltips";
import Tables from "./bootstrap-components/Tables";

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
            { path: "/documentation", Component: Documentation },
            { path: "/changelog", Component: ChangeLog },
            { path: "/layout-vertical", Component: LayoutVertical },
            {
              path: "/components",
              children: [
                { path: "accordions", Component: Accordion },
                { path: "alerts", Component: Alerts },
                { path: "badges", Component: Badges },
                { path: "breadcrumbs", Component: Breadcrumbs },
                { path: "button-group", Component: ButtonGroup },
                { path: "buttons", Component: Buttons },
                { path: "cards", Component: Cards },
                { path: "carousels", Component: Carousels },
                { path: "close-button", Component: CloseButtons },
                { path: "collapse", Component: Collapses },
                { path: "dropdowns", Component: Dropdowns },
                { path: "list-group", Component: Listgroups },
                { path: "modal", Component: Modals },
                { path: "navbar", Component: Navbars },
                { path: "navs", Component: Navs },
                { path: "offcanvas", Component: Offcanvas },
                { path: "overlays", Component: Overlays },
                { path: "pagination", Component: Paginations },
                { path: "popovers", Component: Popovers },
                { path: "progress", Component: Progress },
                { path: "spinners", Component: Spinners },
                { path: "tables", Component: Tables },
                { path: "toasts", Component: Toasts },
                { path: "tooltips", Component: Tooltips },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
