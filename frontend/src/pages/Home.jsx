import React from "react";
import Navbar from "../components/Navbar";
import CarouselWithText from "../components/CarouselWithText";
import MissionVisionGoals from "../components/MissionVisionGoals";
import CallToAction from "../components/CallToAction";
import PartnerSection from "../components/PartnerSection";
import KeyStats from "../components/KeyStats";

const Home = () => {
  return (
    <div>
      <Navbar />
      <CarouselWithText />
      <CallToAction />
      <MissionVisionGoals />
      <PartnerSection />
      <KeyStats />
    </div>
  );
};

export default Home;
