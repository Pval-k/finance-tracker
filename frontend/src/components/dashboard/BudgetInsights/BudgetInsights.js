import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { authenticatedFetch } from "../../../utils/api";
import { getApiEndpoint } from "../../../config/api";
import "./BudgetInsights.css";

const BudgetInsights = ({ transactions, timeFilter, selectedDate, budget }) => {
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    if (!budget || budget === 0) {
      setInsights([]);
      setStats(null);
      return;
    }

    if (transactions.length === 0) {
      setInsights([]);
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get API URL for budget-insights endpoint
      const apiUrl = getApiEndpoint("budget-insights");

      const response = await authenticatedFetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          budget,
          timeFilter,
          selectedDate: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch insights");
      }

      const data = await response.json();
      setInsights(data.insights || []);
      setStats(data.stats);
      setUsingAI(data.usingAI !== false); // kept for potential future use
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load insights");
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length, timeFilter, selectedDate, budget]);

  if (!budget || budget === null || budget === 0) {
    return null; // Don't show if no budget set
  }

  return (
    <div className="budget-insights-card">
      <div className="budget-insights-header">
        <div className="budget-insights-title-section">
          <Sparkles size={20} className="ai-icon" />
          <h3 className="budget-insights-title">Budget Insights</h3>
        </div>
        <button
          className="refresh-insights-button"
          onClick={fetchInsights}
          disabled={loading}
          title="Refresh insights"
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
        </button>
      </div>

      <div className="budget-insights-content">
        {loading ? (
          <div className="ai-loading">Analyzing your spending...</div>
        ) : error ? (
          <div className="ai-error">{error}</div>
        ) : insights.length > 0 ? (
          <ul className="budget-insights-list">
            {insights.map((insight, index) => (
              <li key={index} className="budget-insight-item">
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <div className="ai-empty">
            Add more expenses to get insights about your spending patterns.
          </div>
        )}
      </div>

      {stats && stats.overBudget !== 0 && (
        <div className="budget-insights-stats">
          <div className="budget-stat-item">
            <span className="budget-stat-label">Budget Status:</span>
            <span
              className={`budget-stat-value ${
                stats.overBudget > 0 ? "increase" : "decrease"
              }`}
            >
              {stats.overBudget > 0 ? (
                <>
                  <TrendingUp size={14} />${stats.overBudget.toFixed(2)} over
                </>
              ) : (
                <>
                  <TrendingDown size={14} />$
                  {Math.abs(stats.overBudget).toFixed(2)} under
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetInsights;

