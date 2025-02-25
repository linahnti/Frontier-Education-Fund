import React from "react";

const HomepageDonations = () => {
  return (
    <section
      id="donations"
      className="py-5"
      style={{ backgroundColor: "#c5e1f7" }}
    >
      <div className="container text-center">
        <h2 className="text-warning fw-bold">Make a Difference</h2>
        <p className="text-muted">
          Your donations help us build schools, provide learning materials, and
          support students in need.
        </p>
        <a href="/login" className="btn btn-warning px-4 py-2">
          Donate Now
        </a>
      </div>
    </section>
  );
};

export default HomepageDonations;
