import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const KeyStats = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Our Impact</h2>
      <Row className="text-center">
        {/* Card 1: Schools Need Support */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title display-4">🏫</h3>
              <Card.Subtitle className="mb-2 text-muted">250+ Schools Need Support</Card.Subtitle>
              <Card.Text>
                Together, we can provide a better learning environment for schools in need.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Card 2: Students Reached */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title display-4">📚</h3>
              <Card.Subtitle className="mb-2 text-muted">10,000+ Students Reached</Card.Subtitle>
              <Card.Text>
                Supporting education for thousands of children, empowering them for a brighter future.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3: Funds Raised */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title display-4">💰</h3>
              <Card.Subtitle className="mb-2 text-muted">5 Million Ksh Raised</Card.Subtitle>
              <Card.Text>
                Your contributions have helped raise substantial funds for crucial educational projects.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 4: Donors */}
        <Col md={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title display-4">🤝</h3>
              <Card.Subtitle className="mb-2 text-muted">70+ Donors</Card.Subtitle>
              <Card.Text>
                Over 70 donors have supported the cause, making a real difference in the lives of children.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default KeyStats;
