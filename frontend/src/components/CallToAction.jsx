import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CallToAction = () => {
  return (
    <section className="text-light py-4 mt-5" style={{ background: "#005f8f" }}>
      <div className="container text-center">
        <h3
          className="mb-4"
          style={{ fontWeight: "bold", fontSize: "2.3rem", color: "#FFC107" }}
        >
          Join Us in Transforming Education
        </h3>
        <p className="mb-3 text-white" style={{ fontSize: "1.2rem" }}>
          Your contribution can make a difference. Together, we can provide
          resources, inspire learning, and empower communities.
        </p>
        <div>
          <Link
            to="/login"
            className="btn btn-lg mx-2"
            style={{
              background: "#FFC107",
              color: "black",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
          >
            Donate Now
          </Link>
          <Link
            to="/signup"
            className="btn btn-lg mx-2"
            style={{
              background: "#FFC107",
              color: "black",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
