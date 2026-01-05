import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/verifyToken";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Categories considered "unnecessary spending"
const DISCRETIONARY_CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
];

const ESSENTIAL_CATEGORIES = ["Rent", "Bills", "Utilities", "Salary"];

export async function POST(request) {
  try {
    const { userId, error } = await verifyToken(request);
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const body = await request.json();
    const { budget, timeFilter, selectedDate } = body;

    if (!budget || budget === 0) {
      return NextResponse.json({
        insights: [],
        fallback: true,
        message: "Set a budget to get insights!",
      });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("finance-tracker");
    const collection = db.collection("transactions");

    // Parse selectedDate
    const date = new Date(selectedDate);

    // Get current period transactions
    const currentStart = getPeriodStart(date, timeFilter);
    const currentEnd = getPeriodEnd(date, timeFilter);
    const previousStart = getPreviousPeriodStart(date, timeFilter);
    const previousEnd = getPreviousPeriodEnd(date, timeFilter);

    const currentTransactions = await collection
      .find({
        userId,
        date: {
          $gte: currentStart.toISOString(),
          $lt: currentEnd.toISOString(),
        },
        type: "expense",
      })
      .toArray();

    const previousTransactions = await collection
      .find({
        userId,
        date: {
          $gte: previousStart.toISOString(),
          $lt: previousEnd.toISOString(),
        },
        type: "expense",
      })
      .toArray();

    if (currentTransactions.length === 0) {
      return NextResponse.json({
        insights: [],
        fallback: true,
        message: "Add expenses to get insights!",
      });
    }

    // Calculate stats
    const currentTotal = currentTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const previousTotal = previousTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const currentCategories = {};
    currentTransactions.forEach((t) => {
      currentCategories[t.category] =
        (currentCategories[t.category] || 0) + t.amount;
    });

    const previousCategories = {};
    previousTransactions.forEach((t) => {
      previousCategories[t.category] =
        (previousCategories[t.category] || 0) + t.amount;
    });

    // Weekly breakdown (if month view)
    let weeklyBreakdown = null;
    if (timeFilter === "month") {
      weeklyBreakdown = getWeeklyBreakdown(currentTransactions, date);
    }

    // Find discretionary spending over budget
    const discretionarySpending = {};
    let discretionaryTotal = 0;
    DISCRETIONARY_CATEGORIES.forEach((cat) => {
      if (currentCategories[cat]) {
        discretionarySpending[cat] = currentCategories[cat];
        discretionaryTotal += currentCategories[cat];
      }
    });

    const overBudget = currentTotal - budget;
    const budgetPercentage = (currentTotal / budget) * 100;

    // Try AI insights, but have fallback ready
    let aiInsights = [];
    let usingAI = false;

    try {
      // Check if API key exists and OpenAI is initialized
      if (!openai || !process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = buildAIPrompt(
        budget,
        currentTotal,
        overBudget,
        budgetPercentage,
        discretionarySpending,
        weeklyBreakdown,
        previousCategories,
        timeFilter
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      });

      const insightsText = completion.choices[0].message.content;
      aiInsights = insightsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.match(/^[-•*]\s*$/))
        .slice(0, 3);

      usingAI = true;
    } catch (error) {
      // Handle "insufficient credits" or other API errors
      console.error(
        "AI API error (likely out of free credits):",
        error.message
      );

      // Don't throw - we'll use fallback instead
      usingAI = false;
    }

    // Fallback: Generate basic insights without AI
    if (!usingAI || aiInsights.length === 0) {
      aiInsights = generateFallbackInsights(
        budget,
        currentTotal,
        overBudget,
        budgetPercentage,
        discretionarySpending,
        weeklyBreakdown,
        previousCategories
      );
    }

    return NextResponse.json({
      insights: aiInsights,
      stats: {
        currentTotal,
        budget,
        overBudget,
        budgetPercentage,
        discretionaryTotal,
        transactionCount: currentTransactions.length,
      },
      weeklyBreakdown,
      usingAI,
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

function buildAIPrompt(
  budget,
  currentTotal,
  overBudget,
  budgetPercentage,
  discretionarySpending,
  weeklyBreakdown,
  previousCategories,
  timeFilter
) {
  const periodName =
    timeFilter === "day"
      ? "today"
      : timeFilter === "month"
      ? "this month"
      : "this year";

  let prompt = `You are a helpful financial assistant focused on budget optimization. Analyze this spending data and provide 2-3 specific, actionable insights to help reduce unnecessary spending.

Budget: $${budget.toFixed(2)}
Current Spending: $${currentTotal.toFixed(2)}
Status: ${
    overBudget > 0
      ? `$${overBudget.toFixed(2)} OVER budget`
      : `$${Math.abs(overBudget).toFixed(2)} under budget`
  }
Budget Used: ${budgetPercentage.toFixed(1)}%

Discretionary Spending (unnecessary categories):
${Object.entries(discretionarySpending)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
  .join("\n")}`;

  if (weeklyBreakdown) {
    const highestWeek = weeklyBreakdown.reduce((max, week) =>
      week.total > max.total ? week : max
    );
    prompt += `\n\nWeekly Breakdown:
${weeklyBreakdown
  .map((w) => `Week ${w.week}: $${w.total.toFixed(2)}`)
  .join("\n")}
Highest spending week: Week ${highestWeek.week} ($${highestWeek.total.toFixed(
      2
    )})`;

    if (highestWeek.categories) {
      prompt += `\nWeek ${highestWeek.week} top categories: ${Object.entries(
        highestWeek.categories
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat} ($${amt.toFixed(2)})`)
        .join(", ")}`;
    }
  }

  if (Object.keys(previousCategories).length > 0) {
    prompt += `\n\nPrevious Period Comparison:
${Object.entries(previousCategories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`)
  .join("\n")}`;
  }

  prompt += `\n\nProvide 2-3 friendly, conversational insights focusing on:
- Which discretionary categories are driving overspending (talk like you're helping a friend)
- Specific reduction targets (e.g., "Try cutting Entertainment spending by $X this month")
- Weekly patterns if applicable (e.g., "Week 2 was your biggest spending week")
- Actionable, encouraging advice to get back on budget

Write naturally and conversationally. Avoid technical jargon or percentages. Keep each insight to one sentence. Format as a simple list, no markdown.`;

  return prompt;
}

function generateFallbackInsights(
  budget,
  currentTotal,
  overBudget,
  budgetPercentage,
  discretionarySpending,
  weeklyBreakdown,
  previousCategories
) {
  const insights = [];

  // Budget status
  if (overBudget > 0) {
    insights.push(`You're $${overBudget.toFixed(2)} over budget this period.`);
  } else {
    insights.push(
      `You're doing great! $${Math.abs(overBudget).toFixed(2)} under budget.`
    );
  }

  // Top discretionary category
  const topDiscretionary = Object.entries(discretionarySpending).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topDiscretionary) {
    const [category, amount] = topDiscretionary;
    const reduction = overBudget > 0 ? Math.min(amount, overBudget * 0.6) : 0;
    if (reduction > 0) {
      insights.push(
        `Your ${category} spending is $${amount.toFixed(
          2
        )}. Consider reducing it by $${reduction.toFixed(
          2
        )} to help stay within budget.`
      );
    } else {
      insights.push(
        `Your highest discretionary category is ${category} at $${amount.toFixed(
          2
        )}.`
      );
    }
  }

  // Weekly pattern
  if (weeklyBreakdown && weeklyBreakdown.length > 1) {
    const highestWeek = weeklyBreakdown.reduce((max, week) =>
      week.total > max.total ? week : max
    );
    const lowestWeek = weeklyBreakdown.reduce((min, week) =>
      week.total < min.total ? week : min
    );
    if (highestWeek.total > lowestWeek.total * 1.3) {
      insights.push(
        `Week ${
          highestWeek.week
        } had the highest spending ($${highestWeek.total.toFixed(
          2
        )}). Consider reviewing what drove that increase.`
      );
    }
  }

  return insights.slice(0, 3);
}

function getWeeklyBreakdown(transactions, selectedDate) {
  const date = new Date(selectedDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  const weeks = [
    { week: 1, start: 1, end: 7, transactions: [], total: 0, categories: {} },
    { week: 2, start: 8, end: 14, transactions: [], total: 0, categories: {} },
    { week: 3, start: 15, end: 21, transactions: [], total: 0, categories: {} },
    { week: 4, start: 22, end: 31, transactions: [], total: 0, categories: {} },
  ];

  transactions.forEach((transaction) => {
    const transDate = new Date(transaction.date);
    const day = transDate.getDate();

    let weekIndex = -1;
    if (day >= 1 && day <= 7) weekIndex = 0;
    else if (day >= 8 && day <= 14) weekIndex = 1;
    else if (day >= 15 && day <= 21) weekIndex = 2;
    else if (day >= 22) weekIndex = 3;

    if (weekIndex >= 0) {
      weeks[weekIndex].transactions.push(transaction);
      weeks[weekIndex].total += transaction.amount;
      weeks[weekIndex].categories[transaction.category] =
        (weeks[weekIndex].categories[transaction.category] || 0) +
        transaction.amount;
    }
  });

  return weeks.filter((w) => w.transactions.length > 0);
}

// Helper functions
function getPeriodStart(date, filter) {
  const d = new Date(date);
  switch (filter) {
    case "day":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    case "month":
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case "year":
      return new Date(d.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
}

function getPeriodEnd(date, filter) {
  const d = new Date(date);
  switch (filter) {
    case "day":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7); // End of week (next Sunday)
      return weekEnd;
    case "month":
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    case "year":
      return new Date(d.getFullYear() + 1, 0, 1);
    default:
      return new Date();
  }
}

function getPreviousPeriodStart(date, filter) {
  const d = new Date(date);
  switch (filter) {
    case "day":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of current week
      weekStart.setDate(weekStart.getDate() - 7); // Previous week start
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    case "month":
      return new Date(d.getFullYear(), d.getMonth() - 1, 1);
    case "year":
      return new Date(d.getFullYear() - 1, 0, 1);
    default:
      return new Date(0);
  }
}

function getPreviousPeriodEnd(date, filter) {
  const d = new Date(date);
  switch (filter) {
    case "day":
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Start of current week
      weekStart.setHours(0, 0, 0, 0);
      return weekStart; // Previous week ends when current week starts
    case "month":
      return new Date(d.getFullYear(), d.getMonth(), 1);
    case "year":
      return new Date(d.getFullYear(), 0, 1);
    default:
      return new Date();
  }
}
