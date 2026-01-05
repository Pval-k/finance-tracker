import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import {
  Moon,
  Sun,
  Settings,
  Plus,
  LogOut,
  User,
  ChevronDown,
  PiggyBank,
} from "lucide-react";
import "./Header.css";

const Header = ({ onAddTransactionClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "User";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <span className="header-logo">
            <PiggyBank size={22} className="header-logo-icon" />
          </span>
          <span>Finance Tracker</span>
        </Link>
        <div className="header-actions">
          {location.pathname === "/" && (
            <button
              className="header-button add-button"
              onClick={onAddTransactionClick}
            >
              <Plus size={20} />
              <span>Add transaction</span>
            </button>
          )}
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              className="header-button user-menu-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <User size={16} />
              <span className="user-name">{getUserDisplayName()}</span>
              <ChevronDown
                size={14}
                className={`chevron ${showDropdown ? "open" : ""}`}
              />
            </button>
            {showDropdown && (
              <div className="user-dropdown">
                <Link
                  to="/profile"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <button
                  className="dropdown-item logout-item"
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          <button className="header-button theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

