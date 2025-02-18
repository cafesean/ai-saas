import { Suspense } from 'react';
import { NodeTypeList } from './_components/node-type-list';
// import { PageHeader } from '@/components/page-header';
import { metadata } from './metadata';

export { metadata };

const TemplateSettingsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* <PageHeader
        title="Template Settings"
        description="Configure node types and their input requirements for n8n workflow templates."
      /> */}
      
      <Suspense fallback={<div>Loading...</div>}>
        <NodeTypeList />
      </Suspense>
    </div>
  );
};

export default TemplateSettingsPage; 