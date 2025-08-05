import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactSlider from 'react-slider';
import { format, addMinutes } from 'date-fns';
import './slider.css';

const TimeSliderModal = ({ 
  selectedDate, 
  initialStartTime = '19:00', 
  initialDuration = '1hr', 
  onCancel, 
  onConfirm 
}) => {
  // Convert HH:mm to minutes since midnight
  const timeStrToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Convert minutes since midnight to HH:mm string
  const minutesToTimeStr = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Parse duration string like "1hr 30min" to minutes
  const durationStrToMinutes = (durStr) => {
    let minutes = 0;
    const hrMatch = durStr.match(/(\d+)hr/);
    if (hrMatch) minutes += parseInt(hrMatch[1], 10) * 60;
    const minMatch = durStr.match(/(\d+)min/);
    if (minMatch) minutes += parseInt(minMatch[1], 10);
    return minutes || 60; // default 60 if no match
  };

  // Format minutes to "Xhr Ymin" or "Xhr" or "Ymin"
  const formatDurationStr = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}hr ${mins}min`;
    if (hrs > 0) return `${hrs}hr`;
    return `${mins}min`;
  };

  // Initialize range: [start, end] in minutes since midnight
  const initialStartMins = timeStrToMinutes(initialStartTime);
  const initialDurationMins = durationStrToMinutes(initialDuration);
  const initialRange = [initialStartMins, initialStartMins + initialDurationMins];

  const [range, setRange] = useState(initialRange);
  const [date, setDate] = useState(selectedDate || new Date());

  const minDuration = 60; // min 1 hour
  const step = 30; // 30 min steps
  const dayMax = 24 * 60; // minutes in a day

  // Ensure range[1] - range[0] >= minDuration
  const onRangeChange = (vals) => {
    if (vals[1] - vals[0] >= minDuration) {
      // Keep slider within day max
      if (vals[1] <= dayMax) {
        setRange(vals);
      }
    }
  };

  // Format times for display
  const startTimeStr = minutesToTimeStr(range[0]);
  const endTimeStr = minutesToTimeStr(range[1]);
  const durationMins = range[1] - range[0];
  const durationStr = formatDurationStr(durationMins);

  // Handle confirm click
  const handleConfirm = () => {
    onConfirm({
      date,
      startTime: startTimeStr,
      duration: durationStr,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Select Event Date</h3>
        <DatePicker
          selected={date}
          onChange={setDate}
          inline
          minDate={new Date()}
          calendarClassName="custom-calendar"
        />
        <h4 className="slider-label">Set Time & Duration</h4>
        <p className="slider-time-display">
          {startTimeStr} – {endTimeStr} ({durationStr})
        </p>
        <ReactSlider
          className="time-slider"
          thumbClassName="time-thumb"
          trackClassName="time-track"
          min={0}
          max={dayMax}
          step={step}
          value={range}
          onChange={onRangeChange}
          pearling
          minDistance={minDuration}
          renderThumb={(props, state) => {
  const { key, ...propsWithoutKey } = props; // destructure to remove `key`
  return (
    <div key={state.index} {...propsWithoutKey}>
      {state.valueNow === range[0] ? 'Start' : 'End'}
    </div>
  );
}}
        />
        <div className="slider-labels">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-button">Cancel</button>
          <button onClick={handleConfirm} className="confirm-button">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default TimeSliderModal;
