#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

interface MigrationOptions {
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
  environment?: 'development' | 'staging' | 'production';
}

class DatabaseMigrationManager {
  private readonly projectRoot: string;
  private readonly drizzleConfigPath: string;
  private readonly envFile: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.drizzleConfigPath = path.join(this.projectRoot, 'drizzle.config.ts');
    this.envFile = path.join(this.projectRoot, '.env.local');
  }

  private validateEnvironment(): void {
    console.log('🔍 Validating environment...');

    if (!existsSync(this.drizzleConfigPath)) {
      throw new Error('Drizzle config not found');
    }

    if (!existsSync(this.envFile)) {
      throw new Error('Environment file not found');
    }

    try {
      const envContent = readFileSync(this.envFile, 'utf-8');
      if (!envContent.includes('DATABASE_URL=')) {
        throw new Error('DATABASE_URL not found in environment file');
      }
    } catch (error) {
      throw new Error('Failed to read environment file');
    }

    console.log('✅ Environment validation passed');
  }

  private executeCommand(command: string, options: { silent?: boolean } = {}): string {
    const envCommand = 'set -a && source ' + this.envFile + ' && set +a && ' + command;
    
    try {
      const result = execSync(envCommand, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        stdio: options.silent ? 'pipe' : 'inherit',
      });
      
      return result;
    } catch (error: any) {
      throw new Error('Command failed: ' + command);
    }
  }

  async runMigrations(options: MigrationOptions = {}): Promise<void> {
    console.log('🚀 Running database migrations...');
    
    if (options.dryRun) {
      console.log('🧪 Dry run mode - no changes will be applied');
      this.executeCommand('npx drizzle-kit migrate --dry-run');
      return;
    }

    try {
      this.executeCommand('npx drizzle-kit migrate');
      console.log('✅ Migrations completed successfully');
      
      await this.generateSnapshot();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async generateSnapshot(): Promise<void> {
    console.log('📸 Generating schema snapshot...');
    
    try {
      this.executeCommand('npx drizzle-kit generate');
      console.log('✅ Snapshot generated successfully');
    } catch (error) {
      console.error('❌ Snapshot generation failed:', error);
      throw error;
    }
  }

  async checkMigrationStatus(): Promise<void> {
    console.log('📊 Checking migration status...');
    
    try {
      const migrationQuery = 'SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 10;';
      
      console.log('\n📋 Recent migrations:');
      this.executeCommand('psql "$DATABASE_URL" -c "' + migrationQuery + '"');
      
    } catch (error) {
      console.error('❌ Failed to check migration status:', error);
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const options: MigrationOptions = {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
    environment: 'development',
  };

  const manager = new DatabaseMigrationManager();

  try {
    manager.validateEnvironment();

    switch (command) {
      case 'run':
        await manager.runMigrations(options);
        break;
        
      case 'status':
        await manager.checkMigrationStatus();
        break;
        
      case 'snapshot':
        await manager.generateSnapshot();
        break;
        
      default:
        console.log(`
🗃️  Database Migration Manager

Usage:
  tsx scripts/db-migrate.ts <command> [options]

Commands:
  run         Run pending migrations
  status      Check migration status  
  snapshot    Generate schema snapshot

Options:
  --dry-run   Preview changes without applying

Examples:
  tsx scripts/db-migrate.ts run
  tsx scripts/db-migrate.ts status
  tsx scripts/db-migrate.ts snapshot
        `);
        break;
    }
  } catch (error) {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { DatabaseMigrationManager };
