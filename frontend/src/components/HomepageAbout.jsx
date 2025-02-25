import React from "react";
import assets from "../assets/images/assets";

const HomepageAbout = () => {
  console.log("HomepageAbout component is rendering!"); // Debugging log

  return (
    <section id="about" className="py-5" style={{ backgroundColor: "#c5e1f7" }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <img
              src={assets.school1}
              alt="About Frontier Education Fund"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h2 className="text-warning fw-bold">About Us</h2>
            <p className="text-muted">
              Frontier Education Fund is dedicated to ensuring quality education
              for every child, especially in underserved communities. Through
              donations and partnerships, we provide essential resources like
              classrooms, books, and learning materials.
            </p>
            <a href="#donations" className="btn btn-warning px-4 py-2">
              Support Our Mission
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageAbout;
