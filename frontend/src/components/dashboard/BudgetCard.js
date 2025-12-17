import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import "./BudgetCard.css";

const BudgetCard = ({ transactions, budget, timeFilter, onBudgetUpdate }) => {
  const [localBudget, setLocalBudget] = useState(budget);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalBudget(budget);
  }, [budget]);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = localBudget - totalExpenses;
  const percentage = localBudget > 0 ? (totalExpenses / localBudget) * 100 : 0;

  const handleSaveBudget = () => {
    if (onBudgetUpdate) {
      onBudgetUpdate(localBudget);
    } else {
      localStorage.setItem("budget", localBudget.toString());
    }
    setIsEditing(false);
  };

  return (
    <div className="budget-card">
      <div className="budget-header">
        <div className="budget-title-section">
          <DollarSign size={24} className="budget-icon" />
          <div>
            <h2 className="budget-title">Budget</h2>
            <span className="budget-period">
              {timeFilter === "day"
                ? "Today"
                : timeFilter === "month"
                ? "This Month"
                : "This Year"}
            </span>
          </div>
        </div>
        {!isEditing ? (
          <button
            className="edit-budget-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        ) : (
          <button className="save-budget-button" onClick={handleSaveBudget}>
            Save
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="budget-edit">
          <input
            type="number"
            value={localBudget}
            onChange={(e) => setLocalBudget(parseFloat(e.target.value) || 0)}
            placeholder="Enter budget"
            className="budget-input"
          />
        </div>
      ) : (
        <>
          <div className="budget-amount">${localBudget.toFixed(2)}</div>
          <div className="budget-stats">
            <div className="budget-stat">
              <span className="stat-label">Spent</span>
              <span className="stat-value expense">${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="budget-stat">
              <span className="stat-label">Remaining</span>
              <span
                className={`stat-value ${
                  remaining >= 0 ? "success" : "danger"
                }`}
              >
                {remaining >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                ${Math.abs(remaining).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="budget-progress">
            <div
              className="budget-progress-bar"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: percentage > 100 ? "var(--danger)" : "var(--accent)",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetCard;

