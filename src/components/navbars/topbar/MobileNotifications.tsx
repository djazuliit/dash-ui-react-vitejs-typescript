import { Link, useNavigate } from "react-router-dom";
import { ListGroup, Dropdown, Image } from "react-bootstrap";
import { NotificationList } from "./NotificationList";
import { NotificationProps } from "types";

interface MobileNotificationProps {
  data: NotificationProps[];
}

export const MobileNotifications: React.FC<MobileNotificationProps> = ({
  data,
}) => {
  const navigate = useNavigate();

  // ✅ Ambil data user dari localStorage
  const userJSON = localStorage.getItem("user");
  const user = userJSON ? JSON.parse(userJSON) : null;

  // ✅ Tentukan role berdasarkan level
  const userLevelName = user?.level === 1 ? "Administrator" : "Pengguna";

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_level");

    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <ListGroup
      as="ul"
      bsPrefix="navbar-nav"
      className="navbar-right-wrap ms-auto d-flex nav-top-wrap"
    >
      {/* 🔔 NOTIFIKASI */}
      <Dropdown as="li" className="stopevent">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          id="dropdownNotification"
          className="btn btn-light btn-icon rounded-circle indicator indicator-primary text-muted"
        >
          <i className="fe fe-bell"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu
          className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-end py-0"
          aria-labelledby="dropdownNotification"
          align="end"
        >
          <Dropdown.Item className="mt-3" bsPrefix=" " as="div">
            <div className="border-bottom px-3 pt-0 pb-3 d-flex justify-content-between align-items-end">
              <span className="h4 mb-0">Notifications</span>
              <Link to="/" className="text-muted">
                <span className="align-middle">
                  <i className="fe fe-settings me-1"></i>
                </span>
              </Link>
            </div>
            <NotificationList notificationItems={data} />
            <div className="border-top px-3 pt-3 pb-3">
              <Link
                to="/dashboard/notification-history"
                className="text-link fw-semi-bold"
              >
                See all Notifications
              </Link>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* 👤 USER MENU */}
      <Dropdown as="li" className="ms-2">
        <Dropdown.Toggle
          as="a"
          bsPrefix=" "
          className="rounded-circle"
          id="dropdownUser"
        >
          <div className="avatar avatar-md avatar-indicators avatar-online">
            <Image
              alt="avatar"
              src="/images/avatar/avatar-1.jpg"
              className="rounded-circle"
            />
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="dropdown-menu dropdown-menu-end"
          align="end"
          aria-labelledby="dropdownUser"
        >
          <Dropdown.Item as="div" className="px-4 pb-0 pt-2" bsPrefix=" ">
            <div className="lh-1">
              {/* ✅ Nama User */}
              <h5 className="mb-1">{user?.name || "Tidak Ada Nama"}</h5>
              <small className="text-muted">{userLevelName}</small>
            </div>
            <div className="dropdown-divider mt-3 mb-2"></div>
          </Dropdown.Item>

          <Dropdown.Item eventKey="2" as={Link} to="/pages/profile">
            <i className="fe fe-user me-2"></i> Profile
          </Dropdown.Item>

          {/* ✅ LOGOUT */}
          <Dropdown.Item onClick={handleLogout}>
            <i className="fe fe-power me-2 text-danger"></i> Sign Out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </ListGroup>
  );
};
