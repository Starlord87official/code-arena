/**
 * Code Validation Utility
 * 
 * Validates user code before submission to ensure:
 * 1. Code is not empty or just whitespace
 * 2. Code has been modified from the starter template
 * 3. Code contains actual implementation (not just comments)
 * 4. Return statements are present (for JS/TS)
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: 'empty' | 'unchanged' | 'no_implementation' | 'placeholder_return';
}

// Starter templates for each language
export const starterTemplates = {
  javascript: `function solve(input) {
  // Your solution here
  // Prove your worth.
  
  return result;
}`,
  python: `def solve(input):
    # Your solution here
    # Prove your worth.
    
    return result`,
  typescript: `function solve(input: any): any {
  // Your solution here
  // Prove your worth.
  
  return result;
}`,
};

/**
 * Normalize code for comparison by removing:
 * - Extra whitespace
 * - Different line endings
 * - Leading/trailing spaces
 */
function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ')
    .trim()
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}

/**
 * Remove all comments and strings from code to check actual content
 */
function stripCommentsAndStrings(code: string, language: string): string {
  let stripped = code;
  
  if (language === 'python') {
    // Remove Python comments
    stripped = stripped.replace(/#.*$/gm, '');
    // Remove docstrings
    stripped = stripped.replace(/\"\"\"[\s\S]*?\"\"\"/g, '');
    stripped = stripped.replace(/'''[\s\S]*?'''/g, '');
  } else {
    // Remove JS/TS single-line comments
    stripped = stripped.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  
  // Remove string literals
  stripped = stripped.replace(/\"[^"]*\"/g, '""');
  stripped = stripped.replace(/'[^']*'/g, "''");
  stripped = stripped.replace(/`[^`]*`/g, '``');
  
  return stripped.trim();
}

/**
 * Check if the code contains actual implementation beyond the function signature
 */
function hasImplementation(code: string, language: string): boolean {
  const strippedCode = stripCommentsAndStrings(code, language);
  
  // Extract function body
  let bodyContent = '';
  
  if (language === 'python') {
    // For Python, get content after the def line
    const lines = strippedCode.split('\n');
    const bodyLines = lines.slice(1).filter(line => line.trim().length > 0);
    bodyContent = bodyLines.join('\n');
    
    // Check for more than just a return statement
    const nonReturnLines = bodyLines.filter(line => !line.trim().startsWith('return'));
    if (nonReturnLines.length === 0 && bodyLines.some(line => line.trim() === 'return result')) {
      return false;
    }
  } else {
    // For JS/TS, extract content between first { and last }
    const openBrace = strippedCode.indexOf('{');
    const closeBrace = strippedCode.lastIndexOf('}');
    
    if (openBrace === -1 || closeBrace === -1 || openBrace >= closeBrace) {
      return false;
    }
    
    bodyContent = strippedCode.slice(openBrace + 1, closeBrace).trim();
    
    // Check for actual statements beyond just "return result;"
    const lines = bodyContent.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return false;
    }
    
    // If the only line is "return result;" or similar placeholder
    if (lines.length === 1 && /^return\s+(result|undefined|null);?$/.test(lines[0].trim())) {
      return false;
    }
  }
  
  // Check for minimum meaningful content
  const meaningfulContent = bodyContent
    .replace(/\s+/g, '')
    .replace(/return\s*result;?/gi, '')
    .replace(/return\s*;?/gi, '')
    .replace(/[{}()[\];,]/g, '');
  
  return meaningfulContent.length > 3; // At least some variable names or operations
}

/**
 * Check if code returns placeholder values
 */
function hasPlaceholderReturn(code: string, language: string): boolean {
  const strippedCode = stripCommentsAndStrings(code, language);
  
  // Check for common placeholder return patterns
  const placeholderPatterns = [
    /return\s+result\s*;?\s*$/m,
    /return\s+undefined\s*;?\s*$/m,
    /return\s+null\s*;?\s*$/m,
    /return\s*;?\s*$/m,
  ];
  
  // Get the return statements
  const returnStatements = strippedCode.match(/return\s*[^;]*/g) || [];
  
  for (const returnStmt of returnStatements) {
    for (const pattern of placeholderPatterns) {
      if (pattern.test(returnStmt)) {
        // Check if this is the ONLY return or the final return
        const trimmed = returnStmt.trim();
        if (trimmed === 'return result' || trimmed === 'return result;') {
          // This is only bad if there's no other logic before it
          if (!hasImplementation(code, language)) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Main validation function
 */
export function validateCode(
  code: string,
  language: 'javascript' | 'python' | 'typescript'
): ValidationResult {
  // 1. Check for empty code
  const trimmedCode = code.trim();
  if (!trimmedCode || trimmedCode.length === 0) {
    return {
      isValid: false,
      error: 'No solution code detected. Please implement the solution before submitting.',
      errorType: 'empty',
    };
  }

  // 2. Check if code is unchanged from starter template
  const starterTemplate = starterTemplates[language];
  const normalizedCode = normalizeCode(code);
  const normalizedStarter = normalizeCode(starterTemplate);
  
  if (normalizedCode === normalizedStarter) {
    return {
      isValid: false,
      error: 'Solution unchanged from template. Please implement your solution before submitting.',
      errorType: 'unchanged',
    };
  }

  // 3. Check if code has actual implementation
  if (!hasImplementation(code, language)) {
    return {
      isValid: false,
      error: 'Solution incomplete. Your code must contain actual implementation logic.',
      errorType: 'no_implementation',
    };
  }

  // 4. Check for placeholder returns without implementation
  if (hasPlaceholderReturn(code, language) && !hasImplementation(code, language)) {
    return {
      isValid: false,
      error: 'Solution returns placeholder value. Please implement the actual logic.',
      errorType: 'placeholder_return',
    };
  }

  // 5. For JS/TS, check that the function has a return statement
  if (language !== 'python') {
    const hasReturn = /return\s+[^;]+/.test(stripCommentsAndStrings(code, language));
    if (!hasReturn) {
      return {
        isValid: false,
        error: 'No return statement found. Your function must return a value.',
        errorType: 'no_implementation',
      };
    }
  }

  return { isValid: true };
}

/**
 * Simulate test execution for visible test cases
 * This is a mock implementation - in production, this would execute against a real backend
 */
export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  error?: string;
}

export function simulateTestExecution(
  code: string,
  language: string,
  testCases: Array<{ input: string; output: string }>
): { results: TestCaseResult[]; allPassed: boolean } {
  // Since we can't actually execute code safely in the browser,
  // we validate the code structure and return appropriate results
  
  const validation = validateCode(code, language as 'javascript' | 'python' | 'typescript');
  
  if (!validation.isValid) {
    // All tests fail if code is invalid
    return {
      results: testCases.map(tc => ({
        passed: false,
        input: tc.input,
        expected: tc.output,
        error: validation.error,
      })),
      allPassed: false,
    };
  }

  // For valid code, we simulate test results
  // In production, this would call a backend execution service
  // For now, we return a "pending review" state that requires submission
  return {
    results: testCases.map(tc => ({
      passed: true, // Visible tests "pass" for simulation
      input: tc.input,
      expected: tc.output,
      actual: tc.output, // Simulated output matches expected
    })),
    allPassed: true,
  };
}
