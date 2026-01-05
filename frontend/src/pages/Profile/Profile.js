import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Trash2, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { authenticatedFetch } from "../../utils/api";
import { API_URL } from "../../config/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
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

  const handleClearAllHistory = async () => {
    // Show confirmation popup
    const confirmText = window.confirm(
      `Are you sure you want to permanently delete ALL transactions? This action cannot be undone.`
    );

    if (!confirmText) {
      return;
    }

    try {
      // Fetch all transactions
      const response = await authenticatedFetch(API_URL);
      const data = await response.json();
      const allTransactions = data.transactions || [];

      // Delete all transactions
      const deletePromises = allTransactions.map((transaction) =>
        authenticatedFetch(`${API_URL}/${transaction._id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);
      alert(
        `Successfully cleared ${allTransactions.length} transaction(s).`
      );
    } catch (error) {
      console.error("Error clearing budget history:", error);
      alert("Failed to clear budget history. Please try again.");
    }
  };

  // Helper function to get budget from localStorage
  const getBudgetForKey = (key) => {
    const saved = localStorage.getItem(key);
    return saved ? parseFloat(saved) : null;
  };

  // Helper function to generate budget key
  const getBudgetKey = (filter, date) => {
    const d = new Date(date);
    const pad = (num) => String(num).padStart(2, "0");
    switch (filter) {
      case "day":
        return `budget-day-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      case "week":
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return `budget-week-${weekStart.getFullYear()}-${pad(weekStart.getMonth() + 1)}-${pad(weekStart.getDate())}`;
      case "month":
        return `budget-month-${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      case "year":
        return `budget-year-${d.getFullYear()}`;
      default:
        return null;
    }
  };

  // Generate Year View PDF
  const generateYearViewPDF = async () => {
    try {
      const response = await authenticatedFetch(API_URL);
      const data = await response.json();
      const allTransactions = data.transactions || [];

      if (allTransactions.length === 0) {
        alert("No transactions found to generate PDF.");
        return;
      }

      const doc = new jsPDF();
      const currentYear = new Date().getFullYear();
      
      // Group transactions by month
      const monthsData = {};
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 1);
        
        const monthTransactions = allTransactions.filter((t) => {
          const transDate = new Date(t.date);
          return transDate >= monthStart && transDate < monthEnd;
        });

        if (monthTransactions.length > 0) {
          const monthKey = getBudgetKey("month", monthStart);
          const budget = getBudgetForKey(monthKey);
          
          const expenses = monthTransactions.filter((t) => t.type === "expense");
          const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
          
          // Calculate category breakdown
          const categories = {};
          expenses.forEach((t) => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
          });
          
          const categoryPercentages = Object.entries(categories)
            .map(([cat, amt]) => ({
              category: cat,
              amount: amt,
              percentage: totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

          monthsData[month] = {
            monthName: monthStart.toLocaleDateString("en-US", { month: "long" }),
            budget,
            transactions: monthTransactions,
            totalSpent,
            categoryPercentages,
          };
        }
      }

      let yPos = 20;
      doc.setFontSize(18);
      doc.text(`Spending Report - ${currentYear}`, 14, yPos);
      yPos += 10;

      Object.keys(monthsData).forEach((monthIndex) => {
        const monthData = monthsData[monthIndex];
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(monthData.monthName, 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        if (monthData.budget) {
          doc.text(`Budget: $${monthData.budget.toFixed(2)}`, 14, yPos);
          yPos += 6;
        }
        doc.text(`Total Spent: $${monthData.totalSpent.toFixed(2)}`, 14, yPos);
        yPos += 6;

        // Category breakdown
        if (monthData.categoryPercentages.length > 0) {
          doc.text("Category Breakdown:", 14, yPos);
          yPos += 6;
          monthData.categoryPercentages.forEach((cat) => {
            doc.text(
              `  ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage}%)`,
              14,
              yPos
            );
            yPos += 5;
          });
          yPos += 3;
        }

        // Transactions table
        const tableData = monthData.transactions.map((t) => [
          new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          t.title,
          t.category,
          t.type === "income" ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`,
        ]);

        doc.autoTable({
          startY: yPos,
          head: [["Date", "Description", "Category", "Amount"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [33, 150, 243] },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });

      doc.save(`spending-report-${currentYear}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Generate Month View PDF
  const generateMonthViewPDF = async () => {
    try {
      const response = await authenticatedFetch(API_URL);
      const data = await response.json();
      const allTransactions = data.transactions || [];

      if (allTransactions.length === 0) {
        alert("No transactions found to generate PDF.");
        return;
      }

      const doc = new jsPDF();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 1);
      
      const monthTransactions = allTransactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate < monthEnd;
      });

      if (monthTransactions.length === 0) {
        alert("No transactions found for current month.");
        return;
      }

      let yPos = 20;
      doc.setFontSize(18);
      doc.text(
        `Spending Report - ${monthStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`,
        14,
        yPos
      );
      yPos += 10;

      // Group transactions by week
      const weeksData = [];
      const weekStart = new Date(monthStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start from Sunday

      while (weekStart < monthEnd) {
        const weekEndDate = new Date(weekStart);
        weekEndDate.setDate(weekStart.getDate() + 7);

        const weekTransactions = monthTransactions.filter((t) => {
          const transDate = new Date(t.date);
          return transDate >= weekStart && transDate < weekEndDate;
        });

        if (weekTransactions.length > 0) {
          const weekKey = getBudgetKey("week", weekStart);
          const budget = getBudgetForKey(weekKey);

          const expenses = weekTransactions.filter((t) => t.type === "expense");
          const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

          // Calculate category breakdown
          const categories = {};
          expenses.forEach((t) => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
          });

          const categoryPercentages = Object.entries(categories)
            .map(([cat, amt]) => ({
              category: cat,
              amount: amt,
              percentage: totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

          const weekEndDisplay = new Date(weekEndDate);
          weekEndDisplay.setDate(weekEndDisplay.getDate() - 1);

          weeksData.push({
            weekLabel: `${weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - ${weekEndDisplay.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`,
            budget,
            transactions: weekTransactions,
            totalSpent,
            categoryPercentages,
          });
        }

        weekStart.setDate(weekStart.getDate() + 7);
      }

      weeksData.forEach((weekData) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(weekData.weekLabel, 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        if (weekData.budget) {
          doc.text(`Budget: $${weekData.budget.toFixed(2)}`, 14, yPos);
          yPos += 6;
        }
        doc.text(`Total Spent: $${weekData.totalSpent.toFixed(2)}`, 14, yPos);
        yPos += 6;

        // Category breakdown
        if (weekData.categoryPercentages.length > 0) {
          doc.text("Category Breakdown:", 14, yPos);
          yPos += 6;
          weekData.categoryPercentages.forEach((cat) => {
            doc.text(
              `  ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage}%)`,
              14,
              yPos
            );
            yPos += 5;
          });
          yPos += 3;
        }

        // Transactions table
        const tableData = weekData.transactions.map((t) => [
          new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          t.title,
          t.category,
          t.type === "income" ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`,
        ]);

        doc.autoTable({
          startY: yPos,
          head: [["Date", "Description", "Category", "Amount"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [33, 150, 243] },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });

      doc.save(
        `spending-report-${monthStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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
              <Download size={20} className="section-icon" />
              <h2 className="section-title">Download Reports</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Download your spending data as a PDF report. Year view shows monthly summaries, month view shows weekly summaries.
              </p>
              <div className="download-buttons">
                <button
                  className="download-button"
                  onClick={generateYearViewPDF}
                >
                  Download Year View PDF
                </button>
                <button
                  className="download-button"
                  onClick={generateMonthViewPDF}
                >
                  Download Month View PDF
                </button>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <Trash2 size={20} className="section-icon" />
              <h2 className="section-title">Budget History</h2>
            </div>
            <div className="section-content">
              <p className="section-description">
                Permanently delete all transactions. This action cannot be undone.
              </p>
              <div className="clear-history-buttons">
                <button
                  className="clear-history-button"
                  onClick={handleClearAllHistory}
                >
                  Clear All History
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

