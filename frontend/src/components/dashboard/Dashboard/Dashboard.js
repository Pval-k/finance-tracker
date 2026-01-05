import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import TransactionList from "../../transaction/TransactionList/TransactionList";
import BudgetCard from "../BudgetCard/BudgetCard";
import BudgetInsights from "../BudgetInsights/BudgetInsights";
import CategoryChart from "../CategoryChart/CategoryChart";
import TimeFilters from "../TimeFilters/TimeFilters";
import { authenticatedFetch } from "../../../utils/api";
import { API_URL } from "../../../config/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Track the selected period date

  // Helper function to generate budget key based on time filter and date
  const getBudgetKey = (filter, date) => {
    const d = new Date(date);
    const pad = (num) => String(num).padStart(2, "0");
    switch (filter) {
      case "day":
        return `budget-day-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
          d.getDate()
        )}`;
      case "week":
        // Use week start date (Sunday)
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return `budget-week-${weekStart.getFullYear()}-${pad(
          weekStart.getMonth() + 1
        )}-${pad(weekStart.getDate())}`;
      case "month":
        return `budget-month-${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      case "year":
        return `budget-year-${d.getFullYear()}`;
      default:
        return "budget-default";
    }
  };

  // Load budget for current period
  const loadBudgetForPeriod = (filter, date) => {
    const key = getBudgetKey(filter, date);
    const saved = localStorage.getItem(key);
    return saved ? parseFloat(saved) : null; // null means no budget set
  };

  const [budget, setBudget] = useState(() =>
    loadBudgetForPeriod(timeFilter, selectedDate)
  );

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions again when user comes back to dashboard
  useEffect(() => {
    if (location.pathname === "/") {
      fetchTransactions();
    }
  }, [location.pathname]);

  useEffect(() => {
    filterTransactions();
    // Load budget when time filter or selected date changes
    const periodBudget = loadBudgetForPeriod(timeFilter, selectedDate);
    setBudget(periodBudget);
  }, [transactions, timeFilter, selectedDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_URL);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = (newBudget) => {
    const key = getBudgetKey(timeFilter, selectedDate);
    if (newBudget && newBudget > 0) {
      setBudget(newBudget);
      localStorage.setItem(key, newBudget.toString());
    } else {
      // Remove budget if set to 0 or empty
      setBudget(null);
      localStorage.removeItem(key);
    }
  };

  const filterTransactions = () => {
    let startDate;
    let endDate;

    switch (timeFilter) {
      case "day":
        startDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        endDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate() + 1
        );
        break;
      case "week":
        // Get start of week (Sunday)
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        // Get end of week (Saturday + 1 day)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        endDate = weekEnd;
        break;
      case "month":
        startDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        endDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          1
        );
        break;
      case "year":
        startDate = new Date(selectedDate.getFullYear(), 0, 1);
        endDate = new Date(selectedDate.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const filtered = transactions.filter((transaction) => {
      let transactionDate;

      // Handle dates stored as "YYYY-MM-DD" strings (ensure local dates, not UTC-shifted)
      if (
        typeof transaction.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
      ) {
        const [year, month, day] = transaction.date.split("-").map(Number);
        transactionDate = new Date(year, month - 1, day);
      } else {
        transactionDate = new Date(transaction.date);
      }

      return transactionDate >= startDate && transactionDate < endDate;
    });

    setFilteredTransactions(filtered);
  };

  const handlePeriodChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleDeleteAllInPeriod = async () => {
    // Confirm before deleting
    const confirmed = window.confirm(
      "Are you sure you want to delete all transactions for this period? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      // Delete each transaction in the filtered list
      const deletePromises = filteredTransactions.map((transaction) =>
        authenticatedFetch(`${API_URL}/${transaction._id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(deletePromises);
      fetchTransactions();
      alert("All transactions for this period have been deleted.");
    } catch (error) {
      console.error("Error deleting transactions:", error);
      alert("Failed to delete transactions. Please try again.");
    }
  };

  const formatTitle = () => {
    const date = new Date(selectedDate);
    switch (timeFilter) {
      case "day":
        const day = date.getDate();
        return `${day} ${date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`;
      case "week":
        // Get start and end of week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        // Format as "Jan 5 - Jan 11, 2025"
        const startStr = weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const endStr = weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return `${startStr} - ${endStr}`;
      case "month":
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "year":
        return date.getFullYear().toString();
      default:
        return "Dashboard";
    }
  };

  const handleAddTransactionClick = () => {
    navigate("/add-transaction");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await authenticatedFetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="dashboard">
      <Header onAddTransactionClick={handleAddTransactionClick} />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-title-section">
              <h1 className="dashboard-title">{formatTitle()}</h1>
            </div>
            <TimeFilters
              timeFilter={timeFilter}
              selectedDate={selectedDate}
              onFilterChange={setTimeFilter}
              onPeriodChange={handlePeriodChange}
            />
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-main-content">
              <BudgetCard
                transactions={filteredTransactions}
                budget={budget}
                timeFilter={timeFilter}
                onBudgetUpdate={handleBudgetUpdate}
              />
              <TransactionList
                transactions={filteredTransactions}
                onEdit={(transaction) =>
                  navigate(`/add-transaction`, { state: { transaction } })
                }
                onDelete={handleDelete}
                onDeleteAll={handleDeleteAllInPeriod}
                loading={loading}
              />
            </div>
            <div className="dashboard-sidebar">
              <CategoryChart transactions={filteredTransactions} />
              <BudgetInsights
                transactions={filteredTransactions}
                timeFilter={timeFilter}
                selectedDate={selectedDate}
                budget={budget}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

