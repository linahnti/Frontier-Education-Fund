import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // For social media icons
import assets from "../assets/images/assets";

const Footer = () => {
  return (
    <footer className="bg-dark bg-gradient text-white py-4">
      <Container>
        <Row>
          {/* Column 1: FAQ, Logo, and Webpage Name */}
          <Col md={4} className="mb-3">
            <img
              src={assets.favicon}
              alt="Logo"
              style={{ maxWidth: "100px" }}
            />
            <p className="text-white">Frontier Education Fund</p>
            <h5>FAQ</h5>
            <ul className="list-unstyled text-small">
              <li>
                <a href="#!" className="text-white">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 2: Contact Us */}
          <Col md={4} className="mb-3">
            <h5>Contact Us</h5>
            <ul className="list-unstyled text-small">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@frontiereducationfund.com"
                  className="text-white"
                >
                  info@frontiereducationfund.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong> +254 700 000 000
              </li>
              <li>
                <strong>Social Media:</strong>
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

          {/* Column 3: Services */}
          <Col md={4} className="mb-3">
            <h5>Services</h5>
            <ul className="list-unstyled text-small">
              <li>
                <a href="#!" className="text-white">
                  School Donations
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Educational Resources
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Community Outreach
                </a>
              </li>
              <li>
                <a href="#!" className="text-white">
                  Fundraising Events
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="border-light" />
        <Row>
          <Col className="text-center">
            <p className="text-white">
              &copy; 2025 Frontier Education Fund | All Rights Reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
