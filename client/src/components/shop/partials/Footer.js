import React, { Fragment } from "react";
import moment from "moment";

const Footer = (props) => {
  return (
    <Fragment>
      <footer
        style={{ background: "#303031", color: "#87898A", marginTop: 150 }}
        className="z-10 py-6 px-4 md:px-12 text-center"
      >
         Final project of Nguyen Quoc Cuong And Nguyen Duc Hoan {moment().format("YYYY")}
      </footer>
    </Fragment>
  );
};

export default Footer;
