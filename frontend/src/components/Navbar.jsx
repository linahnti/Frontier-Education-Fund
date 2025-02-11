import React, { useContext } from "react";
import { AuthContext } from "./components/AuthContext";
import HomepageNavbar from "./components/HomepageNavbar";
import AuthenticatedNavbar from "./components/AuthenticatedNavbar";

const Navbar = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? <AuthenticatedNavbar /> : <HomepageNavbar />;
};

export default Navbar;
