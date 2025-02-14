// TabNavigation.js
import React from "react";

/**
 * Props:
 * - activeTab: the currently active tab id.
 * - setActiveTab: function to change the active tab.
 * - tabs: array of tab objects {id, icon, label}.
 */
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="px-3 sm:px-6 border-b border-gray-100 overflow-x-auto">
      <nav className="flex gap-4 sm:gap-6 whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 sm:py-3 relative text-xs sm:text-sm font-medium ${
              activeTab === tab.id
                ? "text-red-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <div className="flex items-center gap-1">
              {React.cloneElement(tab.icon, { size: 16 })}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
