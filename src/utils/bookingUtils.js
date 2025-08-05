// filepath: /dj-phee-react-app/dj-phee-react-app/src/utils/bookingUtils.js

export const calculateCost = (durationMinutes, hourlyRate = 1000) => {
    const hours = durationMinutes / 60;
    return hours * hourlyRate;
};

export const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-ZA', options);
};

export const calculateEndTime = (startTime, durationMinutes) => {
    let [hours, minutes] = startTime.split(":").map(Number);
    minutes += durationMinutes;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = hours % 24;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};