// crumbs.js
import React from 'react';
import './crumbs.css';

const Crumbs = ({
  showStartTimeCrumb,
  showDurationCrumb,
  onDateClick,
  onStartTimeClick,
  onDurationClick,
  activeStep,
}) => {
  return (
    <div className="crumbs-container">
      <button
        type="button"
        className={`crumb-button ${activeStep === 'date' ? 'active' : ''}`}
        onClick={onDateClick}
      >
        Change Date
      </button>

      {showStartTimeCrumb && (
        <button
          type="button"
          className={`crumb-button ${activeStep === 'startTime' ? 'active' : ''}`}
          onClick={onStartTimeClick}
        >
          Change Start Time
        </button>
      )}

      {showDurationCrumb && (
        <button
          type="button"
          className={`crumb-button ${activeStep === 'duration' ? 'active' : ''}`}
          onClick={onDurationClick}
        >
          Change Duration
        </button>
      )}
    </div>
  );
};

export default Crumbs;
