//import node module libraries
import { Outlet } from "react-router";
import Sidebar from "components/navbars/sidebar/Sidebar";
import Header from "components/navbars/topbar/Header";
import { Image } from "react-bootstrap";
import { useState } from "react";

const RootLayout = () => {
  const [showMenu, setShowMenu] = useState(true);
  const ToggleMenu = () => {
    return setShowMenu(!showMenu);
  };

  return (
    <section className="bg-light">
      <div id="db-wrapper" className={`${showMenu ? "" : "toggled"}`}>
        <div className="navbar-vertical navbar">
          <Sidebar showMenu={showMenu} toggleMenu={ToggleMenu} />
        </div>
        <div id="page-content">
          <div className="header">
            <Header toggleMenu={ToggleMenu} />
          </div>
          <Outlet />
        </div>
      </div>

      
    </section>
  );
};

export default RootLayout;
