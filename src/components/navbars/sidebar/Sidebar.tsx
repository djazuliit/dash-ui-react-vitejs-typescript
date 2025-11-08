// import node module libraries
import { Fragment, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { ListGroup, Card, Image, Badge, Accordion } from "react-bootstrap";
import SimpleBar from "simplebar-react";

import api from "../../../api/axios"; // pastikan path sesuai

interface AppData {
  name_app: string;
  logo: string;
  // tambahkan properti lain sesuai response API
}
// import custom components
import { CustomToggle } from "./CustomToggle";

// import dynamic menu generator
import { getDashboardMenu } from "routes/DashboardRoutes";
import { DashboardMenuProps } from "types";

interface SidebarProps {
  showMenu: boolean;
  toggleMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ showMenu, toggleMenu }) => {
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [appData, setAppData] = useState<AppData | null>(null); // 🔹 Type the state
  const [logoLoading, setLogoLoading] = useState(true);
  
  // Ambil level user dari localStorage (default = 0 jika belum login)
  const userLevel = parseInt(localStorage.getItem("user_level") || "0");

  // Dapatkan menu berdasarkan level user
  const DashboardMenu = getDashboardMenu(userLevel);

  useEffect(() => {
      const fetchAppData = async () => {
        try {
          const res = await api.get("/app/first");
          if (res.data) {
            setAppData(res.data);
          }
        } catch (err) {
          console.error("Gagal memuat data aplikasi:", err);
        } finally {
          setLogoLoading(false);
        }
      };
  
      fetchAppData();
    }, []);

  const generateLink = (item: any) => {
    return (
      <Link
        to={item.link}
        className={`nav-link ${location.pathname === item.link ? "active" : ""}`}
        onClick={() => (isMobile ? toggleMenu() : showMenu)}
      >
        {item.name || item.title}
        {item.badge && (
          <Badge className="ms-1" bg={item.badgecolor || "primary"}>
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <Fragment>
      <SimpleBar style={{ maxHeight: "100vh" }}>
        <div className="nav-scroller text-center py-3 border-bottom">
          <Link to="/">
              {logoLoading ? (
                <div className="mb-3" style={{ height: '40px' }}>
                  Loading...
                </div>
              ) : appData?.logo ? (
                <Image
                  src={`http://localhost:5000/uploads/app/${appData.logo}`}
                  className="mb-3"
                  alt="Logo"
                  height={40}
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <Image
                  src="/images/brand/logo/logo-primary.svg"
                  className="mb-3"
                  alt="Logo"
                  height={40}
                />
              )}
            </Link>
        </div>

        {/* Dashboard Menu */}
        <Accordion defaultActiveKey="0" as="ul" className="navbar-nav flex-column">
          {DashboardMenu.map(function (menu: DashboardMenuProps, index: number) {
            if (menu.grouptitle) {
              return (
                <Card bsPrefix="nav-item" key={menu.id}>
                  <div className="navbar-heading">{menu.title}</div>
                </Card>
              );
            } else if (menu.children) {
              // Menu dengan sub-menu
              return (
                <Fragment key={menu.id}>
                  <CustomToggle eventKey={menu.id} icon={menu.icon}>
                    {menu.title}
                    {menu.badge && (
                      <Badge
                        className="ms-1"
                        bg={menu.badgecolor || "primary"}
                      >
                        {menu.badge}
                      </Badge>
                    )}
                  </CustomToggle>
                  <Accordion.Collapse eventKey={menu.id} as="li" bsPrefix="nav-item">
                    <ListGroup as="ul" className="nav flex-column">
                      {menu.children.map(function (subMenu, subIndex) {
                        return (
                          <ListGroup.Item
                            key={subIndex}
                            as="li"
                            bsPrefix="nav-item"
                          >
                            {generateLink(subMenu)}
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </Accordion.Collapse>
                </Fragment>
              );
            } else {
              // Menu tanpa anak (langsung link)
              return (
                <Card bsPrefix="nav-item" key={index}>
                  <Link
                    to={menu.link ?? "#"}
                    className={`nav-link ${
                      location.pathname === menu.link ? "active" : ""
                    }`}
                  >
                    {typeof menu.icon === "string" ? (
                      <i className={`nav-icon fe fe-${menu.icon} me-2`}></i>
                    ) : (
                      menu.icon
                    )}
                    {menu.title}
                    {menu.badge && (
                      <Badge
                        className="ms-1"
                        bg={menu.badgecolor || "primary"}
                      >
                        {menu.badge}
                      </Badge>
                    )}
                  </Link>
                </Card>
              );
            }
          })}
        </Accordion>
      </SimpleBar>
    </Fragment>
  );
};

export default Sidebar;
