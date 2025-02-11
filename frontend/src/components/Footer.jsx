import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // For social media icons
import assets from "../assets/images/assets";

const Footer = () => {
  return (
    <footer
      className="text-white py-4 position-relative"
      style={{
        backgroundImage: `url(${assets.footer3})`, // Add your background image path here
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay to reduce contrast */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // Adjust opacity (0.6) for darkness
      ></div>

      <Container className="position-relative">
        <Row>
          {/* Column 1: Logo and Webpage Name */}
          <Col md={3} className="mb-3">
            <img
              src={assets.favicon}
              alt="Logo"
              style={{ maxWidth: "150px" }}
            />
            <p className="text-white" style={{ fontSize: "1.5rem" }}>
              Frontier Education Fund
            </p>
          </Col>

          {/* Column 2: FAQ */}
          <Col md={3} className="mb-3">
            <h5 style={{ fontSize: "1.1rem" }}>FAQ</h5>
            <ul className="list-unstyled text-small">
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  How to Donate
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Volunteer Opportunities
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: Contact Us */}
          <Col md={3} className="mb-3">
            <h5 style={{ fontSize: "1.1rem" }}>Contact Us</h5>
            <ul className="list-unstyled text-small">
              <li>
                <strong style={{ fontSize: "0.9rem" }}>Email:</strong>{" "}
                <a
                  href="mailto:info@frontiereducationfund.com"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  info@frontiereducationfund.com
                </a>
              </li>
              <li>
                <strong style={{ fontSize: "0.9rem" }}>Phone:</strong> +254 700
                000 000
              </li>
              <li>
                <strong style={{ fontSize: "0.9rem" }}>Social Media:</strong>
              </li>
              <li>
                <a href="https://facebook.com" className="text-white me-2">
                  <FaFacebook />
                </a>
                <a href="https://twitter.com" className="text-white me-2">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com" className="text-white me-2">
                  <FaInstagram />
                </a>
                <a href="https://linkedin.com" className="text-white">
                  <FaLinkedin />
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Services */}
          <Col md={3} className="mb-3">
            <h5 style={{ fontSize: "1.1rem" }}>Services</h5>
            <ul className="list-unstyled text-small">
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  School Donations
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Educational Resources
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Community Outreach
                </a>
              </li>
              <li>
                <a
                  href="#!"
                  className="text-white"
                  style={{ fontSize: "0.9rem" }}
                >
                  Fundraising Events
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Newsletter Subscription Form */}
        <Row className="mt-4">
          <Col md={{ span: 6, offset: 3 }} className="text-center">
            <h5 style={{ fontSize: "1.1rem" }}>Subscribe to Our Newsletter</h5>
            <form>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  aria-label="Enter your email"
                  aria-describedby="button-addon2"
                  style={{ fontSize: "0.9rem" }}
                />
                <button
                  className="btn btn-outline-light"
                  type="button"
                  id="button-addon2"
                  style={{ fontSize: "0.9rem" }}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </Col>
        </Row>

        <hr className="border-light" />
        <Row>
          <Col className="text-center">
            <p className="text-white" style={{ fontSize: "0.9rem" }}>
              &copy; 2025 Frontier Education Fund | All Rights Reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
