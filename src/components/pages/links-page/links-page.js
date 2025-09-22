// src/pages/LinksPage.jsx
import React from "react";
import "./links-page.css";

const LinksPage = () => {
  return (
    <div className="links-container">
      <div className="links-header" data-reveal data-reveal-order="0">
        <img
          src="https://res.cloudinary.com/dea6wzxd8/image/upload/v1754416286/phee5_uehcyi.png" 
          alt="DJ Phee"
          className="links-avatar"
        />
        <h1 className="links-name">PHEE</h1>
        <p className="links-bio">
          <strong> DJ | Athlete | Coach </strong> <br />
          Cape Town, South Africa 
          <br />
          Phee is a South African DJ and Athlete known for his energetic aura. With a passion for music that transcends genres, he has made a name for himself in the local music scene.
        </p>    
      </div>

      <div className="links-list">

        <a href="https://phee.co.za/" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="1">
          DJ PHEE Bookings
        </a>
        <a href="https://soundcloud.com/phemelo-ramatlotlo-122152686" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="2">
          SoundCloud
        </a>
        <a href="https://moralsthebrand.co.za" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="3">
          Morals The Brand
        </a>
        <a href="https://olympicsa.co.za" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="4">
          Olympic ZA
        </a>

        <a href="https://www.royalhockey.co.za/" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="5">
          Royal Hockey
        </a>
        <a href="https://www.instagram.com/obohockeysa?utm_source=ig_web_button_share_sheet&igsh=MW1xaWtvZGl5NGtwMw==" target="_blank" rel="noopener noreferrer" className="link-btn" data-reveal data-reveal-order="6">
          OBO Hockey SA
        </a>
      </div>
    </div>
  );
};

export default LinksPage;
