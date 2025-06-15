#!/usr/bin/env tsx

/**
 * Database Connection Monitor
 * 
 * This script helps monitor PostgreSQL connections and diagnose connection pool issues.
 * Run with: npx tsx scripts/check-db-connections.ts
 */

import { db } from '../src/db/config';
import { sql } from 'drizzle-orm';

async function checkDatabaseConnections() {
  try {
    console.log('🔍 Checking database connection status...\n');

    // Check current connection count
    const connectionResult = await db.execute(sql`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);

    const connections = connectionResult[0];
    if (!connections) {
      throw new Error('Failed to get connection information');
    }
    
    console.log('📊 Current Database Connections:');
    console.log(`   Total: ${connections.total_connections}`);
    console.log(`   Active: ${connections.active_connections}`);
    console.log(`   Idle: ${connections.idle_connections}\n`);

    // Check max connections setting
    const maxConnResult = await db.execute(sql`SHOW max_connections`);
    const maxConnections = maxConnResult[0]?.max_connections;
    console.log(`⚙️  PostgreSQL max_connections: ${maxConnections}\n`);

    // Check for long-running queries
    const longRunningResult = await db.execute(sql`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query,
        state
      FROM pg_stat_activity 
      WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
        AND datname = current_database()
        AND state != 'idle'
    `);

    if (longRunningResult.length > 0) {
      console.log('⚠️  Long-running queries (>5 minutes):');
      longRunningResult.forEach((query, index) => {
        console.log(`   ${index + 1}. PID: ${query.pid}, Duration: ${query.duration}`);
        console.log(`      Query: ${String(query.query).substring(0, 100)}...`);
        console.log(`      State: ${query.state}\n`);
      });
    } else {
      console.log('✅ No long-running queries detected\n');
    }

    // Connection pool recommendations
    const totalConn = parseInt(String(connections.total_connections));
    const maxConn = parseInt(String(maxConnections));
    const usage = (totalConn / maxConn) * 100;

    console.log('💡 Connection Pool Analysis:');
    console.log(`   Usage: ${usage.toFixed(1)}% (${totalConn}/${maxConn})`);
    
    if (usage > 80) {
      console.log('   🚨 HIGH USAGE - Consider reducing connection pool size or optimizing queries');
    } else if (usage > 60) {
      console.log('   ⚠️  MODERATE USAGE - Monitor closely');
    } else {
      console.log('   ✅ HEALTHY USAGE');
    }

    console.log('\n📋 Current Connection Pool Settings:');
    console.log('   Max connections per pool: 10');
    console.log('   Idle timeout: 20 seconds');
    console.log('   Max lifetime: 30 minutes');
    console.log('   Connect timeout: 30 seconds');

    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. If you see "too many clients" errors:');
    console.log('      - Reduce max pool size in src/db/config.ts');
    console.log('      - Check for connection leaks in your code');
    console.log('      - Ensure proper error handling in database queries');
    console.log('   2. For better performance:');
    console.log('      - Use connection pooling (already configured)');
    console.log('      - Close connections properly after use');
    console.log('      - Avoid long-running transactions');

  } catch (error) {
    console.error('❌ Error checking database connections:', error);
    process.exit(1);
  }
}

// Run the check
checkDatabaseConnections()
  .then(() => {
    console.log('\n✅ Database connection check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to check database connections:', error);
    process.exit(1);
  }); 