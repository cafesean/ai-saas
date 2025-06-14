-- Row-Level Security (RLS) Policies for Multi-Tenant Data Isolation
-- This script enables RLS on all tenant-scoped tables and creates policies
-- to ensure users can only access data within their active tenant.

-- Enable RLS on all tenant-scoped tables
ALTER TABLE decision_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for decision_tables
CREATE POLICY "tenant_isolation_decision_tables" ON decision_tables
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::integer);

-- Create RLS policies for knowledge_bases
CREATE POLICY "tenant_isolation_knowledge_bases" ON knowledge_bases
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::integer);

-- Create RLS policies for models
CREATE POLICY "tenant_isolation_models" ON models
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::integer);

-- Create RLS policies for rules
CREATE POLICY "tenant_isolation_rules" ON rules
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::integer);

-- Create RLS policies for workflows
CREATE POLICY "tenant_isolation_workflows" ON workflows
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::integer);

-- Helper function to set the tenant context for the current session
-- This should be called at the beginning of each database session with the user's active tenant ID
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id_param integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.tenant_id', tenant_id_param::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS integer AS $$
BEGIN
    RETURN current_setting('app.tenant_id', true)::integer;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to clear tenant context (for admin operations)
CREATE OR REPLACE FUNCTION clear_tenant_context()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.tenant_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin users to bypass RLS when needed
-- (This should only be accessible to system administrators)
CREATE OR REPLACE VIEW admin_decision_tables AS
SELECT * FROM decision_tables;

CREATE OR REPLACE VIEW admin_knowledge_bases AS
SELECT * FROM knowledge_bases;

CREATE OR REPLACE VIEW admin_models AS
SELECT * FROM models;

CREATE OR REPLACE VIEW admin_rules AS
SELECT * FROM rules;

CREATE OR REPLACE VIEW admin_workflows AS
SELECT * FROM workflows;

-- Grant access to admin views only to admin roles
-- GRANT SELECT ON admin_decision_tables TO admin_role;
-- GRANT SELECT ON admin_knowledge_bases TO admin_role;
-- GRANT SELECT ON admin_models TO admin_role;
-- GRANT SELECT ON admin_rules TO admin_role;
-- GRANT SELECT ON admin_workflows TO admin_role;

-- Create audit table for RLS policy violations (for testing and monitoring)
CREATE TABLE rls_audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    attempted_tenant_id INTEGER,
    actual_tenant_id INTEGER,
    user_id INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB
);

-- Create indexes on RLS audit log
CREATE INDEX idx_rls_audit_log_timestamp ON rls_audit_log(timestamp);
CREATE INDEX idx_rls_audit_log_table_name ON rls_audit_log(table_name);
CREATE INDEX idx_rls_audit_log_user_id ON rls_audit_log(user_id); 