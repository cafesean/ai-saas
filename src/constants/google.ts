export const pageSize = 50;

export const googleDocTypes: Record<string, { ext: string; type: string }> = {
  'application/vnd.google-apps.document': {
    ext: '.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  'application/vnd.google-apps.spreadsheet': {
    ext: '.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  'application/vnd.google-apps.presentation': {
    ext: '.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
};