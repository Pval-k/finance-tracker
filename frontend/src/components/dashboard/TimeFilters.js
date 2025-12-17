import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./TimeFilters.css";

const TimeFilters = ({
  timeFilter,
  selectedDate,
  onFilterChange,
  onPeriodChange,
  showToggleOnly = false,
  showNavigationOnly = false,
}) => {
  const filters = [
    { value: "day", label: "Day" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  const formatPeriod = () => {
    const date = new Date(selectedDate);
    switch (timeFilter) {
      case "day":
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      case "month":
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "year":
        return date.getFullYear().toString();
      default:
        return "";
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    switch (timeFilter) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onPeriodChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    switch (timeFilter) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "year":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onPeriodChange(newDate);
  };

  const handleToday = () => {
    onPeriodChange(new Date());
  };

  const isToday = () => {
    const today = new Date();
    const selected = new Date(selectedDate);

    switch (timeFilter) {
      case "day":
        return (
          today.getDate() === selected.getDate() &&
          today.getMonth() === selected.getMonth() &&
          today.getFullYear() === selected.getFullYear()
        );
      case "month":
        return (
          today.getMonth() === selected.getMonth() &&
          today.getFullYear() === selected.getFullYear()
        );
      case "year":
        return today.getFullYear() === selected.getFullYear();
      default:
        return false;
    }
  };

  if (showToggleOnly) {
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
  }

  if (showNavigationOnly) {
    return (
      <div className="time-period-navigation">
        <div className="period-display">
          <button
            className="nav-button"
            onClick={handlePrevious}
            aria-label="Previous period"
          >
            <ChevronLeft size={20} />
          </button>
          {!isToday() && (
            <button className="today-button" onClick={handleToday}>
              Go to Today
            </button>
          )}
          <button
            className="nav-button"
            onClick={handleNext}
            aria-label="Next period"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="time-filters-container">
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

      <div className="time-period-navigation">
        <div className="period-display">
          <button
            className="nav-button"
            onClick={handlePrevious}
            aria-label="Previous period"
          >
            <ChevronLeft size={20} />
          </button>
          {!isToday() && (
            <button className="today-button" onClick={handleToday}>
              Go to Today
            </button>
          )}
          <button
            className="nav-button"
            onClick={handleNext}
            aria-label="Next period"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeFilters;
