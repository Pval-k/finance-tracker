import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./CategoryChart.css";

const COLORS = [
  "#2196f3",
  "#4caf50",
  "#ff9800",
  "#9c27b0",
  "#f44336",
  "#00bcd4",
  "#795548",
  "#607d8b",
  "#e91e63",
  "#009688",
];

const CategoryChart = ({ transactions }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for hidden transactions updates
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((prev) => prev + 1);
    };
    window.addEventListener("hiddenTransactionsUpdated", handleUpdate);
    return () => {
      window.removeEventListener("hiddenTransactionsUpdated", handleUpdate);
    };
  }, []);

  const categoryData = useMemo(() => {
    // Get hidden transactions from localStorage
    const getHiddenTransactions = () => {
      const hidden = localStorage.getItem("hiddenTransactions");
      return hidden ? new Set(JSON.parse(hidden)) : new Set();
    };

    const hiddenTransactions = getHiddenTransactions();

    // Filter out hidden transactions
    const expenses = transactions.filter(
      (t) => t.type === "expense" && !hiddenTransactions.has(t._id)
    );
    const categoryTotals = {};

    expenses.forEach((transaction) => {
      const category = transaction.category;
      if (categoryTotals[category]) {
        categoryTotals[category] += transaction.amount;
      } else {
        categoryTotals[category] = transaction.amount;
      }
    });

    const total = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [transactions, refreshKey]);

  if (categoryData.length === 0) {
    return (
      <div className="category-chart">
        <h2 className="chart-title">Category Breakdown</h2>
        <div className="chart-empty">No expense data available</div>
      </div>
    );
  }

  return (
    <div className="category-chart">
      <h2 className="chart-title">Category Breakdown</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => {
                const data = props.payload;
                return [`${data.name}: ${data.percentage}%`];
              }}
              labelFormatter={() => ""}
              contentStyle={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-list">
        {categoryData.map((item, index) => (
          <div key={item.name} className="chart-item">
            <div
              className="chart-color"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="chart-item-info">
              <span className="chart-item-name">{item.name}</span>
              <span className="chart-item-value">${item.value.toFixed(2)}</span>
            </div>
            <span className="chart-item-percentage">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
