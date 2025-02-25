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
      <h2 className="text-center mb-4" style={{ color: "#ffc107" }}>
        People We Partner With
      </h2>
      <div className="overflow-hidden">
        <div className="d-flex animate-scroll">
          {/* Render the partners twice for seamless scrolling */}
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="partner-card d-flex justify-content-center align-items-center bg-white rounded-4 shadow-lg mx-3"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="partner-logo"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerSection;
