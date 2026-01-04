import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Moon, Sun, Settings, Plus, LogOut, User } from "lucide-react";
import "./Header.css";

const Header = ({ onAddTransactionClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
          <div className="user-info">
            <User size={16} />
            <span className="user-name">{getUserDisplayName()}</span>
          </div>
          <Link to="/profile" className="header-button">
            <Settings size={20} />
          </Link>
          <button className="header-button theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            className="header-button logout-button"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
