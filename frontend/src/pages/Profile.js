import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { authenticatedFetch } from "../utils/api";
import { API_URL } from "../config/api";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Check if user signed in with email/password (not Google)
  const isEmailPasswordUser =
    currentUser?.providerData?.some(
      (provider) => provider.providerId === "password"
    ) ?? false;

  // Initialize name from Firebase user or localStorage fallback
  useEffect(() => {
    if (currentUser?.displayName) {
      setName(currentUser.displayName);
    } else {
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        setName(savedName);
      }
    }
  }, [currentUser]);

  const handleSaveName = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    try {
      setSavingName(true);
      // Update Firebase profile
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: name.trim(),
        });
      }
      // Also save to localStorage as backup
      localStorage.setItem("userName", name.trim());
      alert("Name saved!");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to save name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from current password");
      return;
    }

    try {
      setChangingPassword(true);

      if (!currentUser?.email) {
        alert("User email not found");
        return;
      }

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update the password
      await updatePassword(currentUser, newPassword);

      // Clear the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.code === "auth/wrong-password") {
        alert("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        alert("New password is too weak. Please choose a stronger password");
      } else {
        alert(`Failed to change password: ${error.message}`);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClearBudgetHistory = async (period) => {
    // Show confirmation popup
    const confirmText = window.confirm(
      `Are you sure you want to permanently clear all transactions from past ${period}? This action cannot be undone.`
    );

    if (!confirmText) {
      return;
    }

    try {
      // Fetch all transactions
      const response = await authenticatedFetch(API_URL);
      const data = await response.json();
      const allTransactions = data.transactions || [];

      // Calculate the cutoff date based on period (everything before this cutoff will be deleted)
      const now = new Date();
      let cutoffDate;
      switch (period) {
        case "days":
          // Clear all transactions before today
          cutoffDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "months":
          // Clear all transactions before the start of this month
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "years":
          // Clear all transactions before the start of this year
          cutoffDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return;
      }

      // Filter transactions that are before the cutoff date
      const transactionsToDelete = allTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate < cutoffDate;
      });

      // Delete all matching transactions
      const deletePromises = transactionsToDelete.map((transaction) =>
        authenticatedFetch(`${API_URL}/${transaction._id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);
      alert(
        `Successfully cleared ${transactionsToDelete.length} transaction(s) from past ${period}.`
      );
    } catch (error) {
      console.error("Error clearing budget history:", error);
      alert("Failed to clear budget history. Please try again.");
    }
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
              <button
                className="save-button"
                onClick={handleSaveName}
                disabled={savingName}
              >
                {savingName ? "Saving..." : "Save Name"}
              </button>
            </div>
          </div>

          {isEmailPasswordUser && (
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
                    disabled={changingPassword}
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
                    disabled={changingPassword}
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
                    disabled={changingPassword}
                  />
                </div>
                <button
                  className="save-button"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </div>
          )}

          <div className="profile-section">
            <div className="section-header">
              <Trash2 size={20} className="section-icon" />
              <h2 className="section-title">Budget History</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Permanently delete transactions from past periods. This action
                cannot be undone.
              </p>
              <div className="clear-history-buttons">
                <button
                  className="clear-history-button"
                  onClick={() => handleClearBudgetHistory("days")}
                >
                  Clear Past Days
                </button>
                <button
                  className="clear-history-button"
                  onClick={() => handleClearBudgetHistory("months")}
                >
                  Clear Past Months
                </button>
                <button
                  className="clear-history-button"
                  onClick={() => handleClearBudgetHistory("years")}
                >
                  Clear Past Years
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
