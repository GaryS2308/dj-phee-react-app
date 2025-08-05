import React from 'react';

const StartTimeSelector = ({ startTimes, onSelectStartTime }) => {
  return (
    <div id="start-time-container">
      <label>Select Start Time</label>
      <div id="start-time-grid">
        {startTimes.map((time) => (
          <button
            key={time}
            type="button"
            className="time-button"
            onClick={() => onSelectStartTime(time)}
          >
            {time}
          </button>
        ))}
      </div>
      <button type="button" id="show-more-times" className="show-more-button">
        Show More Times
      </button>
    </div>
  );
};

export default StartTimeSelector;