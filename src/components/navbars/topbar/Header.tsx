// import node module libraries
import { Menu } from "react-feather";
import { Link } from "react-router-dom";
import { Nav, Navbar} from "react-bootstrap";

// import sub components
import Notifications from "./Notifications";

interface HeaderProps {
  toggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu }) => {
  return (
    <Navbar className="navbar-classic navbar navbar-expand-lg">
      <div className="d-flex justify-content-between w-100">
        <div className="d-flex align-items-center">
          <Link
            to="#"
            id="nav-toggle"
            className="nav-icon me-2 icon-xs"
            onClick={() => toggleMenu()}
          >
            <Menu size="18px" />
          </Link>
          
        </div>
        {/* Quick Menu */}
        <Nav className="navbar-right-wrap ms-2 d-flex nav-top-wrap">
          <Notifications />
        </Nav>
      </div>
    </Navbar>
  );
};

export default Header;
