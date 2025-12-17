import React from "react";
import TransactionItem from "./TransactionItem";
import "./TransactionList.css";

const TransactionList = ({ transactions, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-container">
        <h2 className="list-title">Transactions</h2>
        <div className="transaction-list-empty">
          <p>No transactions found for this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <h2 className="list-title">Transactions</h2>
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
