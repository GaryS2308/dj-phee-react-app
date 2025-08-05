# DJ Phee React App

## Overview
DJ Phee is a versatile DJ rooted in the pulsating rhythms of Afrotech. This React application allows users to book DJ Phee for various events such as clubs, weddings, and festivals. The app features a hero section with a video background, a slider showcasing past events, an about section, and a booking form.

## Project Structure
```
dj-phee-react-app
├── public
│   └── index.html          # Main HTML template for the React app
├── src
│   ├── components          # Contains all React components
│   │   ├── HeroSection.jsx # Hero section with video background
│   │   ├── PastEventsSlider.jsx # Slider for past events
│   │   ├── AboutPhee.jsx   # Information about DJ Phee
│   │   ├── BookingForm.jsx  # Form for booking DJ Phee
│   │   ├── StartTimeSelector.jsx # Component for selecting start time
│   │   ├── DurationSelector.jsx   # Component for selecting duration
│   │   └── EventSummary.jsx # Displays event summary
│   ├── App.jsx              # Main application component
│   ├── index.js             # Entry point of the React application
│   ├── styles               # Contains CSS styles
│   │   └── styles.css       # Global and component-specific styles
│   └── utils                # Utility functions
│       └── bookingUtils.js  # Functions related to booking process
├── package.json             # npm configuration file
└── README.md                # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd dj-phee-react-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## Usage
- Navigate through the hero section to learn about DJ Phee.
- View past events in the slider.
- Fill out the booking form to request DJ Phee for your event.
- Select the event date, start time, and duration to get an estimated cost.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.