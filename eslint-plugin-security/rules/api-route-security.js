/**
 * ESLint Rule: API Route Security
 * Ensures all API route handlers include authentication checks
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce authentication checks on API route handlers',
      category: 'Security',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingAuthCheck: 'API route handler "{{handlerName}}" must call getServerSessionOrThrow() or withApiAuth() for security',
      unprotectedApiRoute: 'API route in {{filename}} should include authentication checks',
    },
  },

  create(context) {
    return {
      // Look for exported functions in /app/api/ directories
      ExportNamedDeclaration(node) {
        const filename = context.getFilename();
        
        // Only check files in /app/api/ directories
        if (!isApiRouteFile(filename)) {
          return;
        }

        // Check if this is an HTTP method export (GET, POST, PUT, DELETE, etc.)
        if (node.declaration && node.declaration.type === 'FunctionDeclaration') {
          const functionName = node.declaration.id.name;
          
          if (isHttpMethod(functionName)) {
            // Check if the function body includes authentication
            if (!hasAuthenticationCheck(node.declaration)) {
              context.report({
                node: node.declaration.id,
                messageId: 'missingAuthCheck',
                data: {
                  handlerName: functionName,
                },
              });
            }
          }
        }
      },

      // Also check for variable declarations that export HTTP methods
      VariableDeclarator(node) {
        const filename = context.getFilename();
        
        if (!isApiRouteFile(filename)) {
          return;
        }

        // Check for const GET = async function() or const GET = () =>
        if (node.id && node.id.type === 'Identifier' && isHttpMethod(node.id.name)) {
          if (node.init && (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) {
            if (!hasAuthenticationCheck(node.init)) {
              context.report({
                node: node.id,
                messageId: 'missingAuthCheck',
                data: {
                  handlerName: node.id.name,
                },
              });
            }
          }
        }
      },
    };
  },
};

/**
 * Check if filename is an API route file
 */
function isApiRouteFile(filename) {
  return filename.includes('/app/api/') || 
         filename.includes('\\app\\api\\') ||
         filename.includes('/pages/api/') ||
         filename.includes('\\pages\\api\\');
}

/**
 * Check if function name is an HTTP method
 */
function isHttpMethod(name) {
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  return httpMethods.includes(name);
}

/**
 * Check if function includes authentication checks
 */
function hasAuthenticationCheck(functionNode) {
  if (!functionNode.body) return false;

  // For arrow functions, check if body is a block statement
  const body = functionNode.body.type === 'BlockStatement' 
    ? functionNode.body 
    : null;

  if (!body) return false;

  // Look for authentication function calls in the function body
  return hasAuthCall(body);
}

/**
 * Recursively search for authentication function calls
 */
function hasAuthCall(node) {
  if (!node) return false;

  // Check for direct function calls
  if (node.type === 'CallExpression') {
    if (isAuthFunction(node)) {
      return true;
    }
  }

  // Check for await expressions
  if (node.type === 'AwaitExpression' && node.argument) {
    if (node.argument.type === 'CallExpression' && isAuthFunction(node.argument)) {
      return true;
    }
  }

  // Check for variable declarations with auth calls
  if (node.type === 'VariableDeclaration') {
    for (const declarator of node.declarations) {
      if (declarator.init && hasAuthCall(declarator.init)) {
        return true;
      }
    }
  }

  // Recursively check child nodes
  if (node.body && Array.isArray(node.body)) {
    for (const statement of node.body) {
      if (hasAuthCall(statement)) {
        return true;
      }
    }
  }

  if (node.body && node.body.type === 'BlockStatement') {
    return hasAuthCall(node.body);
  }

  // Check expression statements
  if (node.type === 'ExpressionStatement') {
    return hasAuthCall(node.expression);
  }

  // Check other statement types that might contain auth calls
  if (node.type === 'IfStatement') {
    return hasAuthCall(node.test) || hasAuthCall(node.consequent) || hasAuthCall(node.alternate);
  }

  if (node.type === 'TryStatement') {
    return hasAuthCall(node.block) || hasAuthCall(node.handler) || hasAuthCall(node.finalizer);
  }

  return false;
}

/**
 * Check if a function call is an authentication function
 */
function isAuthFunction(callNode) {
  if (!callNode.callee) return false;

  // Direct function calls
  if (callNode.callee.type === 'Identifier') {
    const authFunctions = [
      'getServerSessionOrThrow',
      'getServerSession',
      'withApiAuth',
      'requireAuth',
      'checkAuth'
    ];
    return authFunctions.includes(callNode.callee.name);
  }

  // Method calls (e.g., auth.getSession())
  if (callNode.callee.type === 'MemberExpression') {
    const methodName = callNode.callee.property.name;
    const authMethods = [
      'getSession',
      'getServerSession',
      'requireAuth',
      'checkAuth'
    ];
    return authMethods.includes(methodName);
  }

  return false;
} 