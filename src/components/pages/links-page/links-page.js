// src/pages/LinksPage.jsx
import React from "react";

const LinksPage = () => {
  return (
    <div className="links-container">
      <div className="links-header">
        <img
          src="https://res.cloudinary.com/dea6wzxd8/image/upload/f_auto,q_auto,w_320,h_320,c_fill,g_auto/v1754416286/phee5_uehcyi.png" 
          alt="DJ Phee"
          className="links-avatar"
        />
        <h1 className="links-name"><span className="sr-only">DJ PHEE, Music, Socials and Booking Links. </span>PHEE</h1>
        <p className="links-bio">
          <strong> DJ | Athlete | Coach </strong> <br />
          Cape Town, South Africa
          <br />
          Phee is a South African DJ and Athlete known for his energetic aura. With a passion for music that transcends genres, he has made a name for himself in the local music scene.
        </p>
      </div>

      <div className="links-list">
        <h2 className="sr-only">Stream DJ PHEE&apos;s Music</h2>
        <a href="https://phee.co.za/" target="_blank" rel="noopener noreferrer" className="link-btn">
          DJ PHEE Bookings
        </a>
        <a href="https://soundcloud.com/phemelo-ramatlotlo-122152686" target="_blank" rel="noopener noreferrer" className="link-btn">
          SoundCloud
        </a>
        <h2 className="sr-only">Follow DJ PHEE</h2>
        <a href="https://moralsthebrand.co.za" target="_blank" rel="noopener noreferrer" className="link-btn">
          Morals The Brand
        </a>
        <a href="https://olympicsa.co.za" target="_blank" rel="noopener noreferrer" className="link-btn">
          Olympic ZA
        </a>

        <a href="https://www.royalhockey.co.za/" target="_blank" rel="noopener noreferrer" className="link-btn">
          Royal Hockey
        </a>
        <a href="https://www.instagram.com/obohockeysa?utm_source=ig_web_button_share_sheet&igsh=MW1xaWtvZGl5NGtwMw==" target="_blank" rel="noopener noreferrer" className="link-btn">
          OBO Hockey SA
        </a>
      </div>
    </div>
  );
};

export default LinksPage;
