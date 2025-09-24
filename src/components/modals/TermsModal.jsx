import React from 'react';
import '../buttons/footer/footer.css';

const TermsModal = ({ onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content legal-modal" onClick={(e) => e.stopPropagation()}>
      <h2>TERMS & CONDITIONS</h2>
      <div className="modal-body">
        <p><strong>Summary:</strong></p>
        <ol>
          <li>You fill in our booking form, we confirm if DJ Phee is available.</li>
          <li>We treat your personal info (name, phone, email) as private — we don’t sell or share it.</li>
          <li>You’re responsible for making sure your venue is safe and ready for a performance.</li>
          <li>Life happens — bad weather, load-shedding, or emergencies might cause changes.</li>
          <li>We’re not liable for losses, injuries, or problems outside our control.</li>
          <li>By booking or using this website, you agree to these terms.</li>
        </ol>

        <hr style={{ marginTop: '20px', marginBottom: '20px' }} />

        <p><strong>Official Terms & Conditions</strong></p>
        <ol style={{ paddingLeft: '20px', marginTop: '20px' }}>
          <li>
            <p><strong>Bookings:</strong></p>
            <ol>
              <li>All bookings are subject to availability and are only confirmed once you receive written confirmation from us.</li>
              <li>You must provide accurate and complete information in the booking form. Failure to do so may result in cancellation.</li>
              <li>We reserve the right to decline or cancel any booking at our discretion.</li>
            </ol>
          </li>
          <li>
            <p><strong>Payments & Cancellations:</strong></p>
            <ol>
              <li>Payment terms will be provided upon booking confirmation.</li>
              <li>Our Cancellation Policy applies to all confirmed bookings and is available here or upon request.</li>
            </ol>
          </li>
          <li>
            <p><strong>Event Conditions:</strong></p>
            <ol>
              <li>The client is responsible for ensuring the venue meets technical and safety requirements for DJ performance.</li>
              <li>We are not liable for delays or cancellations caused by events beyond our control, including but not limited to weather, equipment failure, or venue issues.</li>
              <li>DJ Phee reserves the right to refuse to perform in unsafe or illegal conditions.</li>
            </ol>
          </li>
          <li>
            <p><strong>Liability:</strong></p>
            <ol>
              <li>We are not liable for any loss, damage, injury, or expense arising from the booking, performance, or use of this Site.</li>
              <li>To the fullest extent permitted by law, we disclaim all warranties, whether express or implied.</li>
            </ol>
          </li>
          <li>
            <p><strong>Data Protection & Privacy:</strong></p>
            <ol>
              <li>We collect and store your personal information solely for the purpose of managing your booking.</li>
              <li>We will not sell, rent, or misuse your personal data.</li>
              <li>While we take reasonable security measures to protect your data, we cannot guarantee absolute security. By submitting your information, you acknowledge this risk.</li>
            </ol>
          </li>
          <li>
            <p><strong>Intellectual Property:</strong></p>
            <ol>
              <li>All content on this Site, including images, logos, text, and audio, is the property of DJ Phee or its licensors.</li>
              <li>You may not copy, reproduce, or distribute any content without prior written consent.</li>
            </ol>
          </li>
          <li>
            <p><strong>Website Use:</strong></p>
            <ol>
              <li>You agree not to use this Site for unlawful purposes or in a manner that could damage or disable the Site.</li>
              <li>We may update these Terms at any time without prior notice. Continued use of the Site constitutes acceptance of the revised Terms.</li>
            </ol>
          </li>
          <li>
            <p><strong>Governing Law:</strong><br />
            These Terms are governed by the laws of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the South African courts.</p>
          </li>
        </ol>

        <p>
          <strong>Contact Us:</strong><br />
          Email: ramatlotlo7@gmail.com
        </p>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default TermsModal;
