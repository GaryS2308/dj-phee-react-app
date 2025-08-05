import React from 'react';

const EventSummary = ({ selectedDate, selectedStartTime, selectedDuration }) => {
  const calculateEndTime = (startTime, durationMinutes) => {
    let [hours, minutes] = startTime.split(":").map(Number);
    minutes += durationMinutes;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const endTime = selectedStartTime && selectedDuration ? calculateEndTime(selectedStartTime, selectedDuration.minutes) : '';

  return (
    <div id="final-event-summary" style={{ display: selectedDate ? 'block' : 'none', marginTop: '1rem' }}>
      <label htmlFor="event-date-time-display" id="event-date-time-label">Selected Event Date & Time</label>
      <input
        type="text"
        id="event-date-time-display"
        readOnly
        value={`${selectedDate.toLocaleDateString()} | ${selectedStartTime} - ${endTime} (${selectedDuration ? selectedDuration.label : ''})`}
      />
    </div>
  );
};

export default EventSummary;