import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import TransactionList from "../transaction/TransactionList";
import BudgetCard from "./BudgetCard";
import CategoryChart from "./CategoryChart";
import TimeFilters from "./TimeFilters";
import "./Dashboard.css";

const API_URL = "/api/transactions";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Track the selected period date
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem("budget");
    return saved ? parseFloat(saved) : 0;
  });

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
  }, [transactions, timeFilter, selectedDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: {
          "x-user-id": "test-user-id",
        },
      });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetUpdate = (newBudget) => {
    setBudget(newBudget);
    localStorage.setItem("budget", newBudget.toString());
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
      const transactionDate = new Date(transaction.date);
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
        fetch(`${API_URL}/${transaction._id}`, {
          method: "DELETE",
          headers: {
            "x-user-id": "test-user-id",
          },
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
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": "test-user-id",
        },
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
              onDeleteAll={handleDeleteAllInPeriod}
              showToggleOnly={true}
            />
          </div>
          <div className="dashboard-navigation">
            <TimeFilters
              timeFilter={timeFilter}
              selectedDate={selectedDate}
              onFilterChange={setTimeFilter}
              onPeriodChange={handlePeriodChange}
              showNavigationOnly={true}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
