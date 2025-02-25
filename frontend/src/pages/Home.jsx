import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/AuthenticatedNavbar";
import CarouselWithText from "../components/CarouselWithText";
import MissionVisionGoals from "../components/MissionVisionGoals";
import CallToAction from "../components/CallToAction";
import PartnerSection from "../components/PartnerSection";
import KeyStats from "../components/KeyStats";
import Footer from "../components/Footer";
import HomepageAbout from "../components/HomepageAbout";
import HomepageSchools from "../components/HomepageSchools";
import HomepageDonations from "../components/HomepageDonations";
import HomepageTestimonials from "../components/HomepageTestimonials";

const Home = () => {
  return (
    <>
      <style>
        {`
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>
      <div className="homepage">
        <CarouselWithText />
        <CallToAction />
        <MissionVisionGoals />
        <PartnerSection />
        <KeyStats />

        <HomepageAbout id="about" />
        <HomepageSchools id="schools" />
        <HomepageDonations id="donations" />
        <HomepageTestimonials id="testimonials" />
        <Footer id="contact" />
      </div>
    </>
  );
};

export default Home;
