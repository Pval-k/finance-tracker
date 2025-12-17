import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun, Settings, Plus } from "lucide-react";
import "./Header.css";

const Header = ({ onAddTransactionClick }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          Finance Tracker
        </Link>
        <div className="header-actions">
          {location.pathname === "/" && (
            <button
              className="header-button add-button"
              onClick={onAddTransactionClick}
            >
              <Plus size={20} />
              <span>Add</span>
            </button>
          )}
          <Link to="/profile" className="header-button">
            <Settings size={20} />
          </Link>
          <button className="header-button theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
