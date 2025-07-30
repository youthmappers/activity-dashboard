import React, { useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import MapComponent from './components/Map';
import Timeline from './components/Timeline';
import About from './components/About';
import Numbers from './components/Numbers';
import LiveTracker from './components/LiveTracker';
import './App.css';

function App() {
  const [timeRange, setTimeRange] = useState([new Date('2020-01-01'), new Date()]);
  const mapRef = useRef(null);

  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/" element={
          <main className="main-content">
            <MapComponent ref={mapRef} timeRange={timeRange} />
            <Timeline timeRange={timeRange} setTimeRange={setTimeRange} mapRef={mapRef} />
          </main>
        } />
        <Route path="/numbers" element={<Numbers />} />
        <Route path="/live" element={<LiveTracker />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
