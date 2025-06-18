import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env.mjs';
import { workflows, models, rules, decision_tables, knowledge_bases, tenants } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * RLS Policy Testing Script
 * 
 * This script tests that Row-Level Security policies correctly isolate data between tenants.
 * It verifies that:
 * 1. Users can only see data from their active tenant
 * 2. Users cannot access data from other tenants
 * 3. RLS policies are properly enforced on all CRUD operations
 */

interface TestTenant {
  id: number;
  name: string;
  uuid: string;
}

interface TestData {
  workflowId?: number;
  modelId?: number;
  ruleId?: number;
  decisionTableId?: number;
  knowledgeBaseId?: number;
}

class RLSTestRunner {
  private client1: postgres.Sql;
  private client2: postgres.Sql;
  private db1: ReturnType<typeof drizzle>;
  private db2: ReturnType<typeof drizzle>;
  private tenant1: TestTenant | null = null;
  private tenant2: TestTenant | null = null;
  private testData1: TestData = {};
  private testData2: TestData = {};

  constructor() {
    // Create two separate database connections to simulate different user sessions
    this.client1 = postgres(env.DATABASE_URL);
    this.client2 = postgres(env.DATABASE_URL);
    this.db1 = drizzle(this.client1);
    this.db2 = drizzle(this.client2);
  }

