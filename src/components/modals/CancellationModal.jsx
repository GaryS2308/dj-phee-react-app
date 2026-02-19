import React from 'react';

const CancellationModal = ({ onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content legal-modal" onClick={(e) => e.stopPropagation()}>
      <h2>CANCELLATION POLICY</h2>
      <div className="modal-body">
        <ol style={{ paddingLeft: '20px', marginTop: 0 }}>
          <li>
            <p><strong>Free Cancellation:</strong><br />Customers may cancel their booking free of charge up to 24 hours prior to the scheduled event date and time.</p>
          </li>
          <li>
            <p><strong>Partial Cancellation Fee:</strong><br />Cancellations made between 24 hours and 6 hours before the event date and time will incur a cancellation fee equal to 50% of the booking cost.</p>
          </li>
          <li>
            <p><strong>Full Cancellation Fee:</strong><br />Cancellations made less than 6 hours before the event date and time will be charged the full booking cost.</p>
          </li>
          <li>
            <p><strong>On-Arrival Cancellation:</strong><br />If DJ Phee arrives at the event location and the client cancels or informs that his services are no longer required, the full booking cost will apply.</p>
          </li>
          <li>
            <p><strong>Payment Terms:</strong><br />Any applicable cancellation fees will be invoiced accordingly and must be settled within the terms outlined in your booking agreement.</p>
          </li>
        </ol>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default CancellationModal;
