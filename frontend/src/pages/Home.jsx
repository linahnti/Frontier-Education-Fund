import React from "react";
import { useTheme } from "../contexts/ThemeContext";
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
  const { darkMode } = useTheme();

  return (
    <div
      className={`homepage ${darkMode ? "dark" : "light-theme"}`}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>
        {`
          html {
            scroll-behavior: smooth;
          }
            body {
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
            margin: 0; /* Reset body margin */
          }
          .homepage {
            width: 100%;
          }
        `}
      </style>

      <main style={{ flex: 1, width: "100%" }}>
        <CarouselWithText />
        <CallToAction />
        <MissionVisionGoals />
        <PartnerSection />
        <KeyStats />
        <HomepageAbout id="about" />
        <HomepageSchools id="schools" />
        <HomepageDonations id="donations" />
        <HomepageTestimonials id="testimonials" />
      </main>

      <Footer id="contact" />
    </div>
  );
};

export default Home;
