'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
const ReactSliderModule = require('react-slider');
const ReactSlider = ReactSliderModule.default || ReactSliderModule;
import { format } from 'date-fns';

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

  useEffect(() => {
    // RTDB availability checks removed; bookings are handled manually.
  }, [date]);

  const minDuration = 60; // min 1 hour
  const step = 30; // 30 min steps
  const dayMax = 24 * 60; // minutes in a day

  // Check overlaps for slider dragging — only accept if no overlap, valid duration, in future
  const onRangeChange = (vals) => {
    const [newStart, newEnd] = vals;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const isToday = (someDate) => {
      return (
        someDate.getDate() === now.getDate() &&
        someDate.getMonth() === now.getMonth() &&
        someDate.getFullYear() === now.getFullYear()
      );
    };

    const isValidDuration = newEnd - newStart >= minDuration;
    const isInFuture = !isToday(date) || newStart >= currentMinutes;

    if (isValidDuration && newEnd <= dayMax && isInFuture) {
      setRange(vals);
    }
  };

  // On confirm, double-check overlap & notify user if conflict
  const handleConfirm = () => {
    const selectedStart = range[0];
    const selectedEnd = range[1];

    onConfirm({
      date,
      startTime: minutesToTimeStr(selectedStart),
      duration: formatDurationStr(selectedEnd - selectedStart),
    });
  };

  // Format times for display
  const startTimeStr = minutesToTimeStr(range[0]);
  const endTimeStr = minutesToTimeStr(range[1]);
  const durationMins = range[1] - range[0];
  const durationStr = formatDurationStr(durationMins);

  return (
    
  <div className="modal-overlay" onClick={onCancel}>
    <div
      className="modal"
      onClick={(e) => e.stopPropagation()}  // Prevent closing when clicking inside modal
    >
      <h3>Select Event Date</h3>
      <DatePicker
        selected={date}
        onChange={setDate}
        inline
        minDate={new Date()}
        calendarClassName="custom-calendar"
        renderCustomHeader={({ date: headerDate, decreaseMonth, increaseMonth }) => (
          <div className="calendar-header">
            <button
              type="button"
              className="calendar-nav-button"
              onClick={decreaseMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="calendar-header__title">
              <span className="calendar-header__year">{format(headerDate, 'yyyy')}</span>
              <span className="calendar-header__month">{format(headerDate, 'MMMM')}</span>
            </div>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={increaseMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        )}
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
        <button onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button onClick={handleConfirm} className="confirm-button">
          Confirm
        </button>

      </div>
    </div>
  </div>
);
}

export default TimeSliderModal;
