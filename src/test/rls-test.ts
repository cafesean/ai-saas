import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env.mjs';
import { workflows, models, rules, decision_tables, knowledge_bases, orgs } from '../schema';
import { eq } from 'drizzle-orm';

/**
 * RLS Policy Testing Script
 * 
 * This script tests that Row-Level Security policies correctly isolate data between orgs.
 * It verifies that:
 * 1. Users can only see data from their active org
 * 2. Users cannot access data from other orgs
 * 3. RLS policies are properly enforced on all CRUD operations
 */

interface TestOrg {
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
  private org1: TestOrg | null = null;
  private org2: TestOrg | null = null;
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
      // Create test orgs
      const testOrgs = await this.db1.insert(orgs).values([
        {
          name: 'RLS Test Org A',
          description: 'Test org A for RLS validation',
          slug: 'rls-test-org-a',
          isActive: true,
        },
        {
          name: 'RLS Test Org B', 
          description: 'Test org B for RLS validation',
          slug: 'rls-test-org-b',
          isActive: true,
        }
      ]).returning();

      this.org1 = testOrgs[0] as TestOrg;
      this.org2 = testOrgs[1] as TestOrg;

      if (!this.org1 || !this.org2) {
        throw new Error('Failed to create test orgs');
      }

      console.log(`✅ Created test orgs: ${this.org1.name} (${this.org1.id}) and ${this.org2.name} (${this.org2.id})`);

      // Set org contexts for each connection
      await this.setOrgContext(this.client1, this.org1.id);
      await this.setOrgContext(this.client2, this.org2.id);

