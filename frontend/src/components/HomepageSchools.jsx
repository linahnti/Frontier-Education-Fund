import React from "react";

const HomepageSchools = () => {
  return (
    <section id="schools" className="py-5">
      <div className="container text-center">
        <h2 className="text-warning fw-bold">Schools We Support</h2>
        <div className="row mt-4">
          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h4 className="text-primary">Turkana Girls' Secondary School</h4>
              <p className="text-muted">
                Supporting girls’ education in Turkana, where access to learning
                resources is limited.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h4 className="text-primary">Mandera DEB Primary School</h4>
              <p className="text-muted">
                Helping students in Mandera access quality education despite
                harsh environmental conditions.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h4 className="text-primary">Garissa High School</h4>
              <p className="text-muted">
                Providing learning materials and infrastructure support for
                students in Garissa County.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageSchools;
