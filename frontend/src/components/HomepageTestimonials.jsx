import React from "react";
import assets from "../assets/images/assets";

const testimonials = [
  {
    name: "Amina Hassan",
    role: "Student, Turkana County",
    image: assets.testimonial4,
    message:
      "Thanks to Frontier Education Fund, I have books and a proper classroom. I now dream of becoming a doctor!",
  },
  {
    name: "James Otieno",
    role: "Student, Mandera County",
    image: assets.testimonial2,
    message:
      "Before, we studied under a tree. Now, we have desks and a safe place to learn. Education is my hope for a better future.",
  },
  {
    name: "Mary Wanjiku",
    role: "Community Member",
    image: assets.testimonial8,
    message:
      "Our village now has a school where our children can learn. This project has truly transformed our community.",
  },
  {
    name: "Mr. Kiprono",
    role: "Principal, Garissa Primary",
    image: assets.testimonial6,
    message:
      "With the support from donors, we have built classrooms, and our students now have learning materials. Thank you!",
  },
  {
    name: "Lucy Mwangi",
    role: "Donor",
    image: assets.testimonial10,
    message:
      "Knowing that my donation is making a real difference in children’s lives fills me with joy. I encourage everyone to join!",
  },
  {
    name: "John Smith",
    role: "Donor, United Kingdom",
    image: assets.testimonial13,
    message:
      "Education is the foundation of progress. Supporting this initiative has given me the chance to change lives, even from across the world.",
  },
];

const HomepageTestimonials = () => {
  return (
    <section
      id="testimonials"
      className="py-5 text-center"
      style={{ backgroundColor: "#c5e1f7" }}
    >
      <div className="container">
        <h2 className="text-warning fw-bold">What People Say About Us</h2>
        <div className="row mt-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card border-0 shadow-sm p-4 text-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="mb-3"
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "contain", // Ensures full image is visible
                    borderRadius: "10px",
                  }}
                />
                <p className="text-dark">"{testimonial.message}"</p>
                <h5 className="text-primary">{testimonial.name}</h5>
                <p className="text-muted">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        <a href="/signup" className="btn btn-warning px-4 py-2 mt-3">
          Join Our Community
        </a>
      </div>
    </section>
  );
};

export default HomepageTestimonials;