      // Create test data for each org
      await this.createTestData();

    } catch (error) {
      console.error('❌ Setup failed:', error);
      throw error;
    }
  }

  private async setOrgContext(client: postgres.Sql, orgId: number): Promise<void> {
    await client`SELECT set_org_context(${orgId})`;
  }

  private async createTestData(): Promise<void> {
    console.log('📝 Creating test data for each orgs...');

    // Create test data for org 1
    const workflow1 = await this.db1.insert(workflows).values({
      name: 'Test Workflow Org 1',
      description: 'Test workflow for org 1',
      orgId: this.org1!.id,
      status: 'active',
    }).returning();
    this.testData1.workflowId = workflow1[0].id;

    const model1 = await this.db1.insert(models).values({
      name: 'Test Model Org 1',
      description: 'Test model for org 1',
      orgId: this.org1!.id,
      status: 'active',
      modelType: 'classification',
    }).returning();
    this.testData1.modelId = model1[0].id;

    // Create test data for org 2
    const workflow2 = await this.db2.insert(workflows).values({
      name: 'Test Workflow Org 2',
      description: 'Test workflow for org 2',
      orgId: this.org2!.id,
      status: 'active',
    }).returning();
    this.testData2.workflowId = workflow2[0].id;

    const model2 = await this.db2.insert(models).values({
      name: 'Test Model Org 2',
      description: 'Test model for org 2',
      orgId: this.org2!.id,
      status: 'active',
      modelType: 'classification',
    }).returning();
    this.testData2.modelId = model2[0].id;

    console.log('✅ Test data created for both orgs');
  }

  async testOrgIsolation(): Promise<boolean> {
    console.log('🔒 Testing org isolation...');
    let allTestsPassed = true;

    try {
      // Test 1: Each org should only see their own workflows
      const workflows1 = await this.db1.select().from(workflows);
      const workflows2 = await this.db2.select().from(workflows);

      console.log(`   Org 1 sees ${workflows1.length} workflows`);
      console.log(`   Org 2 sees ${workflows2.length} workflows`);

      if (workflows1.length !== 1 || workflows2.length !== 1) {
        console.error('❌ FAIL: Incorrect number of workflows visible to each org');
        allTestsPassed = false;
      } else if (workflows1[0].orgId !== this.org1!.id || workflows2[0].orgId !== this.org2!.id) {
        console.error('❌ FAIL: Orgs seeing workflows from wrong org');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Workflow isolation working correctly');
      }

      // Test 2: Each org should only see their own models
      const models1 = await this.db1.select().from(models);
      const models2 = await this.db2.select().from(models);

      console.log(`   Org 1 sees ${models1.length} models`);
      console.log(`   Org 2 sees ${models2.length} models`);

      if (models1.length !== 1 || models2.length !== 1) {
        console.error('❌ FAIL: Incorrect number of models visible to each org');
        allTestsPassed = false;
      } else if (models1[0].orgId !== this.org1!.id || models2[0].orgId !== this.org2!.id) {
        console.error('❌ FAIL: Orgs seeing models from wrong org');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Model isolation working correctly');
      }

      // Test 3: Try to access specific record from other org (should fail)
      try {
        const otherOrgWorkflow = await this.db1.select().from(workflows).where(eq(workflows.id, this.testData2.workflowId!));
        if (otherOrgWorkflow.length > 0) {
          console.error('❌ FAIL: Org 1 can access Org 2\'s workflow');
          allTestsPassed = false;
        } else {
          console.log('✅ PASS: Cross-org workflow access properly blocked');
        }
      } catch (error) {
        console.log('✅ PASS: Cross-org access blocked (expected error)');
      }

      // Test 4: Try to update record from other org (should fail)
      try {
        const updateResult = await this.db1.update(workflows)
          .set({ name: 'Hacked Workflow' })
          .where(eq(workflows.id, this.testData2.workflowId!));
        
        console.error('❌ FAIL: Org 1 was able to update Org 2\'s workflow');
        allTestsPassed = false;
      } catch (error) {
        console.log('✅ PASS: Cross-org update properly blocked');
      }

      // Test 5: Try to delete record from other org (should fail) 
      try {
        const deleteResult = await this.db1.delete(workflows)
          .where(eq(workflows.id, this.testData2.workflowId!));
        
        console.error('❌ FAIL: Org 1 was able to delete Org 2\'s workflow');
        allTestsPassed = false;
      } catch (error) {
        console.log('✅ PASS: Cross-org delete properly blocked');
      }

    } catch (error) {
      console.error('❌ Error during org isolation testing:', error);
      allTestsPassed = false;
    }

    return allTestsPassed;
  }

  async testOrgSwitching(): Promise<boolean> {
    console.log('🔄 Testing org context switching...');
    let allTestsPassed = true;

    try {
      // Switch org 1's context to org 2
      await this.setOrgContext(this.client1, this.org2!.id);

      // Now db1 should see org 2's data
      const workflows = await this.db1.select().from(workflows);
      const models = await this.db1.select().from(models);

      if (workflows.length !== 1 || workflows[0].orgId !== this.org2!.id) {
        console.error('❌ FAIL: Org context switching failed for workflows');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Org context switching working for workflows');
      }

      if (models.length !== 1 || models[0].orgId !== this.org2!.id) {
        console.error('❌ FAIL: Org context switching failed for models');
        allTestsPassed = false;
      } else {
        console.log('✅ PASS: Org context switching working for models');
      }

      // Switch back to original org
      await this.setOrgContext(this.client1, this.org1!.id);

    } catch (error) {
      console.error('❌ Error during org switching test:', error);
      allTestsPassed = false;
    }

    return allTestsPassed;
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
      // Clear org contexts to allow cleanup
      await this.client1`SELECT clear_org_context()`;
      await this.client2`SELECT clear_org_context()`;

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

      // Delete test orgs
      if (this.org1) {
        await this.client1`DELETE FROM orgs WHERE id = ${this.org1.id}`;
      }
      if (this.org2) {
        await this.client1`DELETE FROM orgs WHERE id = ${this.org2.id}`;
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
      
      const isolationPassed = await this.testOrgIsolation();
      const switchingPassed = await this.testOrgSwitching();

      allTestsPassed = isolationPassed && switchingPassed;

      if (allTestsPassed) {
        console.log('\n✅ All RLS tests passed! Multi-org isolation is working correctly.');
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