/*
  Warnings:

  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_policy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level_rates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `level_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `org_user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ratecards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_policy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "group_policy" DROP CONSTRAINT "group_policy_group_id_fkey";

-- DropForeignKey
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_level_id_fkey";

-- DropForeignKey
ALTER TABLE "level_rates" DROP CONSTRAINT "level_rates_ratecard_id_fkey";

-- DropForeignKey
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_level_id_fkey";

-- DropForeignKey
ALTER TABLE "level_roles" DROP CONSTRAINT "level_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "org_user" DROP CONSTRAINT "org_user_org_id_fkey";

-- DropForeignKey
ALTER TABLE "org_user" DROP CONSTRAINT "org_user_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_level_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_pricing_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_roles" DROP CONSTRAINT "pricing_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "pricings" DROP CONSTRAINT "pricings_ratecard_id_fkey";

-- DropForeignKey
ALTER TABLE "role_policy" DROP CONSTRAINT "role_policy_role_id_fkey";

-- DropTable
DROP TABLE "group";

-- DropTable
DROP TABLE "group_policy";

-- DropTable
DROP TABLE "level_rates";

-- DropTable
DROP TABLE "level_roles";

-- DropTable
DROP TABLE "levels";

-- DropTable
DROP TABLE "org";

-- DropTable
DROP TABLE "org_user";

-- DropTable
DROP TABLE "pricing_roles";

-- DropTable
DROP TABLE "pricings";

-- DropTable
DROP TABLE "ratecards";

-- DropTable
DROP TABLE "role_policy";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "condition_groups" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_flow_id" INTEGER NOT NULL,
    "parent_group_id" INTEGER,
    "type" VARCHAR(200),
    "logical_operator" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condition_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "condition_group_id" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" VARCHAR(200),
    "data_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "kb_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_table_input_conditions" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dt_row_id" UUID NOT NULL,
    "dt_input_id" UUID NOT NULL,
    "condition" TEXT,
    "value" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_table_input_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_table_inputs" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dt_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "dataType" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_table_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_table_output_results" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dt_row_id" UUID NOT NULL,
    "dt_output_id" UUID NOT NULL,
    "result" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_table_output_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_table_outputs" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dt_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "dataType" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_table_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_table_rows" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dt_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_table_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_tables" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "status" VARCHAR(100) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edges" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source" VARCHAR(200) NOT NULL,
    "target" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workflow_id" UUID NOT NULL,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "source_handle" TEXT,
    "target_handle" TEXT,

    CONSTRAINT "edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endpoints" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_id" UUID NOT NULL,
    "uri" TEXT NOT NULL,
    "method" VARCHAR(100) NOT NULL DEFAULT 'POST',
    "payload" JSON,
    "status" VARCHAR(100) NOT NULL DEFAULT 'active',
    "flow_uri" TEXT NOT NULL,
    "flow_method" VARCHAR(100) NOT NULL DEFAULT 'POST',
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inferences" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id" INTEGER NOT NULL,
    "input" JSON,
    "output" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_documents" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kb_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT 'Processing',
    "size" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "chunkSize" VARCHAR(100) DEFAULT '1000',
    "chunk_overlap" VARCHAR(100) DEFAULT '200',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "vector_db" VARCHAR(300) NOT NULL,
    "embedding_model" VARCHAR(300) NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_metrics" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "model_id" INTEGER NOT NULL,
    "ks" VARCHAR(100),
    "auroc" VARCHAR(100),
    "gini" VARCHAR(100),
    "accuracy" VARCHAR(100),
    "precision" VARCHAR(100),
    "recall" VARCHAR(100),
    "f1" VARCHAR(100),
    "brier_score" VARCHAR(100),
    "log_loss" VARCHAR(100),
    "inference" JSON,
    "ks_chart" TEXT,
    "auroc_chart" TEXT,
    "gini_chart" TEXT,
    "accuracy_chart" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" VARCHAR(100) NOT NULL,
    "features" JSON,
    "outputs" JSON,
    "charts_data" JSON,
    "feature_analysis" JSON,
    "model_info_details" JSON,

    CONSTRAINT "model_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "file_name" VARCHAR(200) NOT NULL,
    "file_key" VARCHAR(200) NOT NULL,
    "metadata_file_name" VARCHAR(200),
    "metadata_file_key" VARCHAR(200),
    "define_inputs" JSON,
    "status" VARCHAR(100) NOT NULL DEFAULT 'inactive',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(100),
    "framework" VARCHAR(100),

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(256) NOT NULL,
    "category" VARCHAR(256) NOT NULL,
    "description" VARCHAR(1024),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(200),
    "position" JSON,
    "data" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workflow_id" UUID NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_flow_actions" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_flow_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_flow_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_flows" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" INTEGER NOT NULL,
    "type" VARCHAR(200),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "status" VARCHAR(100) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "flow_id" VARCHAR(256) NOT NULL,
    "provider" VARCHAR(256),
    "version_id" VARCHAR(256),
    "instance_id" VARCHAR(256),
    "user_inputs" JSON,
    "workflow_json" JSON,
    "status" VARCHAR(100) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "workflow_id" UUID NOT NULL,
    "status" VARCHAR(100) NOT NULL DEFAULT 'active',
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_run_history" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflow_id" UUID NOT NULL,
    "path" VARCHAR(200),
    "method" VARCHAR(100),
    "payload" JSON,
    "response" JSON,
    "status" VARCHAR(100) NOT NULL DEFAULT 'running',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_run_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "user_inputs" JSON,
    "workflow_json" JSON,
    "flow_id" VARCHAR(200),
    "status" VARCHAR(100) NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(100),

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "condition_groups_id_idx" ON "condition_groups"("id");

-- CreateIndex
CREATE INDEX "condition_groups_uuid_idx" ON "condition_groups"("uuid");

-- CreateIndex
CREATE INDEX "condition_id_idx" ON "conditions"("id");

-- CreateIndex
CREATE INDEX "condition_uuid_idx" ON "conditions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_messages_uuid_unique" ON "conversation_messages"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_uuid_unique" ON "conversations"("uuid");

-- CreateIndex
CREATE INDEX "conversations_id_idx" ON "conversations"("id");

-- CreateIndex
CREATE INDEX "conversations_uuid_idx" ON "conversations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_table_input_conditions_uuid_unique" ON "decision_table_input_conditions"("uuid");

-- CreateIndex
CREATE INDEX "dt_input_condition_id_idx" ON "decision_table_input_conditions"("id");

-- CreateIndex
CREATE INDEX "dt_input_condition_uuid_idx" ON "decision_table_input_conditions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_table_inputs_uuid_unique" ON "decision_table_inputs"("uuid");

-- CreateIndex
CREATE INDEX "dt_input_id_idx" ON "decision_table_inputs"("id");

-- CreateIndex
CREATE INDEX "dt_input_uuid_idx" ON "decision_table_inputs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_table_output_results_uuid_unique" ON "decision_table_output_results"("uuid");

-- CreateIndex
CREATE INDEX "dt_output_result_id_idx" ON "decision_table_output_results"("id");

-- CreateIndex
CREATE INDEX "dt_output_result_uuid_idx" ON "decision_table_output_results"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_table_outputs_uuid_unique" ON "decision_table_outputs"("uuid");

-- CreateIndex
CREATE INDEX "dt_output_id_idx" ON "decision_table_outputs"("id");

-- CreateIndex
CREATE INDEX "dt_output_uuid_idx" ON "decision_table_outputs"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_table_rows_uuid_unique" ON "decision_table_rows"("uuid");

-- CreateIndex
CREATE INDEX "dt_row_id_idx" ON "decision_table_rows"("id");

-- CreateIndex
CREATE INDEX "dt_row_uuid_idx" ON "decision_table_rows"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "decision_tables_uuid_unique" ON "decision_tables"("uuid");

-- CreateIndex
CREATE INDEX "dt_id_idx" ON "decision_tables"("id");

-- CreateIndex
CREATE INDEX "dt_uuid_idx" ON "decision_tables"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "edges_uuid_unique" ON "edges"("uuid");

-- CreateIndex
CREATE INDEX "edge_id_idx" ON "edges"("id");

-- CreateIndex
CREATE INDEX "edge_uuid_idx" ON "edges"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "endpoints_uuid_unique" ON "endpoints"("uuid");

-- CreateIndex
CREATE INDEX "endpoint_id_idx" ON "endpoints"("id");

-- CreateIndex
CREATE INDEX "endpoint_uuid_idx" ON "endpoints"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "inferences_uuid_unique" ON "inferences"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_documents_uuid_unique" ON "knowledge_base_documents"("uuid");

-- CreateIndex
CREATE INDEX "kb_document_id_idx" ON "knowledge_base_documents"("id");

-- CreateIndex
CREATE INDEX "kb_document_uuid_idx" ON "knowledge_base_documents"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_bases_uuid_unique" ON "knowledge_bases"("uuid");

-- CreateIndex
CREATE INDEX "knowledge_base_id_idx" ON "knowledge_bases"("id");

-- CreateIndex
CREATE INDEX "knowledge_base_uuid_idx" ON "knowledge_bases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "model_metrics_uuid_unique" ON "model_metrics"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "models_uuid_unique" ON "models"("uuid");

-- CreateIndex
CREATE INDEX "model_id_idx" ON "models"("id");

-- CreateIndex
CREATE INDEX "model_uuid_idx" ON "models"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "node_type_idx" ON "node_types"("type");

-- CreateIndex
CREATE INDEX "node_type_category_idx" ON "node_types"("category");

-- CreateIndex
CREATE INDEX "node_type_id_idx" ON "node_types"("id");

-- CreateIndex
CREATE INDEX "node_type_uuid_idx" ON "node_types"("id");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_uuid_unique" ON "nodes"("uuid");

-- CreateIndex
CREATE INDEX "node_id_idx" ON "nodes"("id");

-- CreateIndex
CREATE INDEX "node_uuid_idx" ON "nodes"("uuid");

-- CreateIndex
CREATE INDEX "rule_flow_action_id_idx" ON "rule_flow_actions"("id");

-- CreateIndex
CREATE INDEX "rule_flow_action_uuid_idx" ON "rule_flow_actions"("uuid");

-- CreateIndex
CREATE INDEX "rule_flow_id_idx" ON "rule_flows"("id");

-- CreateIndex
CREATE INDEX "rule_flow_uuid_idx" ON "rule_flows"("uuid");

-- CreateIndex
CREATE INDEX "rule_id_idx" ON "rules"("id");

-- CreateIndex
CREATE INDEX "rule_uuid_idx" ON "rules"("uuid");

-- CreateIndex
CREATE INDEX "template_id_idx" ON "templates"("id");

-- CreateIndex
CREATE INDEX "template_uuid_idx" ON "templates"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_workflow_id_unique" ON "widgets"("workflow_id");

-- CreateIndex
CREATE INDEX "widget_id_idx" ON "widgets"("id");

-- CreateIndex
CREATE INDEX "widget_uuid_idx" ON "widgets"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_run_history_uuid_unique" ON "workflow_run_history"("uuid");

-- CreateIndex
CREATE INDEX "workflow_run_history_id_idx" ON "workflow_run_history"("id");

-- CreateIndex
CREATE INDEX "workflow_run_history_uuid_idx" ON "workflow_run_history"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "workflows_uuid_unique" ON "workflows"("uuid");

-- CreateIndex
CREATE INDEX "workflow_id_idx" ON "workflows"("id");

-- CreateIndex
CREATE INDEX "workflow_uuid_idx" ON "workflows"("uuid");

-- AddForeignKey
ALTER TABLE "condition_groups" ADD CONSTRAINT "condition_groups_rule_flow_id_rule_flows_id_fk" FOREIGN KEY ("rule_flow_id") REFERENCES "rule_flows"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conditions" ADD CONSTRAINT "conditions_condition_group_id_condition_groups_id_fk" FOREIGN KEY ("condition_group_id") REFERENCES "condition_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_conversations_uuid_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_kb_id_knowledge_bases_uuid_fk" FOREIGN KEY ("kb_id") REFERENCES "knowledge_bases"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_input_conditions" ADD CONSTRAINT "dt_input_condition_dt_input_id_fkey" FOREIGN KEY ("dt_input_id") REFERENCES "decision_table_inputs"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_input_conditions" ADD CONSTRAINT "dt_input_condition_dt_row_id_fkey" FOREIGN KEY ("dt_row_id") REFERENCES "decision_table_rows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_inputs" ADD CONSTRAINT "decision_table_inputs_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "decision_tables"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_output_results" ADD CONSTRAINT "dt_output_result_dt_output_id_fkey" FOREIGN KEY ("dt_output_id") REFERENCES "decision_table_outputs"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_output_results" ADD CONSTRAINT "dt_output_result_dt_row_id_fkey" FOREIGN KEY ("dt_row_id") REFERENCES "decision_table_rows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_outputs" ADD CONSTRAINT "decision_table_outputs_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "decision_tables"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "decision_table_rows" ADD CONSTRAINT "decision_table_rows_dt_id_decision_tables_uuid_fk" FOREIGN KEY ("dt_id") REFERENCES "decision_tables"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inferences" ADD CONSTRAINT "inferences_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "knowledge_base_documents" ADD CONSTRAINT "knowledge_base_documents_kb_id_knowledge_bases_uuid_fk" FOREIGN KEY ("kb_id") REFERENCES "knowledge_bases"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "model_metrics" ADD CONSTRAINT "model_metrics_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rule_flow_actions" ADD CONSTRAINT "rule_flow_actions_rule_flow_id_rule_flows_id_fk" FOREIGN KEY ("rule_flow_id") REFERENCES "rule_flows"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rule_flows" ADD CONSTRAINT "rule_flows_rule_id_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workflow_run_history" ADD CONSTRAINT "workflow_run_history_workflow_id_workflows_uuid_fk" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
