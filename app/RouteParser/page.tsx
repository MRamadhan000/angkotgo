'use client';

import React, { useState } from 'react';

enum DirectionType {
  FORWARD = 'FORWARD',
  RETURN = 'RETURN',
}

interface CreateRoutePathDto {
  routeId: number;
  direction: DirectionType;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
}

export default function RoutePathParser() {
  const [routeId, setRouteId] = useState<number>(1);
  const [direction, setDirection] = useState<DirectionType>(DirectionType.FORWARD);
  const [geoJsonInput, setGeoJsonInput] = useState<string>('');
  const [outputDto, setOutputDto] = useState<CreateRoutePathDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    setOutputDto(null);

    try {
      if (!geoJsonInput.trim()) {
        throw new Error('GeoJSON input tidak boleh kosong.');
      }

      const parsedJson = JSON.parse(geoJsonInput);
      let coordinates: number[][] = [];

      if (parsedJson.type === 'FeatureCollection' && parsedJson.features) {
        const feature = parsedJson.features.find(
          (f: any) => f.geometry && f.geometry.type === 'LineString'
        );
        if (feature) {
          coordinates = feature.geometry.coordinates;
        }
      } else if (parsedJson.type === 'Feature' && parsedJson.geometry?.type === 'LineString') {
        coordinates = parsedJson.geometry.coordinates;
      } else if (parsedJson.type === 'LineString') {
        coordinates = parsedJson.coordinates;
      }

      if (!coordinates || coordinates.length === 0) {
        throw new Error('Tidak ditemukan koordinat LineString yang valid di dalam GeoJSON.');
      }

      // Jika arahnya RETURN, balikkan urutan koordinatnya (dari ujung ke awal)
      let processedCoordinates = [...coordinates];
      if (direction === DirectionType.RETURN) {
        processedCoordinates.reverse();
      }

      const dtoList: CreateRoutePathDto[] = processedCoordinates.map((coord, index) => ({
        routeId: Number(routeId),
        direction: direction,
        longitude: coord[0],
        latitude: coord[1],
        sequenceOrder: index + 1, // Urutan otomatis menyesuaikan (1, 2, 3, dst setelah di-reverse)
      }));

      setOutputDto(dtoList);
    } catch (err: any) {
      setError(err.message || 'Gagal memparsing JSON. Pastikan format GeoJSON benar.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-lg space-y-6 text-black">
      <h2 className="text-2xl font-bold text-gray-900">GeoJSON to RoutePath DTO Bulk Converter</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Route ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Route ID:</label>
          <input
            type="number"
            value={routeId}
            onChange={(e) => setRouteId(Number(e.target.value))}
            className="w-full px-3 py-2 text-black bg-white border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Input Direction Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Direction:</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center space-x-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="direction"
                value={DirectionType.FORWARD}
                checked={direction === DirectionType.FORWARD}
                onChange={() => setDirection(DirectionType.FORWARD)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-400"
              />
              <span>FORWARD (Berangkat)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer font-medium text-gray-700">
              <input
                type="radio"
                name="direction"
                value={DirectionType.RETURN}
                checked={direction === DirectionType.RETURN}
                onChange={() => setDirection(DirectionType.RETURN)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-400"
              />
              <span>RETURN (Pulang - Auto Reverse)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Input GeoJSON Textarea */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">Paste GeoJSON di sini:</label>
        <textarea
          rows={8}
          value={geoJsonInput}
          onChange={(e) => setGeoJsonInput(e.target.value)}
          placeholder='{"type": "FeatureCollection", "features": [...] }'
          className="w-full px-3 py-2 text-black bg-white font-mono text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleParse}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-200 shadow-sm"
      >
        Convert to Bulk DTO ({direction})
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Output Result */}
      {outputDto && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">
              Output DTO Array ({outputDto.length} items - Direction: <span className="text-blue-600">{direction}</span>):
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(outputDto, null, 2))}
              className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black px-3 py-1.5 rounded-md font-medium transition"
            >
              Copy JSON
            </button>
          </div>
          <pre className="bg-gray-50 border border-gray-300 text-black p-4 rounded-md text-xs font-mono overflow-auto max-h-96 shadow-inner">
            {JSON.stringify(outputDto, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}