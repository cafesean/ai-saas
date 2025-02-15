'use client';

import React from 'react';

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Project Pricing Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Roles</h2>
          <p className="text-gray-600">Manage project roles and their descriptions</p>
          <a
            href="/roles"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View Roles →
          </a>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Levels</h2>
          <p className="text-gray-600">Configure staff levels and role assignments</p>
          <a
            href="/levels"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View Levels →
          </a>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Rate Cards</h2>
          <p className="text-gray-600">Set up and manage pricing rate cards</p>
          <a
            href="/rate-cards"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View Rate Cards →
          </a>
        </div>
      </div>
    </div>
  );
} 