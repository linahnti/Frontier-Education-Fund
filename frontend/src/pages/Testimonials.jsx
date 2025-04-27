import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Carousel,
  Button,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";
import assets from "../assets/images/assets";

const Testimonials = () => {
  const { darkMode } = useTheme();
  const [key, setKey] = useState("students");

  const testimonials = {
    students: [
      {
        name: "Amina Hassan",
        role: "Student, Turkana County",
        image: assets.testimonial4,
        quote:
          "Thanks to Frontier Education Fund, I have books and a proper classroom. I now dream of becoming a doctor!",
        video: "https://example.com/video1",
      },
      {
        name: "James Otieno",
        role: "Student, Mandera County",
        image: assets.testimonial2,
        quote:
          "Before, we studied under a tree. Now, we have desks and a safe place to learn. Education is my hope for a better future.",
        video: "https://example.com/video2",
      },
    ],
    teachers: [
      {
        name: "Mr. Kiprono",
        role: "Principal, Garissa Primary",
        image: assets.testimonial6,
        quote:
          "With the support from donors, we have built classrooms, and our students now have learning materials. Thank you!",
        video: "https://example.com/video3",
      },
    ],
    donors: [
      {
        name: "Lucy Mwangi",
        role: "Donor",
        image: assets.testimonial10,
        quote:
          "Knowing that my donation is making a real difference in children's lives fills me with joy. I encourage everyone to join!",
        video: "https://example.com/video4",
      },
      {
        name: "John Smith",
        role: "Donor, United Kingdom",
        image: assets.testimonial13,
        quote:
          "Education is the foundation of progress. Supporting this initiative has given me the chance to change lives, even from across the world.",
        video: "https://example.com/video5",
      },
    ],
  };

  const TestimonialCards = ({ testimonials, darkMode }) => {
    if (!testimonials || !testimonials.length) {
      return <p>No testimonials available</p>;
    }

    return (
      <Row>
        {testimonials.map((testimonial, idx) => (
          <Col key={idx} md={6} className="mb-4">
            <Card className={`h-100 ${darkMode ? "bg-dark" : ""}`}>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex mb-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="rounded-circle me-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <h5>{testimonial.name}</h5>
                    <p className="text-muted mb-0">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="mb-4 flex-grow-1">
                  <p className="font-italic">"{testimonial.quote}"</p>
                </blockquote>
                <div className="ratio ratio-16x9 mb-3">
                  <div className="d-flex align-items-center justify-content-center bg-secondary">
                    <i className="fas fa-play fa-3x text-white"></i>
                  </div>
                </div>
                <Button variant="outline-primary" size="sm">
                  Watch Full Story
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className={`py-5 ${darkMode ? "text-white" : ""}`}>
      <Row className="mb-5">
        <Col>
          <h1 className="display-4">Impact Stories</h1>
          <p className="lead">
            Hear directly from those whose lives have been transformed
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Body>
              <Carousel indicators={false}>
                {[
                  "150+ classrooms built",
                  "500,000+ textbooks distributed",
                  "1,200+ teachers trained",
                  "10,000+ scholarships provided",
                ].map((stat, idx) => (
                  <Carousel.Item key={idx}>
                    <div className="text-center py-4">
                      <h2 className="text-warning">{stat.split("+")[0]}+</h2>
                      <p>{stat.split("+")[1]}</p>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className={`mb-3 ${darkMode ? "tabs-dark" : ""}`}
          >
            <Tab eventKey="students" title="Students">
              <TestimonialCards
                testimonials={testimonials.students}
                darkMode={darkMode}
              />
            </Tab>
            <Tab eventKey="teachers" title="Teachers">
              <TestimonialCards
                testimonials={testimonials.teachers}
                darkMode={darkMode}
              />
            </Tab>
            <Tab eventKey="donors" title="Donors">
              <TestimonialCards
                testimonials={testimonials.donors}
                darkMode={darkMode}
              />
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className={darkMode ? "bg-dark" : ""}>
            <Card.Body>
              <h5 className="mb-4">Share Your Story</h5>
              <p className="mb-4">
                Have you been impacted by Frontier Education Fund? Share your
                experience to inspire others!
              </p>
              <Button variant="warning" className="me-3">
                <i className="fas fa-video me-2"></i>Record Video
              </Button>
              <Button variant="primary">
                <i className="fas fa-pen me-2"></i>Write Testimonial
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Testimonials;
