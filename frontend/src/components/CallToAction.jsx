import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CallToAction = () => {
  return (
    <section className="bg-dark bg-gradient text-light py-4 mt-5">
      <div className="container text-center">
        <h3
          className="mb-4"
          style={{ fontWeight: "bold", fontSize: "2.3rem", color: " #004080" }}
        >
          Join Us in Transforming Education
        </h3>
        <p className="mb-3 text-white" style={{ fontSize: "1.2rem" }}>
          Your contribution can make a difference. Together, we can provide
          resources, inspire learning, and empower communities.
        </p>
        <div>
          <button
            className="btn btn-primary btn-lg mx-2"
            style={{ borderRadius: "20px" }}
          >
            Donate Now
          </button>
          <button
            className="btn btn-outline-light btn-lg mx-2"
            style={{ borderRadius: "20px" }}
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