  async setup(): Promise<void> {
    console.log('🔧 Setting up RLS test environment...');

    try {
      // Create test tenants
      const testTenants = await this.db1.insert(tenants).values([
        {
          name: 'RLS Test Tenant A',
          description: 'Test tenant A for RLS validation',
          slug: 'rls-test-tenant-a',
          isActive: true,
        },
        {
          name: 'RLS Test Tenant B', 
          description: 'Test tenant B for RLS validation',
          slug: 'rls-test-tenant-b',
          isActive: true,
        }
      ]).returning();

      this.tenant1 = testTenants[0] as TestTenant;
      this.tenant2 = testTenants[1] as TestTenant;

      if (!this.tenant1 || !this.tenant2) {
        throw new Error('Failed to create test tenants');
      }

      console.log(`✅ Created test tenants: ${this.tenant1.name} (${this.tenant1.id}) and ${this.tenant2.name} (${this.tenant2.id})`);

      // Set tenant contexts for each connection
      await this.setTenantContext(this.client1, this.tenant1.id);
      await this.setTenantContext(this.client2, this.tenant2.id);

      // Create test data for each tenant
      await this.createTestData();

    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  private async setTenantContext(client: postgres.Sql, tenantId: number): Promise<void> {
    await client`SELECT set_tenant_context(${tenantId})`;
  }

  private async createTestData(): Promise<void> {
    console.log('📝 Creating test data for each tenant...');

    // Create test data for tenant 1
    const workflow1 = await this.db1.insert(workflows).values({
      name: 'Test Workflow Tenant 1',
      description: 'Test workflow for tenant 1',
      tenantId: this.tenant1!.id,
      status: 'active',
    }).returning();
    this.testData1.workflowId = workflow1[0].id;

    const model1 = await this.db1.insert(models).values({
      name: 'Test Model Tenant 1',
      description: 'Test model for tenant 1',
      tenantId: this.tenant1!.id,
      status: 'active',
      modelType: 'classification',
    }).returning();
    this.testData1.modelId = model1[0].id;

    // Create test data for tenant 2
    const workflow2 = await this.db2.insert(workflows).values({
      name: 'Test Workflow Tenant 2',
      description: 'Test workflow for tenant 2',
      tenantId: this.tenant2!.id,
      status: 'active',
    }).returning();
    this.testData2.workflowId = workflow2[0].id;

    const model2 = await this.db2.insert(models).values({
      name: 'Test Model Tenant 2',
      description: 'Test model for tenant 2',
      tenantId: this.tenant2!.id,
      status: 'active',
      modelType: 'classification',
    }).returning();
    this.testData2.modelId = model2[0].id;

    console.log('✅ Test data created for both tenants');
  }

  async testTenantIsolation(): Promise<boolean> {
    console.log('🔒 Testing tenant isolation...');
    let allTestsPassed = true;

    try {
      // Test 1: Each tenant should only see their own workflows
      const workflows1 = await this.db1.select().from(workflows);
      const workflows2 = await this.db2.select().from(workflows);

      console.log(`   Tenant 1 sees ${workflows1.length} workflows`);
      console.log(`   Tenant 2 sees ${workflows2.length} workflows`);

      if (workflows1.length !== 1 || workflows2.length !== 1) {
        console.error('❌ FAIL: Incorrect number of workflows visible to each tenant');
        allTestsPassed = false;
      } else if (workflows1[0].tenantId !== this.tenant1!.id || workflows2[0].tenantId !== this.tenant2!.id) {
        console.error('❌ FAIL: Tenants seeing workflows from wrong tenant');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Workflow isolation working correctly');
      }

      // Test 2: Each tenant should only see their own models
      const models1 = await this.db1.select().from(models);
      const models2 = await this.db2.select().from(models);

      console.log(`   Tenant 1 sees ${models1.length} models`);
      console.log(`   Tenant 2 sees ${models2.length} models`);

      if (models1.length !== 1 || models2.length !== 1) {
        console.error('❌ FAIL: Incorrect number of models visible to each tenant');
        allTestsPassed = false;
      } else if (models1[0].tenantId !== this.tenant1!.id || models2[0].tenantId !== this.tenant2!.id) {
        console.error('❌ FAIL: Tenants seeing models from wrong tenant');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Model isolation working correctly');
      }

      // Test 3: Try to access specific record from other tenant (should fail)
      try {
        const otherTenantWorkflow = await this.db1.select().from(workflows).where(eq(workflows.id, this.testData2.workflowId!));
        if (otherTenantWorkflow.length > 0) {
          console.error('❌ FAIL: Tenant 1 can access Tenant 2\'s workflow');
          allTestsPassed = false;
        } else {
          console.log('✅ PASS: Cross-tenant workflow access properly blocked');
        }
      } catch (error) {
        console.log('✅ PASS: Cross-tenant access blocked (expected error)');
      }

      // Test 4: Try to update record from other tenant (should fail)
      try {
        const updateResult = await this.db1.update(workflows)
          .set({ name: 'Hacked Workflow' })
          .where(eq(workflows.id, this.testData2.workflowId!));
        
        console.error('❌ FAIL: Tenant 1 was able to update Tenant 2\'s workflow');
        allTestsPassed = false;
      } catch (error) {
        console.log('✅ PASS: Cross-tenant update properly blocked');
      }

      // Test 5: Try to delete record from other tenant (should fail) 
      try {
        const deleteResult = await this.db1.delete(workflows)
          .where(eq(workflows.id, this.testData2.workflowId!));
        
        console.error('❌ FAIL: Tenant 1 was able to delete Tenant 2\'s workflow');
        allTestsPassed = false;
      } catch (error) {
        console.log('✅ PASS: Cross-tenant delete properly blocked');
      }

    } catch (error) {
      console.error('❌ Error during tenant isolation testing:', error);
      allTestsPassed = false;
    }

    return allTestsPassed;
  }

  async testTenantSwitching(): Promise<boolean> {
    console.log('🔄 Testing tenant context switching...');
    let allTestsPassed = true;

    try {
      // Switch tenant 1's context to tenant 2
      await this.setTenantContext(this.client1, this.tenant2!.id);

      // Now db1 should see tenant 2's data
      const workflows = await this.db1.select().from(workflows);
      const models = await this.db1.select().from(models);

      if (workflows.length !== 1 || workflows[0].tenantId !== this.tenant2!.id) {
        console.error('❌ FAIL: Tenant context switching failed for workflows');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Tenant context switching working for workflows');
      }

      if (models.length !== 1 || models[0].tenantId !== this.tenant2!.id) {
        console.error('❌ FAIL: Tenant context switching failed for models');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Tenant context switching working for models');
      }

      // Switch back to original tenant
      await this.setTenantContext(this.client1, this.tenant1!.id);

    } catch (error) {
      console.error('❌ Error during tenant switching test:', error);
      allTestsPassed = false;
    }

    return allTestsPassed;
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
      // Clear tenant contexts to allow cleanup
      await this.client1`SELECT clear_tenant_context()`;
      await this.client2`SELECT clear_tenant_context()`;

      // Delete test data (using raw SQL to bypass RLS)
      if (this.testData1.workflowId) {
        await this.client1`DELETE FROM workflows WHERE id = ${this.testData1.workflowId}`;
      }
      if (this.testData1.modelId) {
        await this.client1`DELETE FROM models WHERE id = ${this.testData1.modelId}`;
      }
      if (this.testData2.workflowId) {
        await this.client1`DELETE FROM workflows WHERE id = ${this.testData2.workflowId}`;
      }
      if (this.testData2.modelId) {
        await this.client1`DELETE FROM models WHERE id = ${this.testData2.modelId}`;
      }

      // Delete test tenants
      if (this.tenant1) {
        await this.client1`DELETE FROM tenants WHERE id = ${this.tenant1.id}`;
      }
      if (this.tenant2) {
        await this.client1`DELETE FROM tenants WHERE id = ${this.tenant2.id}`;
      }

      console.log('✅ Cleanup completed');

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    } finally {
      await this.client1.end();
      await this.client2.end();
    }
  }

  async runAllTests(): Promise<boolean> {
    console.log('🚀 Starting RLS Policy Tests...\n');

    let allTestsPassed = true;

    try {
      await this.setup();
      
      const isolationPassed = await this.testTenantIsolation();
      const switchingPassed = await this.testTenantSwitching();

      allTestsPassed = isolationPassed && switchingPassed;

      if (allTestsPassed) {
        console.log('\n✅ All RLS tests passed! Multi-tenant isolation is working correctly.');
      } else {
        console.log('\n❌ Some RLS tests failed! Please review the security policies.');
      }

    } catch (error) {
      console.error('\n❌ RLS testing failed with error:', error);
      allTestsPassed = false;
    } finally {
      await this.cleanup();
    }

    return allTestsPassed;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testRunner = new RLSTestRunner();
  testRunner.runAllTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { RLSTestRunner }; 