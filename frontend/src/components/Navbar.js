import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, isAdmin, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <img src="logo.png" width="43" height="auto" alt="Logo" />
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                Eshop
              </Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link active" to="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <form className="d-flex ml-auto">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" to="/Kosik">
                  Košík
                </Link>
              </li>
            </ul>
            {isLoggedIn ? (
              <button className="btn btn-info" type="button" onClick={onLogout}>
                Odhlásit se
              </button>
            ) : (
              <Link className="btn btn-info" to="/login">
                Přihlásit se
              </Link>
            )}
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
