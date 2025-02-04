import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CarouselWithText from "../components/CarouselWithText";
import MissionVisionGoals from "../components/MissionVisionGoals";
import CallToAction from "../components/CallToAction";
import PartnerSection from "../components/PartnerSection";
import KeyStats from "../components/KeyStats";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Navbar />
      <CarouselWithText />
      <CallToAction />
      {/* <div className="auth-links">
        <Link to="/signup">Sign Up</Link>
        <Link to="/login">Login</Link>
      </div> */}
      <MissionVisionGoals />
      <PartnerSection />
      <KeyStats />
      <Footer />
    </div>
  );
};

export default Home;
