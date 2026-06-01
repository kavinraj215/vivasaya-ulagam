'use client';

import React from 'react';

export default function RightSidebar() {
  return (
    <aside className="w-80 border-l bg-white p-4 flex flex-col shrink-0">
      <h2 className="font-semibold text-sm mb-4">Settings</h2>
      <div className="text-xs text-gray-500">
        Section properties and theme settings customizer sidebar.
      </div>
    </aside>
  );
}
