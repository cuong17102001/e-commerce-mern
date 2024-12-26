import React, { Fragment, createContext } from "react";
import { Navber, Footer, CartModal } from "../partials";
import LoginSignup from "../auth/LoginSignup";
import Chat from "../chat/Chat";

export const LayoutContext = createContext();

const Layout = ({ children }) => {

  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const user = jwt ? jwt.user : null

  return (
    <Fragment>
      <div className="flex-grow">
        
        <Navber />
        <LoginSignup />
        <CartModal />
        {/* All Children pass from here */}
        {children}
      </div>
      {user ? <Chat /> : <></> }
      <Footer />
    </Fragment>
  );
};

export default Layout;
