import React, { useState } from 'react';

const durations = [
  { label: "1 hour", minutes: 60 },
  { label: "1 hour 30 min", minutes: 90 },
  { label: "2 hours", minutes: 120 },
  { label: "2 hours 30 min", minutes: 150 },
  { label: "3 hours", minutes: 180 },
  { label: "3 hours 30 min", minutes: 210 },
  { label: "4 hours", minutes: 240 },
  { label: "4 hours 30 min", minutes: 270 },
  { label: "5 hours", minutes: 300 },
  { label: "5 hours 30 min", minutes: 330 },
  { label: "6 hours", minutes: 360 },
];

const DurationSelector = ({ onDurationSelect }) => {
  const [selectedDuration, setSelectedDuration] = useState(null);

  const handleDurationClick = (duration) => {
    setSelectedDuration(duration);
    onDurationSelect(duration);
  };

  return (
    <div id="duration-container">
      <label>Select Duration</label>
      <div id="duration-grid">
        {durations.map((dur) => (
          <button
            key={dur.label}
            type="button"
            className={`duration-button ${selectedDuration?.label === dur.label ? 'selected' : ''}`}
            onClick={() => handleDurationClick(dur)}
          >
            {dur.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationSelector;