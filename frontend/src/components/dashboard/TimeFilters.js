import React from "react";
import "./TimeFilters.css";

const TimeFilters = ({ timeFilter, onFilterChange }) => {
  const filters = [
    { value: "day", label: "Day" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  return (
    <div className="time-filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`time-filter-button ${
            timeFilter === filter.value ? "active" : ""
          }`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default TimeFilters;

