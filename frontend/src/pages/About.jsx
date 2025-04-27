import React from "react";
import { Container, Row, Col, Card, Accordion } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import assets from "../assets/images/assets";

const About = () => {
  const { darkMode } = useTheme();

  return (
    <Container className={`py-5 ${darkMode ? "text-white" : ""}`}>
      <Row className="mb-5">
        <Col>
          <h1 className="display-4 mb-4">About Frontier Education Fund</h1>
          <p className="lead">
            Transforming education in underserved communities through
            sustainable solutions.
          </p>
        </Col>
      </Row>

      <Row className="mb-5 align-items-center">
        <Col md={6}>
          <img
            src={assets.school1}
            alt="Our Mission"
            className="img-fluid rounded shadow"
          />
        </Col>
        <Col md={6}>
          <h2 className="text-warning mb-4">Our Mission</h2>
          <p>
            Founded in 2015, Frontier Education Fund is dedicated to bridging
            the educational gap in marginalized communities. We've impacted over
            50,000 students across 200 schools in 15 counties.
          </p>
          <p>
            Frontier Education Fund is committed to ensuring quality education
            for every child, especially in underserved communities. Through
            donations and partnerships, we provide essential resources like
            classrooms, books, and learning materials.
          </p>
          <ul className="list-unstyled">
            <li className="mb-2">✓ Built 150+ classrooms</li>
            <li className="mb-2">✓ Distributed 500,000+ textbooks</li>
            <li className="mb-2">✓ Trained 1,200+ teachers</li>
            <li className="mb-2">✓ Provided 10,000+ scholarships</li>
          </ul>
          <a href="/donate" className="btn btn-warning px-4 py-2">
            Support Our Mission
          </a>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-warning mb-4">Our Approach</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
                <Card.Body>
                  <h3 className="text-primary">Community Engagement</h3>
                  <p>
                    We work closely with local communities to identify needs and
                    implement sustainable solutions.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
                <Card.Body>
                  <h3 className="text-primary">Holistic Support</h3>
                  <p>
                    Beyond infrastructure, we provide teacher training, learning
                    materials, and student mentorship.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
                <Card.Body>
                  <h3 className="text-primary">Transparency</h3>
                  <p>
                    Donors receive regular updates on project progress and
                    impact through detailed reports.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="text-warning mb-4">Frequently Asked Questions</h2>
          <Accordion>
            <Accordion.Item eventKey="0" className={darkMode ? "bg-dark" : ""}>
              <Accordion.Header>How do you select schools?</Accordion.Header>
              <Accordion.Body>
                We prioritize schools in marginalized areas with the greatest
                need, based on government data and community assessments.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" className={darkMode ? "bg-dark" : ""}>
              <Accordion.Header>
                Can I visit supported schools?
              </Accordion.Header>
              <Accordion.Body>
                Yes! We organize donor visits twice a year. Contact us to
                schedule.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" className={darkMode ? "bg-dark" : ""}>
              <Accordion.Header>How are funds allocated?</Accordion.Header>
              <Accordion.Body>
                85% goes directly to programs, 10% to administration, and 5% to
                fundraising, as verified by independent audits.
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" className={darkMode ? "bg-dark" : ""}>
              <Accordion.Header>How can I get involved?</Accordion.Header>
              <Accordion.Body>
                You can donate money or materials, volunteer your time, or
                become a mentor. Register on our platform and visit the
                donations page to get started.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
