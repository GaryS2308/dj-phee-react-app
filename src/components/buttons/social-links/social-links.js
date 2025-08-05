// src/components/SocialLinks.jsx
import React from 'react';
import { FaInstagram, FaEnvelope, FaSoundcloud } from 'react-icons/fa';
import './social-links.css';

const SocialLinks = () => {
  return (
    <div className="social-links">
      <a href="https://instagram.com/__phee__" target="_blank" rel="noopener noreferrer" title="Instagram">
        <FaInstagram />
      </a>
      <a href="mailto:ramatlotlo7@gmail.com" title="Email">
        <FaEnvelope />
      </a>
      <a href="https://soundcloud.com/phemelo-ramatlotlo-122152686" target="_blank" rel="noopener noreferrer" title="SoundCloud">
        <FaSoundcloud />
      </a>
    </div>
  );
};

export default SocialLinks;
