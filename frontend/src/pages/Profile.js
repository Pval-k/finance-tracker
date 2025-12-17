import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(() => {
    return localStorage.getItem("userName") || "";
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveName = () => {
    localStorage.setItem("userName", name);
    alert("Name saved!");
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    // TODO: Implement password change with Firebase
    alert("Password change will be implemented with Firebase Auth");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <h1 className="profile-title">Profile & Settings</h1>

        <div className="profile-sections">
          <div className="profile-section">
            <div className="section-header">
              <User size={20} className="section-icon" />
              <h2 className="section-title">Personal Information</h2>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <button className="save-button" onClick={handleSaveName}>
                Save Name
              </button>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <Lock size={20} className="section-icon" />
              <h2 className="section-title">Change Password</h2>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <button className="save-button" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <Palette size={20} className="section-icon" />
              <h2 className="section-title">Appearance</h2>
            </div>
            <div className="section-content">
              <div className="theme-setting">
                <span className="theme-label">Theme</span>
                <button className="theme-toggle-button" onClick={toggleTheme}>
                  {theme === "light" ? (
                    <>
                      <Sun size={18} />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

