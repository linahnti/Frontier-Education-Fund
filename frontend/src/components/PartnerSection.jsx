import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/PartnerSection.css";

const partners = [
  { name: "John Doe", type: "Individual", logo: "/path-to-logo1.png" },
  { name: "Tech Corp", type: "Company", logo: "/path-to-logo2.png" },
  { name: "Global NGO", type: "NGO", logo: "/path-to-logo3.png" },
  {
    name: "Ministry of Education",
    type: "Government",
    logo: "/path-to-logo4.png",
  },
  {
    name: "Education Alliance",
    type: "Organization",
    logo: "/path-to-logo5.png",
  },
];

const PartnerSection = () => {
  return (
    <div className="bg-light py-5">
      <h2 className="text-center text-primary mb-4">People We Partner With</h2>
      <div className="overflow-hidden">
        <div className="d-flex animate-scroll">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="d-flex justify-content-center align-items-center bg-white rounded shadow-lg mx-3"
              style={{ width: "12rem", height: "12rem" }}
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-100 h-100 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerSection;
