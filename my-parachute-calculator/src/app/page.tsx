"use client";

import React from 'react';
import ParachuteCalculator from '../components/parachute-calculator';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <ParachuteCalculator />
      </div>
    </div>
  );
};

export default Home;