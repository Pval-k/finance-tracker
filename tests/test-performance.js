// Performance Testing Script for Resume Metrics
// Run from project root: cd backend && node ../tests/test-performance.js

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testPerformance() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('finance-tracker');
    const collection = db.collection('transactions');
    
    // Test 1: Count existing transactions
    const existingCount = await collection.countDocuments();
    console.log('\nCurrent Database State:');
    console.log('   Total transactions:', existingCount);
    
    // Test 2: Measure CRUD operations
    console.log('\nPerformance Tests:\n');
    
    const testUserId = 'test-user-' + Date.now();
    const testTransactions = [];
    
    // Generate test data
    for (let i = 0; i < 1000; i++) {
      testTransactions.push({
        userId: testUserId,
        title: `Test Transaction ${i}`,
        amount: Math.random() * 1000,
        category: ['Food', 'Transportation', 'Entertainment', 'Rent'][Math.floor(Math.random() * 4)],
        type: Math.random() > 0.5 ? 'expense' : 'income',
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        createdAt: new Date()
      });
    }
    
    // Test INSERT performance
    const insertStart = Date.now();
    const insertResult = await collection.insertMany(testTransactions);
    const insertTime = Date.now() - insertStart;
    const insertRate = Math.round(1000 / (insertTime / 1000));
    
    console.log('INSERT Performance:');
    console.log(`   Inserted 1,000 transactions in ${insertTime}ms`);
    console.log(`   Rate: ~${insertRate} transactions/second`);
    
    // Test READ performance (by userId)
    const readStart = Date.now();
    const readResult = await collection.find({ userId: testUserId }).toArray();
    const readTime = Date.now() - readStart;
    const readRate = Math.round(readResult.length / (readTime / 1000));
    
    console.log('\nREAD Performance:');
    console.log(`   Read ${readResult.length} transactions in ${readTime}ms`);
    console.log(`   Rate: ~${readRate} transactions/second`);
    
    // Test date range query (month view)
    const monthStart = Date.now();
    const monthQuery = await collection.find({
      userId: testUserId,
      date: {
        $gte: '2024-01-01',
        $lt: '2024-02-01'
      }
    }).toArray();
    const monthTime = Date.now() - monthStart;
    
    console.log('\nDate Range Query (Month):');
    console.log(`   Found ${monthQuery.length} transactions in ${monthTime}ms`);
    
    // Test aggregation (category totals)
    const aggStart = Date.now();
    const categoryTotals = await collection.aggregate([
      { $match: { userId: testUserId, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]).toArray();
    const aggTime = Date.now() - aggStart;
    
    console.log('\nAggregation (Category Totals):');
    console.log(`   Processed ${categoryTotals.length} categories in ${aggTime}ms`);
    
    // Cleanup test data
    await collection.deleteMany({ userId: testUserId });
    
    // Test 3: Count users
    const uniqueUsers = await collection.distinct('userId');
    console.log('\nDatabase Statistics:');
    console.log('   Unique users:', uniqueUsers.length);
    
    // Summary for resume
    console.log('\nResume Metrics Summary:\n');
    console.log(`   • Supports ${Math.round(insertRate / 100) * 100}+ transactions/second INSERT rate`);
    console.log(`   • Handles ${Math.round(readRate / 100) * 100}+ transactions/second READ rate`);
    console.log(`   • Efficient date range queries (<${Math.max(monthTime, 50)}ms for monthly data)`);
    console.log(`   • Fast aggregations (<${Math.max(aggTime, 50)}ms for category analysis)`);
    console.log(`   • Current database: ${existingCount} transactions across ${uniqueUsers.length} users\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

testPerformance();

