"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Maximize2, Minimize2 } from 'lucide-react';

const ParachuteCalculator = () => {
  const [weight, setWeight] = useState(100);
  const [diameter, setDiameter] = useState(20);
  const [ventDiameter, setVentDiameter] = useState(1);
  const [cells, setCells] = useState(8);
  const [altitude, setAltitude] = useState(1000);
  const [isMetric, setIsMetric] = useState(false);
  const [seamAllowance, setSeamAllowance] = useState(0.5);
  const [graphHeight, setGraphHeight] = useState(64);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [activeTab, setActiveTab] = useState('topView');

  const toMetric = (value: number, unit: string) => {
    switch(unit) {
      case 'weight':
        return (value * 0.453592).toFixed(1);
      case 'length':
        return (value * 0.3048).toFixed(2);
      case 'speed':
        return (value * 0.3048).toFixed(2);
      default:
        return value;
    }
  };

  const getAirDensity = (alt: number) => {
    const rho0 = 0.002378;
    return rho0 * Math.exp(-alt/30000);
  };

  const calculateTerminalVelocity = () => {
    const rho = getAirDensity(altitude);
    const mainArea = Math.PI * Math.pow(diameter/2, 2);
    const ventArea = Math.PI * Math.pow(ventDiameter/2, 2);
    const effectiveArea = mainArea - ventArea;
    return Math.sqrt((2 * weight) / (rho * 1.75 * effectiveArea));
  };

  useEffect(() => {
    setCurrentSpeed(calculateTerminalVelocity());
  }, [weight, diameter, ventDiameter, altitude]);

  const generateCellPattern = () => {
    const points = [];
    const mainCircumference = Math.PI * diameter;
    const ventCircumference = Math.PI * ventDiameter;
    const cellWidthBottom = mainCircumference / cells;
    const cellWidthTop = ventCircumference / cells;
    const cellHeight = (diameter - ventDiameter) / 2;
    const numPoints = 50;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const currentWidth = cellWidthTop + (cellWidthBottom - cellWidthTop) * t;
      const x = t * cellWidthBottom;
      const normalizedY = Math.sin(Math.PI * t);
      const y = cellHeight * normalizedY;

      points.push({
        x: Number(isMetric ? toMetric(x, 'length') : x.toFixed(2)),
        y: Number(isMetric ? toMetric(y, 'length') : y.toFixed(2)),
        type: 'main'
      });

      const dx = cellWidthBottom;
      const dy = cellHeight * Math.PI * Math.cos(Math.PI * t);
      const normalAngle = Math.atan2(dy, dx);
      
      const seamX = x + seamAllowance * Math.cos(normalAngle + Math.PI/2);
      const seamY = y + seamAllowance * Math.sin(normalAngle + Math.PI/2);

      points.push({
        x: Number(isMetric ? toMetric(seamX, 'length') : seamX.toFixed(2)),
        y: Number(isMetric ? toMetric(seamY, 'length') : seamY.toFixed(2)),
        type: 'seam'
      });
    }

    points.push({
      x: 0,
      y: 0,
      type: 'reference',
      label: `Top Width: ${isMetric ? toMetric(cellWidthTop, 'length') : cellWidthTop.toFixed(2)}`
    });
    
    return points;
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Parachute Design Calculator</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Imperial</span>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="hidden"
              checked={isMetric}
              onChange={(e) => setIsMetric(e.target.checked)}
            />
            <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${isMetric ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${isMetric ? 'translate-x-7' : 'translate-x-1'} mt-1`} />
            </div>
          </label>
          <span className="text-sm">Metric</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-center mb-6">
        <h3 className="text-lg font-medium">Fall Speed</h3>
        <p className="text-3xl font-bold text-blue-600">
          {isMetric ? 
            `${toMetric(currentSpeed, 'speed')} m/s` : 
            `${currentSpeed.toFixed(1)} ft/s`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Weight ({isMetric ? 'kg' : 'lbs'}): {isMetric ? toMetric(weight, 'weight') : weight}
          </label>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Diameter ({isMetric ? 'm' : 'ft'}): {isMetric ? toMetric(diameter, 'length') : diameter}
          </label>
          <input
            type="range"
            min="10"
            max="30"
            step="0.5"
            value={diameter}
            onChange={(e) => setDiameter(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Vent Diameter ({isMetric ? 'm' : 'ft'}): {isMetric ? toMetric(ventDiameter, 'length') : ventDiameter}
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={ventDiameter}
            onChange={(e) => setVentDiameter(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Cells: {cells}</label>
          <input
            type="range"
            min="6"
            max="12"
            step="1"
            value={cells}
            onChange={(e) => setCells(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Altitude ({isMetric ? 'm' : 'ft'}): {isMetric ? toMetric(altitude, 'length') : altitude}
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Seam Allowance ({isMetric ? 'cm' : 'in'}): {isMetric ? (seamAllowance * 2.54).toFixed(1) : seamAllowance}
          </label>
          <input
            type="range"
            min="0.25"
            max="1"
            step="0.25"
            value={seamAllowance}
            onChange={(e) => setSeamAllowance(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('topView')}
              className={`px-4 py-2 rounded ${activeTab === 'topView' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Top View
            </button>
            <button
              onClick={() => setActiveTab('cellPattern')}
              className={`px-4 py-2 rounded ${activeTab === 'cellPattern' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Cell Pattern
            </button>
          </div>
          <button
            onClick={() => setGraphHeight(graphHeight === 64 ? 96 : 64)}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            {graphHeight === 64 ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>

        {activeTab === 'topView' ? (
          <div style={{ height: `${graphHeight * 8}px` }} className="w-full relative bg-white">
            <svg viewBox="-110 -110 220 220" className="w-full h-full">
              <line x1="-100" y1="0" x2="100" y2="0" stroke="#ddd" strokeWidth="0.5" />
              <line x1="0" y1="-100" x2="0" y2="100" stroke="#ddd" strokeWidth="0.5" />
              
              <circle
                cx="0"
                cy="0"
                r={(ventDiameter/diameter) * 100}
                fill="white"
                stroke="black"
                strokeWidth="2"
              />
              
              {Array.from({ length: cells }).map((_, i) => {
                const angle = (i * 360) / cells;
                const radians = (angle * Math.PI) / 180;
                const x1 = Math.cos(radians) * 100;
                const y1 = Math.sin(radians) * 100;
                const x2 = Math.cos(radians) * ((ventDiameter/diameter) * 100);
                const y2 = Math.sin(radians) * ((ventDiameter/diameter) * 100);
                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="black"
                      strokeWidth="1"
                    />
                    <text
                      x={Math.cos(radians) * 80}
                      y={Math.sin(radians) * 80}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
              
              <circle
                cx="0"
                cy="0"
                r="100"
                fill="none"
                stroke="black"
                strokeWidth="2"
              />
            </svg>
          </div>
        ) : (
          <div style={{ height: `${graphHeight * 8}px` }} className="w-full">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  label={{ value: `Width (${isMetric ? 'm' : 'ft'})`, position: 'bottom' }}
                />
                <YAxis 
                  dataKey="y" 
                  type="number"
                  label={{ value: `Height (${isMetric ? 'm' : 'ft'})`, angle: -90, position: 'left' }}
                />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload[0]) {
                      const point = payload[0].payload;
                      if (point.type === 'reference') {
                        return (
                          <div className="bg-white p-2 border">
                            {point.label}
                          </div>
                        );
                      }
                      return (
                        <div className="bg-white p-2 border">
                          <p>Width: {point.x} {isMetric ? 'm' : 'ft'}</p>
                          <p>Height: {point.y} {isMetric ? 'm' : 'ft'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Main Pattern"
                  data={generateCellPattern().filter(p => p.type === 'main')} 
                  fill="#2563eb"
                  line
                />
                <Scatter 
                  name="Seam Allowance"
                  data={generateCellPattern().filter(p => p.type === 'seam')} 
                  fill="#dc2626"
                  line
                />
                <Scatter 
                  name="Reference Points"
                  data={generateCellPattern().filter(p => p.type === 'reference')} 
                  fill="#059669"
                  shape="star"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParachuteCalculator;