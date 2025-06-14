/**
 * Custom ESLint Plugin for API Security Rules
 * Prevents developers from creating unprotected API endpoints
 */

const trpcProcedureSecurityRule = require('./rules/trpc-procedure-security.js');
const apiRouteSecurityRule = require('./rules/api-route-security.js');

module.exports = {
  meta: {
    name: 'eslint-plugin-security',
    version: '1.0.0',
  },
  rules: {
    'trpc-procedure-security': trpcProcedureSecurityRule,
    'api-route-security': apiRouteSecurityRule,
  },
  configs: {
    recommended: {
      plugins: ['security'],
      rules: {
        'security/trpc-procedure-security': 'error',
        'security/api-route-security': 'error',
      },
    },
  },
}; 