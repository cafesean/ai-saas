export const N8N_API = {
  getWorkflowById: (id: string) => ({
    uri: `api/v1/workflows/${id}`,
    method: "GET",
  }),
  createWorkflow: () => ({
    uri: `api/v1/workflows`,
    method: "POST",
  }),
  activeWorkflow: (id: string) => ({
    uri: `api/v1/workflows/${id}/activate`,
    method: "POST",
  }),
  updateWorkflow: (id: string) => ({
    uri: `api/v1/workflows/${id}`,
    method: "PUT",
  }),
  deleteWorkflow: (id: string) => ({
    uri: `api/v1/workflows/${id}`,
    method: "DELETE",
  }),
};

export const Google_API = {
  getFiles: '/api/google/files',
  downloadFile: '/api/google/download',
};

export const S3_API = {
  upload: '/api/upload',
};
