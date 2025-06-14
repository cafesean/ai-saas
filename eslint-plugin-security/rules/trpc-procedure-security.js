/**
 * ESLint Rule: tRPC Procedure Security
 * Ensures all tRPC procedures (except publicProcedure) include permission checks
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce permission checks on tRPC procedures',
      category: 'Security',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingPermissionCheck: 'tRPC procedure "{{procedureName}}" must include .use(hasPermission(...)) or .use(withPermission(...)) call for security',
      protectedProcedureWithoutPermission: 'protectedProcedure "{{procedureName}}" should use hasPermission() or withPermission() middleware',
    },
  },

  create(context) {
    return {
      // Look for object properties that define tRPC procedures
      Property(node) {
        // Skip if not in a tRPC router file
        const filename = context.getFilename();
        if (!filename.includes('server/api/routers/') && !filename.includes('server\\api\\routers\\')) {
          return;
        }

        // Check if this is a procedure definition
        if (!isProcedureDefinition(node)) {
          return;
        }

        const procedureName = node.key.name || node.key.value;
        const procedureChain = node.value;

        // Skip publicProcedure - it's allowed without permission checks
        if (isPublicProcedure(procedureChain)) {
          return;
        }

        // Check if procedure has permission middleware
        if (!hasPermissionMiddleware(procedureChain)) {
          context.report({
            node: node.key,
            messageId: 'missingPermissionCheck',
            data: {
              procedureName,
            },
          });
        }
      },
    };
  },
};

/**
 * Check if node represents a tRPC procedure definition
 */
function isProcedureDefinition(node) {
  if (node.type !== 'Property') return false;
  if (!node.value) return false;

  // Look for method chains that include procedure calls
  return hasProcedureCall(node.value);
}

/**
 * Check if the value contains a procedure call (query, mutation, subscription)
 */
function hasProcedureCall(node) {
  if (node.type === 'CallExpression') {
    // Check for .query(), .mutation(), .subscription()
    if (node.callee && node.callee.type === 'MemberExpression') {
      const methodName = node.callee.property.name;
      return ['query', 'mutation', 'subscription'].includes(methodName);
    }
  }

  // Check method chains
  if (node.type === 'MemberExpression') {
    return hasProcedureCall(node.object);
  }

  return false;
}

/**
 * Check if procedure chain starts with publicProcedure
 */
function isPublicProcedure(node) {
  if (node.type === 'MemberExpression') {
    return isPublicProcedure(node.object);
  }

  if (node.type === 'CallExpression' && node.callee) {
    return isPublicProcedure(node.callee);
  }

  if (node.type === 'Identifier') {
    return node.name === 'publicProcedure';
  }

  return false;
}

/**
 * Check if procedure chain includes permission middleware
 */
function hasPermissionMiddleware(node) {
  return hasUseCall(node, ['hasPermission', 'withPermission']) || 
         hasProtectedProcedureWithPermission(node);
}

/**
 * Check for .use() calls with permission middleware
 */
function hasUseCall(node, middlewareNames) {
  if (node.type === 'CallExpression') {
    // Check if this is a .use() call
    if (node.callee && 
        node.callee.type === 'MemberExpression' && 
        node.callee.property.name === 'use') {
      
      // Check if the argument is a permission middleware
      const arg = node.arguments[0];
      if (arg && arg.type === 'CallExpression' && arg.callee) {
        const middlewareName = arg.callee.name;
        return middlewareNames.includes(middlewareName);
      }
    }

    // Recursively check the callee
    if (node.callee) {
      return hasUseCall(node.callee, middlewareNames);
    }
  }

  if (node.type === 'MemberExpression') {
    return hasUseCall(node.object, middlewareNames);
  }

  return false;
}

/**
 * Check if using protectedProcedure with permission middleware
 */
function hasProtectedProcedureWithPermission(node) {
  // This is a simplified check - in practice, protectedProcedure should also use permission middleware
  // for fine-grained access control beyond just authentication
  return false;
} 