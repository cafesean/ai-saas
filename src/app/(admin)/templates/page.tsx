import { Suspense } from 'react';
import { TemplateList } from './_components/template-list';
// import { PageHeader } from '@/components/page-header';
import { metadata } from './metadata';

export { metadata };

const TemplatesPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* <PageHeader
        title="Templates"
        description="Manage n8n workflow templates and their configurations."
      /> */}
      
      <Suspense fallback={<div>Loading...</div>}>
        <TemplateList />
      </Suspense>
    </div>
  );
};

export default TemplatesPage; 