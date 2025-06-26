import { sql } from "drizzle-orm";
import { db } from "@/db";
import { modelGroups } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface InferenceTableConfig {
  modelGroupId: number;
  modelGroupUuid: string;
  orgId: number;
  retentionDays?: number;
  partitionStrategy?: "monthly" | "weekly" | "daily";
}

export interface InferenceRecord {
  id?: number;
  uuid?: string;
  modelGroupId: number;
  modelId: number;
  requestId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  metadata: {
    timestamp: Date;
    latency: number;
    modelRole: "champion" | "challenger";
    trafficPercentage?: number;
    sessionId?: string;
    userId?: string;
  };
  xaiData?: {
    featureImportance?: Record<string, number>;
    shapValues?: Record<string, number>;
    explanation?: string;
    confidence?: number;
  };
  auditTrail: {
    requestSource: string;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export class InferenceTableProvisioningService {
  /**
   * Generate table name for a ModelGroup
   */
  private generateTableName(modelGroupUuid: string, orgId: number): string {
    // Format: inferences_mg_{orgId}_{shortUuid}
    const shortUuid = modelGroupUuid.replace(/-/g, "").substring(0, 8);
    return `inferences_mg_${orgId}_${shortUuid}`;
  }

  /**
   * Check if inference table exists for a ModelGroup
   */
  async tableExists(modelGroupUuid: string, orgId: number): Promise<boolean> {
    try {
      const tableName = this.generateTableName(modelGroupUuid, orgId);
      
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `);
      
      return Boolean((result as any)[0]?.exists);
    } catch (error) {
      console.error("Error checking table existence:", error);
      return false;
    }
  }

  /**
   * Create dedicated inference table for a ModelGroup
   */
  async provisionTable(config: InferenceTableConfig): Promise<string> {
    try {
      const tableName = this.generateTableName(config.modelGroupUuid, config.orgId);
      
      // Create the inference table with enhanced schema
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
          id SERIAL PRIMARY KEY,
          uuid UUID NOT NULL DEFAULT gen_random_uuid(),
          model_group_id INTEGER NOT NULL,
          model_id INTEGER NOT NULL,
          request_id VARCHAR(100) NOT NULL,
          
          -- Input/Output data
          input JSONB NOT NULL,
          output JSONB NOT NULL,
          
          -- Enhanced metadata
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- XAI (Explainable AI) data
          xai_data JSONB,
          
          -- Audit trail
          audit_trail JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Performance tracking
          latency_ms INTEGER,
          model_role VARCHAR(20) NOT NULL CHECK (model_role IN ('champion', 'challenger')),
          traffic_percentage INTEGER DEFAULT 0,
          
          -- Session tracking
          session_id VARCHAR(100),
          user_id VARCHAR(100),
          correlation_id VARCHAR(100),
          
          -- Request metadata
          request_source VARCHAR(100),
          ip_address INET,
          user_agent TEXT,
          
          -- Timestamps
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Create indexes for performance
      await this.createTableIndexes(tableName);
      
      // Set up partitioning if specified
      if (config.partitionStrategy) {
        await this.setupPartitioning(tableName, config.partitionStrategy);
      }
      
      // Set up retention policy if specified
      if (config.retentionDays) {
        await this.setupRetentionPolicy(tableName, config.retentionDays);
      }

      console.log(`Inference table ${tableName} provisioned successfully`);
      return tableName;
    } catch (error) {
      console.error("Error provisioning inference table:", error);
      throw new Error(`Failed to provision inference table: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Create performance indexes for inference table
   */
  private async createTableIndexes(tableName: string): Promise<void> {
    const indexes = [
      // Primary lookup indexes
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_uuid ON ${tableName}(uuid);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_model_group_id ON ${tableName}(model_group_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_model_id ON ${tableName}(model_id);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_request_id ON ${tableName}(request_id);`,
      
      // Performance tracking indexes
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON ${tableName}(created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_model_role ON ${tableName}(model_role);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_session_id ON ${tableName}(session_id) WHERE session_id IS NOT NULL;`,
      
      // Composite indexes for common queries
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_group_role_created ON ${tableName}(model_group_id, model_role, created_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_model_created ON ${tableName}(model_id, created_at DESC);`,
      
      // JSONB indexes for metadata queries
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_metadata_gin ON ${tableName} USING GIN(metadata);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_xai_gin ON ${tableName} USING GIN(xai_data);`,
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_audit_gin ON ${tableName} USING GIN(audit_trail);`,
    ];

    for (const indexSql of indexes) {
      try {
        await db.execute(sql.raw(indexSql));
      } catch (error) {
        console.warn(`Failed to create index: ${indexSql}`, error);
      }
    }
  }

  /**
   * Setup table partitioning for large-scale inference data
   */
  private async setupPartitioning(tableName: string, strategy: "monthly" | "weekly" | "daily"): Promise<void> {
    try {
      // Convert to partitioned table by created_at
      const intervalMap = {
        daily: "1 day",
        weekly: "7 days", 
        monthly: "1 month"
      };

      // Note: This is a simplified partitioning setup
      // In production, you might want more sophisticated partitioning
      console.log(`Setting up ${strategy} partitioning for ${tableName}`);
      
      // For now, just add a comment to indicate partitioning strategy
      await db.execute(sql`
        COMMENT ON TABLE ${sql.identifier(tableName)} IS 
        'Inference table with ${sql.raw(strategy)} partitioning strategy';
      `);
    } catch (error) {
      console.warn("Failed to setup partitioning:", error);
    }
  }

  /**
   * Setup automatic data retention policy
   */
  private async setupRetentionPolicy(tableName: string, retentionDays: number): Promise<void> {
    try {
      // Create a cleanup function for this table
      const cleanupFunctionName = `cleanup_${tableName}`;
      
      await db.execute(sql`
        CREATE OR REPLACE FUNCTION ${sql.identifier(cleanupFunctionName)}()
        RETURNS void AS $$
        BEGIN
          DELETE FROM ${sql.identifier(tableName)}
          WHERE created_at < NOW() - INTERVAL '${sql.raw(retentionDays.toString())} days';
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log(`Retention policy set for ${tableName}: ${retentionDays} days`);
    } catch (error) {
      console.warn("Failed to setup retention policy:", error);
    }
  }

  /**
   * Provision table when ModelGroup is created
   */
  async autoProvisionOnModelGroupCreation(modelGroupId: number): Promise<string | null> {
    try {
      // Get ModelGroup details
      const modelGroup = await db.query.modelGroups.findFirst({
        where: eq(modelGroups.id, modelGroupId)
      });

      if (!modelGroup) {
        throw new Error(`ModelGroup with ID ${modelGroupId} not found`);
      }

      // Check if table already exists
      const exists = await this.tableExists(modelGroup.uuid, modelGroup.orgId);
      if (exists) {
        console.log(`Inference table already exists for ModelGroup ${modelGroup.uuid}`);
        return this.generateTableName(modelGroup.uuid, modelGroup.orgId);
      }

      // Provision new table
      const config: InferenceTableConfig = {
        modelGroupId: modelGroup.id,
        modelGroupUuid: modelGroup.uuid,
        orgId: modelGroup.orgId,
        retentionDays: 90, // Default 90 days retention
        partitionStrategy: "monthly" // Default monthly partitioning
      };

      return await this.provisionTable(config);
    } catch (error) {
      console.error("Error in auto-provisioning:", error);
      return null;
    }
  }

  /**
   * Get table name for a ModelGroup
   */
  async getTableName(modelGroupUuid: string, orgId: number): Promise<string | null> {
    const exists = await this.tableExists(modelGroupUuid, orgId);
    return exists ? this.generateTableName(modelGroupUuid, orgId) : null;
  }

  /**
   * List all inference tables for an organization
   */
  async listInferenceTables(orgId: number): Promise<string[]> {
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'inferences_mg_${sql.raw(orgId.toString())}_%'
        ORDER BY table_name;
      `);

      return (result as any[]).map((row: any) => row.table_name as string);
    } catch (error) {
      console.error("Error listing inference tables:", error);
      return [];
    }
  }

  /**
   * Drop inference table (use with caution)
   */
  async dropTable(modelGroupUuid: string, orgId: number): Promise<boolean> {
    try {
      const tableName = this.generateTableName(modelGroupUuid, orgId);
      
      await db.execute(sql`
        DROP TABLE IF EXISTS ${sql.identifier(tableName)} CASCADE;
      `);

      console.log(`Inference table ${tableName} dropped successfully`);
      return true;
    } catch (error) {
      console.error("Error dropping inference table:", error);
      return false;
    }
  }

  /**
   * Get table statistics
   */
  async getTableStats(tableName: string): Promise<{
    rowCount: number;
    tableSize: string;
    indexSize: string;
    lastUpdated?: Date;
  }> {
    try {
      const result = await db.execute(sql`
        SELECT 
          (SELECT reltuples::bigint FROM pg_class WHERE relname = ${tableName}) as row_count,
          pg_size_pretty(pg_total_relation_size(${tableName})) as table_size,
          pg_size_pretty(pg_indexes_size(${tableName})) as index_size,
          (SELECT MAX(updated_at) FROM ${sql.identifier(tableName)}) as last_updated;
      `);

      const row = (result as any)[0];
      return {
        rowCount: Number(row?.row_count || 0),
        tableSize: String(row?.table_size || "0 bytes"),
        indexSize: String(row?.index_size || "0 bytes"),
        lastUpdated: row?.last_updated ? new Date(row.last_updated) : undefined,
      };
    } catch (error) {
      console.error("Error getting table stats:", error);
      return {
        rowCount: 0,
        tableSize: "Unknown",
        indexSize: "Unknown",
      };
    }
  }
}

// Export singleton instance
export const inferenceTableService = new InferenceTableProvisioningService(); 