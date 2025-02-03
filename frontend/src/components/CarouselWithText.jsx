import React from "react";
import { Carousel } from "react-bootstrap";
import "animate.css"; // For animated text
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "../styles/CarouselWithText.css"; // Custom CSS for word-by-word animation
import assets from "../assets/images/assets";

const CarouselWithText = () => {
  return (
    <div>
      <Carousel
        controls={false}
        indicators={false}
        interval={4000}
        pause={false}
      >
        {/* Slide 1 */}
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={assets.picture3}
            alt="Children studying under a tree"
            style={{ height: "400px", objectFit: "cover" }} // Adjust height and fit
          />
          <Carousel.Caption className="d-flex flex-column justify-content-center h-100">
            <h3
              className="animate__animated animate__fadeInDown"
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#004080", // Blue color for heading
              }}
            >
              <span className="word-by-word">
                Welcome to Frontier Education Fund
              </span>
            </h3>
            <p
              className="animate__animated animate__fadeInUp"
              style={{
                fontSize: "2rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#ffffff",
              }}
            >
              <span className="word-by-word">
                Join us in building a brighter future, one school at a time.
              </span>
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={assets.picture4}
            alt="Children writing on chalkboard outside"
            style={{ height: "400px", objectFit: "cover" }} // Adjust height and fit
          />
          <Carousel.Caption className="d-flex flex-column justify-content-center h-100">
            <h3
              className="animate__animated animate__fadeInDown"
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#004080", // Blue color for heading
              }}
            >
              <span className="word-by-word">
                Suport Education, Transform Lives
              </span>
            </h3>
            <p
              className="animate__animated animate__fadeInUp"
              style={{
                fontSize: "2rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#ffffff",
              }}
            >
              <span className="word-by-word">
                Your donations provide resources, inspire learning, and empower
                communities.
              </span>
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 3 */}
        <Carousel.Item>
          <img
            className="d-block w-100"
            src={assets.picture2}
            alt="Children reading books outside"
            style={{ height: "400px", objectFit: "cover" }} // Adjust height and fit
          />
          <Carousel.Caption className="d-flex flex-column justify-content-center h-100">
            <h3
              className="animate__animated animate__fadeInDown"
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#004080", // Blue color for heading
              }}
            >
              <span className="word-by-word">
                Empowering Schools, Unlocking Potential
              </span>
            </h3>
            <p
              className="animate__animated animate__fadeInUp"
              style={{
                fontSize: "2rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#ffffff",
              }}
            >
              <span className="word-by-word">
                Post your needs, connect with donors, and unlock new
                opportunities.
              </span>
            </p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};

export default CarouselWithText;
