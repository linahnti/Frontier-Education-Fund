import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import assets from "../assets/images/assets";
import "../styles/MissionVisionGoals.css"; 

const MissionVisionGoals = () => {
  const sections = [
    {
      title: "Our Mission",
      text: "To ensure quality education for every child by bridging the gap between donors and underpriviledged schools, by providing a transparent platform that fosters impactful change fostering a brighter future.",
      imgSrc: assets.mvg6,
      imgAlt: "Mission Image",
      reverse: false, 
    },
    {
      title: "Our Vision",
      text: "To see every child learning in a safe, equipped environment, with access to resources that unlock their full potential. To eliminate educational disparities by connecting schools with the resources they need to flourish.",
      imgSrc: assets.mvg4,
      imgAlt: "Vision Image",
      reverse: true,
    },
    {
      title: "Our Goals",
      text: "To provide resources, build infrastructure, and empower communities to prioritize education for future generations. Foster trust and accountability by offering detailed project tracking and personalized impact updates. Offer a seamless and secure donation experience to maximize user engagement.",
      imgSrc: assets.mvg7,
      imgAlt: "Goals Image",
      reverse: false, 
    },
  ];

  return (
    <div className="container py-5">
      {sections.map((section, index) => (
        <div
          key={index}
          className={`row align-items-center my-5 ${
            section.reverse ? "flex-row-reverse" : ""
          }`}
        >
          {/* Image */}
          <div className="col-md-6 text-center">
            <img
              src={section.imgSrc}
              alt={section.imgAlt}
              className="img-fluid rounded shadow"
            />
          </div>
          {/* Text */}
          <div className="col-md-6">
            <h2 className="mb-4">{section.title}</h2>
            <p className="lead">{section.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MissionVisionGoals;
