/**
 * AI Service - Simulated AI responses for code analysis
 * Provides dynamic, realistic responses based on input code analysis
 */

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Call the Gemini API to get actual AI-generated content in JSON format
 * @param {string} prompt - Prompt string
 * @param {string} systemInstruction - Optional system instructions
 * @returns {Promise<Object|null>} Parsed JSON response or null
 */
async function callGemini(prompt, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
  if (!apiKey) {
    console.log('[AI Service] No Gemini API Key found in process.env');
    return null;
  }
  const masked = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`[AI Service] Making Gemini API request with key: ${masked} (length: ${apiKey.length})`);


  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
        ...(systemInstruction ? {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          }
        } : {})
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API request failed:', errText);
      return null;
    }
    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return null;
    
    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '');
    }
    return JSON.parse(cleanText);

  } catch (error) {
    console.error('Error in callGemini:', error);
    return null;
  }
}


/**
 * Generate a seeded pseudo-random number based on a string
 * @param {string} str - Input string seed
 * @returns {number} Number between 0 and 1
 */
function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Pick a random item from an array using a seed
 * @param {Array} arr - Array to pick from
 * @param {number} seed - Seed value
 * @returns {*} Selected item
 */
function seededPick(arr, seed) {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

/**
 * Count occurrences of a pattern in code
 * @param {string} code - Source code
 * @param {RegExp} pattern - Pattern to count
 * @returns {number} Count of matches
 */
function countPattern(code, pattern) {
  const matches = code.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Detect code patterns for analysis
 * @param {string} code - Source code
 * @returns {Object} Detected patterns
 */
function detectPatterns(code) {
  const lines = code.split('\n');
  const lineCount = lines.length;

  const forLoops = countPattern(code, /\bfor\s*\(/g);
  const whileLoops = countPattern(code, /\bwhile\s*\(/g);
  const totalLoops = forLoops + whileLoops;

  const functions = countPattern(code, /\bfunction\s+\w+/g);
  const arrowFunctions = countPattern(code, /=>\s*[{(]/g);
  const totalFunctions = functions + arrowFunctions;

  const variables = countPattern(code, /\b(let|const|var)\s+/g);
  const shortVarNames = countPattern(code, /\b(let|const|var)\s+[a-z]{1,2}\b/g);

  const tryCatch = countPattern(code, /\btry\s*{/g);
  const ifStatements = countPattern(code, /\bif\s*\(/g);
  const returnStatements = countPattern(code, /\breturn\b/g);

  const comments = countPattern(code, /\/\/|\/\*|\*\//g);
  const consoleLog = countPattern(code, /console\.(log|warn|error|info)/g);

  const asyncAwait = countPattern(code, /\basync\b/g);
  const promises = countPattern(code, /\bPromise\b|\.then\(|\.catch\(/g);
  const callbacks = countPattern(code, /\bcallback\b|\bcb\b/g);

  const imports = countPattern(code, /\b(import|require)\b/g);
  const exports = countPattern(code, /\b(export|module\.exports)\b/g);

  const classes = countPattern(code, /\bclass\s+\w+/g);
  const thisKeyword = countPattern(code, /\bthis\./g);

  const evalUsage = countPattern(code, /\beval\s*\(/g);
  const innerHTMLUsage = countPattern(code, /\.innerHTML\s*=/g);
  const sqlLike = countPattern(code, /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/gi);

  // Detect nested loops
  let nestedLoopCount = 0;
  const nestedLoopLocations = [];
  let loopDepth = 0;
  lines.forEach((line, idx) => {
    if (/\bfor\s*\(/.test(line) || /\bwhile\s*\(/.test(line)) {
      loopDepth++;
      if (loopDepth >= 2) {
        nestedLoopCount++;
        nestedLoopLocations.push({ line: idx + 1, depth: loopDepth });
      }
    }
    if (/^\s*}/.test(line) && loopDepth > 0) {
      loopDepth = Math.max(0, loopDepth - 1);
    }
  });

  // Detect recursive calls
  const functionNames = [];
  const funcMatches = code.matchAll(/\bfunction\s+(\w+)/g);
  for (const m of funcMatches) {
    functionNames.push(m[1]);
  }
  const arrowMatches = code.matchAll(/\b(const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_$]\w*)\s*=>/g);
  for (const m of arrowMatches) {
    functionNames.push(m[2]);
  }
  const recursiveFunctions = functionNames.filter((name) => {
    const callPattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
    const callCount = countPattern(code, callPattern);
    return callCount > 1; // declaration + at least one recursive call
  });

  return {
    lineCount,
    forLoops,
    whileLoops,
    totalLoops,
    functions,
    arrowFunctions,
    totalFunctions,
    variables,
    shortVarNames,
    tryCatch,
    ifStatements,
    returnStatements,
    comments,
    consoleLog,
    asyncAwait,
    promises,
    callbacks,
    imports,
    exports,
    classes,
    thisKeyword,
    evalUsage,
    innerHTMLUsage,
    sqlLike,
    nestedLoopCount,
    nestedLoopLocations,
    recursiveFunctions,
    functionNames,
  };
}

/**
 * Calculate dynamic scores based on code patterns
 * @param {Object} patterns - Detected patterns
 * @returns {Object} Score metrics
 */
function calculateScores(patterns) {
  const { lineCount, totalFunctions, tryCatch, comments, shortVarNames, totalLoops, nestedLoopCount, consoleLog, variables } = patterns;

  // Base scores
  let codeQuality = 75;
  let readability = 75;
  let maintainability = 72;

  // Code quality adjustments
  if (tryCatch > 0) codeQuality += 5;
  if (totalFunctions > 2) codeQuality += 5;
  if (nestedLoopCount > 0) codeQuality -= 5;
  if (consoleLog > 3) codeQuality -= 3;
  if (patterns.evalUsage > 0) codeQuality -= 10;
  if (patterns.asyncAwait > 0) codeQuality += 3;
  if (lineCount > 200) codeQuality -= 5;
  if (lineCount < 10) codeQuality -= 8;
  if (lineCount >= 20 && lineCount <= 100) codeQuality += 3;

  // Readability adjustments
  if (comments > 2) readability += 5;
  if (comments > 5) readability += 3;
  if (shortVarNames > 3) readability -= 8;
  if (shortVarNames > 0 && shortVarNames <= 3) readability -= 4;
  if (lineCount > 150 && totalFunctions < 3) readability -= 7;
  if (patterns.classes > 0) readability += 3;
  if (variables > 15) readability -= 3;

  // Maintainability adjustments
  if (totalFunctions > 3) maintainability += 6;
  if (lineCount > 200 && totalFunctions < 2) maintainability -= 10;
  if (patterns.imports > 0) maintainability += 3;
  if (patterns.exports > 0) maintainability += 3;
  if (nestedLoopCount > 1) maintainability -= 7;
  if (tryCatch > 0) maintainability += 4;
  if (comments > 3) maintainability += 4;

  // Clamp scores
  codeQuality = Math.max(45, Math.min(95, codeQuality));
  readability = Math.max(40, Math.min(95, readability));
  maintainability = Math.max(38, Math.min(92, maintainability));

  const overallRating = Math.round((codeQuality * 0.35 + readability * 0.30 + maintainability * 0.35));

  return { codeQuality, readability, maintainability, overallRating };
}

// ─── analyzeCode ────────────────────────────────────────────────────────────

/**
 * Analyze code and return review metrics with suggestions
 * @param {string} code - Source code to analyze
 * @param {string} language - Programming language
 * @returns {Object} Analysis results with scores and suggestions
 */
async function analyzeCode(code, language = 'javascript') {
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Analyze the following ${language} code and return a JSON object with the review. The JSON object must match this schema exactly:
{
  "codeQuality": number (0-100),
  "readability": number (0-100),
  "maintainability": number (0-100),
  "bestPractices": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error" }
  ],
  "namingSuggestions": [
    { "current": "string", "suggested": "string", "reason": "string" }
  ],
  "optimizationSuggestions": [
    { "title": "string", "description": "string", "impact": "low" | "medium" | "high" }
  ],
  "refactoringSuggestions": [
    { "title": "string", "description": "string", "codeSnippet": "string" }
  ],
  "securitySuggestions": [
    { "title": "string", "description": "string", "severity": "low" | "medium" | "high" | "critical" }
  ],
  "overallRating": number (0-100),
  "summary": "string summarizing your review"
}

Code:
${code}`;
    const result = await callGemini(prompt, "You are a professional code review assistant. Output valid JSON only, following the requested schema.");
    if (result) return result;
  }

  const patterns = detectPatterns(code);

  const scores = calculateScores(patterns);
  const seed = hashSeed(code);

  // --- Best Practices ---
  const bestPractices = [];

  if (patterns.tryCatch === 0 && patterns.totalFunctions > 0) {
    bestPractices.push({
      title: 'Add Error Handling',
      description: 'No try/catch blocks detected. Wrap async operations and potential failure points in try/catch blocks to prevent unhandled exceptions.',
      severity: 'error',
    });
  }
  if (patterns.consoleLog > 0) {
    bestPractices.push({
      title: 'Remove Console Statements',
      description: `Found ${patterns.consoleLog} console statement(s). Replace with a proper logging library like Winston or Pino for production environments.`,
      severity: 'warning',
    });
  }
  if (patterns.comments < 2 && patterns.lineCount > 20) {
    bestPractices.push({
      title: 'Add Code Documentation',
      description: 'The code lacks sufficient comments. Add JSDoc comments for functions, inline comments for complex logic, and a file-level description.',
      severity: 'info',
    });
  }
  if (patterns.evalUsage > 0) {
    bestPractices.push({
      title: 'Avoid eval()',
      description: 'Using eval() is a severe security risk and performance concern. Replace with safer alternatives like JSON.parse() or Function constructors.',
      severity: 'error',
    });
  }
  if (patterns.variables > 0 && countPattern(code, /\bvar\s+/g) > 0) {
    bestPractices.push({
      title: 'Use const/let Instead of var',
      description: 'Using var can lead to hoisting bugs and scope issues. Prefer const for immutable values and let for mutable ones.',
      severity: 'warning',
    });
  }
  if (bestPractices.length < 3) {
    bestPractices.push({
      title: 'Follow Single Responsibility Principle',
      description: 'Consider breaking down complex functions into smaller, focused functions that each handle a single task.',
      severity: 'info',
    });
  }
  if (patterns.asyncAwait > 0 && patterns.tryCatch === 0) {
    bestPractices.push({
      title: 'Handle Async Errors',
      description: 'Async/await code detected without error handling. Always wrap await calls in try/catch or use a global error handler.',
      severity: 'error',
    });
  }

  // --- Naming Suggestions ---
  const namingSuggestions = [];
  if (patterns.shortVarNames > 0) {
    const shortVarMatches = code.match(/\b(let|const|var)\s+([a-z]{1,2})\b/g) || [];
    const seen = new Set();
    for (const match of shortVarMatches) {
      const parts = match.split(/\s+/);
      const varName = parts[1];
      if (!seen.has(varName) && namingSuggestions.length < 4) {
        seen.add(varName);
        const suggestionMap = {
          x: 'coordinateX',
          y: 'coordinateY',
          i: 'index',
          j: 'innerIndex',
          k: 'counter',
          n: 'count',
          s: 'inputString',
          a: 'firstElement',
          b: 'secondElement',
          e: 'event',
          r: 'result',
          v: 'value',
          d: 'data',
          p: 'param',
          t: 'timestamp',
          m: 'message',
        };
        namingSuggestions.push({
          current: varName,
          suggested: suggestionMap[varName] || `descriptive${varName.toUpperCase()}Name`,
          reason: `Single-letter variable '${varName}' reduces code readability. Use a descriptive name that conveys the variable's purpose.`,
        });
      }
    }
  }
  if (namingSuggestions.length < 2) {
    namingSuggestions.push({
      current: 'data',
      suggested: 'responsePayload',
      reason: 'Generic names like "data" are ambiguous. Use names that describe what the data represents.',
    });
    namingSuggestions.push({
      current: 'temp',
      suggested: 'intermediateResult',
      reason: 'Temporary variable names should still be descriptive to aid debugging and readability.',
    });
  }

  // --- Optimization Suggestions ---
  const optimizationSuggestions = [];
  if (patterns.nestedLoopCount > 0) {
    optimizationSuggestions.push({
      title: 'Reduce Nested Loop Complexity',
      description: `Found ${patterns.nestedLoopCount} nested loop(s). Consider using hash maps, Set lookups, or array methods like .find()/.filter() to reduce time complexity from O(n²) to O(n).`,
      impact: 'high',
    });
  }
  if (patterns.totalLoops > 3) {
    optimizationSuggestions.push({
      title: 'Consolidate Iterations',
      description: `Found ${patterns.totalLoops} loop iterations. Consider combining multiple passes over the same data into a single loop using reduce() or a single for loop with multiple accumulators.`,
      impact: 'medium',
    });
  }
  if (patterns.lineCount > 100 && patterns.totalFunctions < 3) {
    optimizationSuggestions.push({
      title: 'Break Down Large Code Blocks',
      description: 'Large monolithic code blocks are harder to optimize. Split into smaller functions to enable targeted optimizations and potential lazy evaluation.',
      impact: 'medium',
    });
  }
  if (patterns.promises > 0 && patterns.asyncAwait === 0) {
    optimizationSuggestions.push({
      title: 'Use async/await Over Promise Chains',
      description: 'Promise chains can be flattened using async/await for better readability and easier error handling with try/catch.',
      impact: 'low',
    });
  }
  if (optimizationSuggestions.length < 2) {
    optimizationSuggestions.push({
      title: 'Consider Memoization',
      description: 'For functions with expensive computations and repeated calls with the same arguments, implement memoization to cache results.',
      impact: 'medium',
    });
  }

  // --- Refactoring Suggestions ---
  const refactoringSuggestions = [];
  if (patterns.lineCount > 80 && patterns.totalFunctions < 2) {
    refactoringSuggestions.push({
      title: 'Extract Functions',
      description: `The code is ${patterns.lineCount} lines with few function abstractions. Extract logical blocks into well-named helper functions.`,
      codeSnippet: `// Before:\n// 80+ lines of sequential code\n\n// After:\nfunction validateInput(data) { /* ... */ }\nfunction processData(data) { /* ... */ }\nfunction formatOutput(result) { /* ... */ }`,
    });
  }
  if (patterns.ifStatements > 5) {
    refactoringSuggestions.push({
      title: 'Simplify Conditional Logic',
      description: `Found ${patterns.ifStatements} if statements. Consider using early returns, guard clauses, or a strategy pattern to reduce nesting.`,
      codeSnippet: `// Before:\nif (condition) {\n  if (otherCondition) {\n    // deep logic\n  }\n}\n\n// After:\nif (!condition) return;\nif (!otherCondition) return;\n// clean logic`,
    });
  }
  if (patterns.callbacks > 0) {
    refactoringSuggestions.push({
      title: 'Replace Callbacks with Promises',
      description: 'Callback-based code can lead to "callback hell". Refactor to use Promises or async/await for cleaner asynchronous flow.',
      codeSnippet: `// Before:\ngetData(function(err, data) {\n  process(data, function(err, result) {\n    // nested callbacks\n  });\n});\n\n// After:\nconst data = await getData();\nconst result = await process(data);`,
    });
  }
  if (refactoringSuggestions.length < 2) {
    refactoringSuggestions.push({
      title: 'Use Destructuring',
      description: 'Simplify object and array access patterns using ES6 destructuring for cleaner, more readable code.',
      codeSnippet: `// Before:\nconst name = user.name;\nconst email = user.email;\n\n// After:\nconst { name, email } = user;`,
    });
  }

  // --- Security Suggestions ---
  const securitySuggestions = [];
  if (patterns.evalUsage > 0) {
    securitySuggestions.push({
      title: 'Critical: Remove eval() Usage',
      description: 'eval() executes arbitrary code and is a major XSS and injection vulnerability. Remove all eval() calls immediately.',
      severity: 'critical',
    });
  }
  if (patterns.innerHTMLUsage > 0) {
    securitySuggestions.push({
      title: 'Avoid innerHTML',
      description: 'Direct innerHTML assignment can lead to XSS attacks. Use textContent, or sanitize HTML before injection using libraries like DOMPurify.',
      severity: 'high',
    });
  }
  if (patterns.sqlLike > 0) {
    securitySuggestions.push({
      title: 'Use Parameterized Queries',
      description: 'SQL-like strings detected. Always use parameterized queries or an ORM to prevent SQL injection attacks.',
      severity: 'critical',
    });
  }
  if (securitySuggestions.length === 0) {
    securitySuggestions.push({
      title: 'Validate Input Data',
      description: 'Always validate and sanitize user inputs before processing. Use schema validation libraries like Joi or Zod.',
      severity: 'medium',
    });
    if (patterns.imports > 0) {
      securitySuggestions.push({
        title: 'Audit Dependencies',
        description: 'Regularly audit third-party packages for known vulnerabilities using npm audit or Snyk.',
        severity: 'low',
      });
    }
  }

  // --- Summary ---
  const summaryParts = [];
  summaryParts.push(`Analyzed ${patterns.lineCount} lines of ${language} code.`);
  if (scores.overallRating >= 80) {
    summaryParts.push('The code demonstrates good overall quality with solid structure.');
  } else if (scores.overallRating >= 65) {
    summaryParts.push('The code is functional but has several areas that could be improved.');
  } else {
    summaryParts.push('The code needs significant improvements in structure, readability, and best practices.');
  }
  summaryParts.push(`Found ${patterns.totalFunctions} function(s), ${patterns.totalLoops} loop(s), and ${patterns.variables} variable declaration(s).`);
  if (patterns.tryCatch === 0 && patterns.totalFunctions > 0) {
    summaryParts.push('Error handling is missing and should be added.');
  }
  if (patterns.nestedLoopCount > 0) {
    summaryParts.push('Nested loops were detected which may impact performance.');
  }

  return {
    codeQuality: scores.codeQuality,
    readability: scores.readability,
    maintainability: scores.maintainability,
    bestPractices: bestPractices.slice(0, 5),
    namingSuggestions: namingSuggestions.slice(0, 4),
    optimizationSuggestions: optimizationSuggestions.slice(0, 4),
    refactoringSuggestions: refactoringSuggestions.slice(0, 3),
    securitySuggestions: securitySuggestions.slice(0, 3),
    overallRating: scores.overallRating,
    summary: summaryParts.join(' '),
  };
}

// ─── analyzeComplexity ──────────────────────────────────────────────────────

/**
 * Analyze code complexity patterns
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Object} Complexity analysis results
 */
async function analyzeComplexity(code, language = 'javascript') {
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Analyze the complexity of the following ${language} code and return a JSON object. The JSON object must match this schema exactly:
{
  "timeComplexity": "string (e.g. O(n), O(1), O(n log n))",
  "spaceComplexity": "string",
  "nestedLoops": {
    "count": number,
    "locations": [{ "line": number, "depth": number }]
  },
  "recursiveCalls": {
    "count": number,
    "functions": ["string"]
  },
  "duplicateCode": {
    "count": number,
    "instances": [{ "description": "string" }]
  },
  "unusedVariables": {
    "count": number,
    "variables": ["string"]
  },
  "largeFunctions": {
    "count": number,
    "functions": [{ "name": "string", "lines": number }]
  },
  "suggestions": ["string"]
}

Code:
${code}`;
    const result = await callGemini(prompt, "You are a static code complexity analyzer. Output valid JSON matching the requested schema.");
    if (result) return result;
  }

  const patterns = detectPatterns(code);
  const lines = code.split('\n');


  // Time complexity estimation
  let timeComplexity = 'O(1)';
  if (patterns.totalLoops > 0) timeComplexity = 'O(n)';
  if (patterns.nestedLoopCount > 0) timeComplexity = 'O(n²)';
  if (patterns.nestedLoopCount > 1) timeComplexity = 'O(n³)';
  if (patterns.recursiveFunctions.length > 0 && patterns.nestedLoopCount === 0) {
    timeComplexity = 'O(2^n)';
  }
  if (patterns.recursiveFunctions.length > 0 && patterns.totalLoops > 0) {
    timeComplexity = 'O(n * 2^n)';
  }

  // Space complexity estimation
  let spaceComplexity = 'O(1)';
  if (patterns.variables > 5) spaceComplexity = 'O(n)';
  if (patterns.recursiveFunctions.length > 0) spaceComplexity = 'O(n)';
  if (countPattern(code, /new\s+(Array|Map|Set|Object)\b/g) > 0) spaceComplexity = 'O(n)';
  if (patterns.nestedLoopCount > 0 && countPattern(code, /\.push\(|\.concat\(/g) > 0) {
    spaceComplexity = 'O(n²)';
  }

  // Duplicate code detection (simple heuristic: find repeated line patterns)
  const lineMap = {};
  const duplicateInstances = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.length > 15 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && trimmed !== '{' && trimmed !== '}') {
      if (lineMap[trimmed]) {
        lineMap[trimmed].push(idx + 1);
      } else {
        lineMap[trimmed] = [idx + 1];
      }
    }
  });
  for (const [line, occurrences] of Object.entries(lineMap)) {
    if (occurrences.length > 1) {
      duplicateInstances.push({
        description: `Repeated code at lines ${occurrences.join(', ')}: "${line.substring(0, 60)}${line.length > 60 ? '...' : ''}"`,
      });
    }
  }

  // Unused variables detection (simple heuristic)
  const declaredVars = [];
  const varDecls = code.matchAll(/\b(?:let|const|var)\s+(\w+)/g);
  for (const m of varDecls) {
    declaredVars.push(m[1]);
  }
  const unusedVars = declaredVars.filter((varName) => {
    const pattern = new RegExp(`\\b${varName}\\b`, 'g');
    const count = countPattern(code, pattern);
    return count <= 1; // Only the declaration itself
  });

  // Large functions detection
  const largeFunctions = [];
  const funcStarts = [];
  lines.forEach((line, idx) => {
    const funcMatch = line.match(/\bfunction\s+(\w+)/);
    const arrowMatch = line.match(/\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_$]\w*)\s*=>/);
    if (funcMatch) {
      funcStarts.push({ name: funcMatch[1], start: idx });
    } else if (arrowMatch) {
      funcStarts.push({ name: arrowMatch[1], start: idx });
    }
  });
  funcStarts.forEach((func, i) => {
    const end = i < funcStarts.length - 1 ? funcStarts[i + 1].start : lines.length;
    const funcLines = end - func.start;
    if (funcLines > 30) {
      largeFunctions.push({ name: func.name, lines: funcLines });
    }
  });

  // Suggestions
  const suggestions = [];
  if (timeComplexity !== 'O(1)' && timeComplexity !== 'O(n)') {
    suggestions.push(`Time complexity is ${timeComplexity}. Consider using more efficient algorithms or data structures like hash maps.`);
  }
  if (patterns.nestedLoopCount > 0) {
    suggestions.push('Refactor nested loops using Map/Set for O(1) lookups to reduce time complexity.');
  }
  if (unusedVars.length > 0) {
    suggestions.push(`Remove ${unusedVars.length} unused variable(s) to clean up the codebase: ${unusedVars.join(', ')}.`);
  }
  if (duplicateInstances.length > 0) {
    suggestions.push(`Found ${duplicateInstances.length} instance(s) of duplicate code. Extract into reusable functions.`);
  }
  if (largeFunctions.length > 0) {
    suggestions.push(`${largeFunctions.length} function(s) exceed 30 lines. Break them into smaller, focused functions.`);
  }
  if (patterns.recursiveFunctions.length > 0) {
    suggestions.push(`Recursive function(s) detected: ${patterns.recursiveFunctions.join(', ')}. Consider iterative alternatives or add memoization.`);
  }
  if (suggestions.length === 0) {
    suggestions.push('Code complexity is within acceptable limits. Keep functions small and focused.');
  }

  return {
    timeComplexity,
    spaceComplexity,
    nestedLoops: {
      count: patterns.nestedLoopCount,
      locations: patterns.nestedLoopLocations,
    },
    recursiveCalls: {
      count: patterns.recursiveFunctions.length,
      functions: patterns.recursiveFunctions,
    },
    duplicateCode: {
      count: duplicateInstances.length,
      instances: duplicateInstances.slice(0, 10),
    },
    unusedVariables: {
      count: unusedVars.length,
      variables: unusedVars.slice(0, 15),
    },
    largeFunctions: {
      count: largeFunctions.length,
      functions: largeFunctions,
    },
    suggestions,
  };
}

// ─── detectBugs ─────────────────────────────────────────────────────────────

/**
 * Detect potential bugs and issues in code
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Object} Bug detection results
 */
async function detectBugs(code, language = 'javascript') {
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Detect potential bugs and issues in the following ${language} code and return a JSON object. The JSON object must match this schema exactly:
{
  "logicalBugs": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "syntaxIssues": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "nullPointerRisks": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "infiniteLoopRisks": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "memoryIssues": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "unusedImports": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "deadCode": [
    { "title": "string", "description": "string", "severity": "info" | "warning" | "error", "line": number }
  ],
  "summary": "string summarizing your findings",
  "totalBugs": number
}

Code:
${code}`;
    const result = await callGemini(prompt, "You are a static analysis tool for detecting bugs. Output valid JSON matching the requested schema.");
    if (result) return result;
  }

  const patterns = detectPatterns(code);
  const lines = code.split('\n');


  const logicalBugs = [];
  const syntaxIssues = [];
  const nullPointerRisks = [];
  const infiniteLoopRisks = [];
  const memoryIssues = [];
  const unusedImports = [];
  const deadCode = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Logical bugs
    if (/==(?!=)/.test(trimmed) && !/===/.test(trimmed)) {
      logicalBugs.push({
        title: 'Loose Equality Comparison',
        description: `Line ${lineNum}: Using '==' instead of '==='. Loose equality can cause unexpected type coercion. Use strict equality '===' instead.`,
        severity: 'warning',
        line: lineNum,
      });
    }
    if (/\bif\s*\(\s*\w+\s*=\s*[^=]/.test(trimmed) && !/===|!==|==/.test(trimmed)) {
      logicalBugs.push({
        title: 'Assignment in Condition',
        description: `Line ${lineNum}: Possible assignment '=' used instead of comparison '==' or '===' inside a condition.`,
        severity: 'error',
        line: lineNum,
      });
    }
    if (/\.length\s*==\s*0/.test(trimmed) || /\.length\s*===\s*0/.test(trimmed)) {
      logicalBugs.push({
        title: 'Empty Check Could Fail on Null',
        description: `Line ${lineNum}: Checking .length without first verifying the variable is not null/undefined could throw a TypeError.`,
        severity: 'warning',
        line: lineNum,
      });
    }

    // Null pointer risks
    if (/\.\w+\.\w+\.\w+/.test(trimmed) && !/\?\.\w+/.test(trimmed)) {
      nullPointerRisks.push({
        title: 'Deep Property Access Without Null Check',
        description: `Line ${lineNum}: Deep property chain access detected. Use optional chaining (?.) or null checks to prevent TypeError.`,
        severity: 'warning',
        line: lineNum,
      });
    }
    if (/\[\w+\]/.test(trimmed) && !/\?\.\[/.test(trimmed) && !/for|while|if/.test(trimmed)) {
      nullPointerRisks.push({
        title: 'Unchecked Array/Object Access',
        description: `Line ${lineNum}: Dynamic property access without bounds checking. Verify the index/key exists before accessing.`,
        severity: 'info',
        line: lineNum,
      });
    }

    // Infinite loop risks
    if (/\bwhile\s*\(\s*true\s*\)/.test(trimmed)) {
      infiniteLoopRisks.push({
        title: 'Potential Infinite Loop',
        description: `Line ${lineNum}: while(true) loop detected. Ensure there is a proper break condition inside the loop.`,
        severity: 'error',
        line: lineNum,
      });
    }
    if (/\bwhile\s*\(/.test(trimmed) && !/break|return/.test(code.substring(idx))) {
      // Simple heuristic: check if there's a break somewhere after this while
      const afterWhile = lines.slice(idx, Math.min(idx + 20, lines.length)).join('\n');
      if (!/break|return/.test(afterWhile)) {
        infiniteLoopRisks.push({
          title: 'Loop Missing Break Condition',
          description: `Line ${lineNum}: No break or return statement found near this while loop. Verify loop termination.`,
          severity: 'warning',
          line: lineNum,
        });
      }
    }

    // Memory issues
    if (/setInterval\s*\(/.test(trimmed)) {
      memoryIssues.push({
        title: 'Potential Memory Leak: setInterval',
        description: `Line ${lineNum}: setInterval without clearInterval can cause memory leaks. Store the interval ID and clear it when no longer needed.`,
        severity: 'warning',
        line: lineNum,
      });
    }
    if (/addEventListener\s*\(/.test(trimmed)) {
      memoryIssues.push({
        title: 'Event Listener Without Cleanup',
        description: `Line ${lineNum}: Event listener added. Ensure removeEventListener is called during cleanup to prevent memory leaks.`,
        severity: 'info',
        line: lineNum,
      });
    }
    if (/new\s+\w+\(/.test(trimmed) && /global|window/.test(trimmed)) {
      memoryIssues.push({
        title: 'Global Object Allocation',
        description: `Line ${lineNum}: Object allocated in global scope. This will persist in memory for the lifetime of the application.`,
        severity: 'warning',
        line: lineNum,
      });
    }

    // Syntax issues
    if (trimmed.endsWith(';;')) {
      syntaxIssues.push({
        title: 'Double Semicolon',
        description: `Line ${lineNum}: Double semicolon detected. This is likely a typo.`,
        severity: 'info',
        line: lineNum,
      });
    }

    // Dead code detection
    if (/^\s*return\b/.test(trimmed) && idx < lines.length - 1) {
      const nextLine = lines[idx + 1]?.trim();
      if (nextLine && nextLine !== '}' && nextLine !== '' && !nextLine.startsWith('//') && !nextLine.startsWith('case') && !nextLine.startsWith('default')) {
        deadCode.push({
          title: 'Unreachable Code After Return',
          description: `Line ${lineNum + 1}: Code after return statement is unreachable and will never execute.`,
          severity: 'warning',
          line: lineNum + 1,
        });
      }
    }
  });

  // Unused imports detection
  const importMatches = code.matchAll(/(?:import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]|const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g);
  for (const match of importMatches) {
    const moduleName = match[1] || match[3];
    const varName = match[2];
    if (varName) {
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
      const usageCount = countPattern(code, usagePattern);
      if (usageCount <= 1) {
        unusedImports.push({
          title: 'Potentially Unused Import',
          description: `Module '${moduleName}' imported as '${varName}' may not be used in the code.`,
          severity: 'info',
          line: 0,
        });
      }
    }
  }

  const totalBugs =
    logicalBugs.length +
    syntaxIssues.length +
    nullPointerRisks.length +
    infiniteLoopRisks.length +
    memoryIssues.length +
    unusedImports.length +
    deadCode.length;

  // Summary
  const summaryParts = [`Scanned ${patterns.lineCount} lines of ${language} code.`];
  if (totalBugs === 0) {
    summaryParts.push('No significant issues detected. The code appears to be well-written.');
  } else {
    summaryParts.push(`Found ${totalBugs} potential issue(s).`);
    if (logicalBugs.length > 0) summaryParts.push(`${logicalBugs.length} logical bug(s) need attention.`);
    if (nullPointerRisks.length > 0) summaryParts.push(`${nullPointerRisks.length} null pointer risk(s) identified.`);
    if (infiniteLoopRisks.length > 0) summaryParts.push(`${infiniteLoopRisks.length} potential infinite loop risk(s).`);
    if (memoryIssues.length > 0) summaryParts.push(`${memoryIssues.length} memory concern(s) found.`);
  }

  return {
    logicalBugs: logicalBugs.slice(0, 10),
    syntaxIssues: syntaxIssues.slice(0, 10),
    nullPointerRisks: nullPointerRisks.slice(0, 10),
    infiniteLoopRisks: infiniteLoopRisks.slice(0, 5),
    memoryIssues: memoryIssues.slice(0, 5),
    unusedImports: unusedImports.slice(0, 10),
    deadCode: deadCode.slice(0, 10),
    summary: summaryParts.join(' '),
    totalBugs,
  };
}

// ─── generateDocumentation ──────────────────────────────────────────────────

/**
 * Generate documentation from code analysis
 * @param {string} code - Source code
 * @param {string} projectName - Project name
 * @param {string} language - Programming language
 * @returns {Object} Generated documentation
 */
async function generateDocumentation(code, projectName = 'Project', language = 'javascript') {
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Generate technical documentation for the following ${language} code from the project "${projectName}" and return a JSON object. The JSON object must match this schema exactly:
{
  "projectSummary": {
    "title": "string",
    "description": "string",
    "features": ["string"]
  },
  "installationGuide": "string (markdown)",
  "folderStructure": "string (markdown structure text)",
  "apiDocumentation": "string (markdown endpoints details)",
  "readme": "string (complete markdown README.md contents)",
  "usageInstructions": "string (markdown)"
}

Code:
${code}`;
    const result = await callGemini(prompt, "You are a technical documentation writer. Output valid JSON matching the requested schema.");
    if (result) return result;
  }

  const patterns = detectPatterns(code);
  const langName = language.charAt(0).toUpperCase() + language.slice(1);


  // Detect if code has routes/endpoints
  const hasRoutes = /\.(get|post|put|patch|delete)\s*\(/.test(code);
  const routeMatches = [...code.matchAll(/\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g)];

  // Extract function names for documentation
  const funcNames = patterns.functionNames.length > 0
    ? patterns.functionNames
    : ['main'];

  const projectSummary = `# ${projectName}\n\n${projectName} is a ${langName}-based application with ${patterns.lineCount} lines of code. ` +
    `It contains ${patterns.totalFunctions} function(s), ${patterns.classes} class(es), and uses ${patterns.imports} import(s). ` +
    (patterns.asyncAwait > 0 ? 'The application utilizes asynchronous programming patterns. ' : '') +
    (hasRoutes ? `It exposes ${routeMatches.length} API endpoint(s). ` : '') +
    `The codebase ${patterns.comments > 3 ? 'is well-documented' : 'could benefit from more documentation'}.`;

  const installationGuide = `## Installation\n\n### Prerequisites\n- Node.js (v18 or higher)\n- npm or yarn\n\n### Setup\n\n\`\`\`bash\n# Clone the repository\ngit clone <repository-url>\ncd ${projectName.toLowerCase().replace(/\s+/g, '-')}\n\n# Install dependencies\nnpm install\n\n# Set up environment variables\ncp .env.example .env\n# Edit .env with your configuration\n\n# Start the development server\nnpm run dev\n\`\`\`\n\n### Environment Variables\n\n| Variable | Description | Required |\n|----------|-------------|----------|\n| PORT | Server port | Yes |\n| DATABASE_URL | Database connection string | Yes |\n| NODE_ENV | Environment (development/production) | No |`;

  const folderStructure = `## Project Structure\n\n\`\`\`\n${projectName.toLowerCase().replace(/\s+/g, '-')}/\n├── src/\n│   ├── config/         # Configuration files\n│   ├── controllers/    # Route controllers\n│   ├── middleware/      # Custom middleware\n│   ├── models/          # Data models\n│   ├── routes/          # API routes\n│   ├── services/        # Business logic\n│   ├── utils/           # Utility functions\n│   └── index.js         # Entry point\n├── tests/\n│   ├── unit/            # Unit tests\n│   └── integration/     # Integration tests\n├── .env.example\n├── .gitignore\n├── package.json\n└── README.md\n\`\`\``;

  let apiDocumentation = '## API Documentation\n\n';
  if (hasRoutes && routeMatches.length > 0) {
    apiDocumentation += '### Endpoints\n\n';
    routeMatches.forEach((match, i) => {
      const method = match[1].toUpperCase();
      const path = match[2];
      apiDocumentation += `#### ${i + 1}. ${method} \`${path}\`\n\n`;
      apiDocumentation += `**Description:** Handles ${method} requests to ${path}\n\n`;
      apiDocumentation += '**Headers:**\n```\nContent-Type: application/json\nAuthorization: Bearer <token>\n```\n\n';
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        apiDocumentation += '**Request Body:**\n```json\n{\n  "field": "value"\n}\n```\n\n';
      }
      apiDocumentation += '**Response:**\n```json\n{\n  "success": true,\n  "data": {}\n}\n```\n\n---\n\n';
    });
  } else {
    apiDocumentation += 'No REST API endpoints detected in the provided code.\n\n';
    apiDocumentation += '### Functions\n\n';
    funcNames.slice(0, 8).forEach((name) => {
      apiDocumentation += `#### \`${name}()\`\n\nDescription: Performs operations related to ${name}.\n\n`;
    });
  }

  const readme = `# ${projectName}\n\n` +
    `> A ${langName} application\n\n` +
    `## Overview\n\n${projectName} is built with ${langName} and contains ${patterns.lineCount} lines of source code.\n\n` +
    installationGuide + '\n\n' +
    folderStructure + '\n\n' +
    apiDocumentation + '\n\n' +
    `## Usage\n\n\`\`\`bash\n# Development\nnpm run dev\n\n# Production\nnpm start\n\n# Testing\nnpm test\n\`\`\`\n\n` +
    `## Contributing\n\n1. Fork the repository\n2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)\n3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)\n4. Push to the branch (\`git push origin feature/amazing-feature\`)\n5. Open a Pull Request\n\n` +
    `## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.`;

  const usageInstructions = `## Usage Instructions\n\n### Getting Started\n\n1. Install all dependencies using \`npm install\`\n2. Configure your environment variables in the \`.env\` file\n3. Run the application using \`npm run dev\` for development\n\n### Key Functions\n\n` +
    funcNames.slice(0, 5).map((name) => `- **${name}()**: Core function for ${name}-related operations`).join('\n') +
    `\n\n### Configuration\n\nThe application can be configured through environment variables or the config files in the \`config/\` directory.\n\n### Troubleshooting\n\n- Ensure all dependencies are installed: \`npm install\`\n- Check that environment variables are set correctly\n- Verify database connection string is valid\n- Check logs for detailed error messages`;

  return {
    projectSummary,
    installationGuide,
    folderStructure,
    apiDocumentation,
    readme,
    usageInstructions,
  };
}

// ─── generateInterviewQuestions ─────────────────────────────────────────────

/**
 * Large question bank organized by topic and difficulty
 */
const questionBank = {
  javascript: {
    easy: {
      mcqs: [
        { question: 'What is the output of typeof null in JavaScript?', options: ['null', 'undefined', 'object', 'boolean'], correctAnswer: 2, explanation: 'typeof null returns "object" due to a historical bug in JavaScript.' },
        { question: 'Which method converts a JSON string to a JavaScript object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'], correctAnswer: 1, explanation: 'JSON.parse() parses a JSON string and constructs the JavaScript value or object described by the string.' },
        { question: 'What does the "===" operator check?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 2, explanation: 'The strict equality operator === checks both value and type without type coercion.' },
        { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correctAnswer: 1, explanation: 'let declares a block-scoped variable, unlike var which is function-scoped.' },
        { question: 'What is the default value of an uninitialized variable?', options: ['null', '0', 'undefined', 'NaN'], correctAnswer: 2, explanation: 'Variables declared but not initialized have the value undefined.' },
      ],
      codingQuestions: [
        { question: 'Write a function that reverses a string without using the built-in reverse() method.', hint: 'Use a for loop iterating from the end of the string.', solution: 'function reverseString(str) {\n  let reversed = "";\n  for (let i = str.length - 1; i >= 0; i--) {\n    reversed += str[i];\n  }\n  return reversed;\n}', difficulty: 'easy' },
        { question: 'Write a function that checks if a number is even or odd.', hint: 'Use the modulo operator %.', solution: 'function isEven(num) {\n  return num % 2 === 0;\n}', difficulty: 'easy' },
        { question: 'Write a function that finds the largest number in an array.', hint: 'Use Math.max with spread operator or iterate through the array.', solution: 'function findMax(arr) {\n  return Math.max(...arr);\n}', difficulty: 'easy' },
      ],
      hrQuestions: [
        { question: 'Tell me about yourself and your experience with JavaScript.', sampleAnswer: 'I am a passionate developer with experience in JavaScript for building web applications. I have worked with frameworks like React and Node.js...', tips: 'Focus on relevant experience, projects, and your learning journey.' },
        { question: 'Why did you choose to become a developer?', sampleAnswer: 'I was always fascinated by how technology works and solving problems. Programming allows me to create solutions that help people...', tips: 'Be genuine and show passion for problem-solving.' },
        { question: 'How do you handle tight deadlines?', sampleAnswer: 'I prioritize tasks, break them into manageable chunks, and communicate proactively with the team about progress...', tips: 'Give specific examples from past experience.' },
      ],
      technicalQuestions: [
        { question: 'What is the difference between let, const, and var?', answer: 'var is function-scoped and hoisted. let is block-scoped and can be reassigned. const is block-scoped and cannot be reassigned (though objects/arrays can be mutated).', topic: 'variables' },
        { question: 'What are primitive data types in JavaScript?', answer: 'String, Number, Boolean, Undefined, Null, Symbol, and BigInt are the seven primitive data types.', topic: 'types' },
        { question: 'What is an arrow function?', answer: 'Arrow functions are a concise syntax for writing functions. They do not have their own this, arguments, super, or new.target bindings.', topic: 'functions' },
        { question: 'What is the DOM?', answer: 'The Document Object Model (DOM) is a programming interface for web documents. It represents the page as a tree of nodes that can be manipulated with JavaScript.', topic: 'web' },
      ],
      followUpQuestions: [
        { question: 'Can you explain hoisting with an example?', context: 'After discussing var vs let', expectedAnswer: 'Hoisting moves declarations to the top of their scope. var declarations are hoisted and initialized as undefined, while let/const are hoisted but remain in the "temporal dead zone" until their declaration is reached.' },
        { question: 'What happens if you try to reassign a const object?', context: 'After discussing const', expectedAnswer: 'You cannot reassign the variable, but you can modify the object\'s properties. const prevents reassignment of the binding, not mutation of the value.' },
        { question: 'When would you use var over let?', context: 'After discussing variable declarations', expectedAnswer: 'In modern JavaScript, there are very few cases to use var. You might encounter it in legacy code. let and const should be preferred for their block scoping and clarity.' },
      ],
    },
    medium: {
      mcqs: [
        { question: 'What is a closure in JavaScript?', options: ['A way to close the browser', 'A function with access to its outer scope even after the outer function has returned', 'A method to close database connections', 'A loop termination condition'], correctAnswer: 1, explanation: 'A closure is created when a function retains access to variables from its enclosing scope even after that scope has finished execution.' },
        { question: 'What does the Event Loop do?', options: ['Loops through events', 'Handles asynchronous callbacks by monitoring the call stack and callback queue', 'Creates event handlers', 'Processes DOM events only'], correctAnswer: 1, explanation: 'The Event Loop continuously checks if the call stack is empty and pushes callbacks from the queue to the stack for execution.' },
        { question: 'Which of the following is NOT a valid way to create an object?', options: ['Object.create()', 'new Object()', '{}', 'Object.new()'], correctAnswer: 3, explanation: 'Object.new() is not valid JavaScript syntax. Objects can be created with literals {}, constructors, or Object.create().' },
        { question: 'What is the purpose of the "this" keyword?', options: ['Refers to the current file', 'Refers to the object that is executing the current function', 'Creates a new variable', 'Refers to the parent class'], correctAnswer: 1, explanation: 'The "this" keyword refers to the object that is the current execution context of the function.' },
        { question: 'What is Promise.all() used for?', options: ['Resolving a single promise', 'Running promises sequentially', 'Running multiple promises concurrently and waiting for all to resolve', 'Cancelling all promises'], correctAnswer: 2, explanation: 'Promise.all() takes an array of promises and returns a single promise that resolves when all input promises have resolved.' },
      ],
      codingQuestions: [
        { question: 'Implement a debounce function that delays invoking a function until after a specified wait time.', hint: 'Use setTimeout and clearTimeout to manage the delay.', solution: 'function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func.apply(this, args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}', difficulty: 'medium' },
        { question: 'Write a function that flattens a deeply nested array.', hint: 'Use recursion or Array.isArray() to check for nested arrays.', solution: 'function flatten(arr) {\n  return arr.reduce((flat, item) => {\n    return flat.concat(Array.isArray(item) ? flatten(item) : item);\n  }, []);\n}', difficulty: 'medium' },
        { question: 'Implement a function that deep clones an object.', hint: 'Handle nested objects and arrays recursively.', solution: 'function deepClone(obj) {\n  if (obj === null || typeof obj !== "object") return obj;\n  if (Array.isArray(obj)) return obj.map(item => deepClone(item));\n  const clone = {};\n  for (const key of Object.keys(obj)) {\n    clone[key] = deepClone(obj[key]);\n  }\n  return clone;\n}', difficulty: 'medium' },
      ],
      hrQuestions: [
        { question: 'Describe a challenging bug you encountered and how you resolved it.', sampleAnswer: 'I once dealt with a race condition in async code that caused intermittent failures. I used debugging tools, added proper logging, and implemented mutex locks...', tips: 'Structure your answer using STAR method (Situation, Task, Action, Result).' },
        { question: 'How do you stay updated with the latest JavaScript trends?', sampleAnswer: 'I follow blogs like JavaScript Weekly, attend conferences, contribute to open source, and experiment with new features in side projects...', tips: 'Show genuine interest in continuous learning.' },
        { question: 'How do you handle code reviews and feedback?', sampleAnswer: 'I view code reviews as learning opportunities. I provide constructive feedback and am open to suggestions that improve code quality...', tips: 'Emphasize collaboration and growth mindset.' },
      ],
      technicalQuestions: [
        { question: 'Explain the difference between synchronous and asynchronous programming.', answer: 'Synchronous code executes sequentially, blocking until each operation completes. Asynchronous code allows operations to run without blocking, using callbacks, promises, or async/await to handle results when ready.', topic: 'async' },
        { question: 'What is prototypal inheritance?', answer: 'JavaScript objects can inherit properties from other objects through the prototype chain. Each object has an internal [[Prototype]] link to another object, and property lookups traverse this chain.', topic: 'objects' },
        { question: 'Explain event bubbling and capturing.', answer: 'Event capturing is when an event travels from the root down to the target element. Bubbling is when it travels from the target back up. By default, event handlers use bubbling phase.', topic: 'events' },
        { question: 'What are generators in JavaScript?', answer: 'Generators are functions that can pause and resume execution. Declared with function*, they use yield to produce values lazily, making them useful for iterators and async flow control.', topic: 'advanced' },
      ],
      followUpQuestions: [
        { question: 'How would you implement a closure-based counter?', context: 'After discussing closures', expectedAnswer: 'function createCounter() { let count = 0; return { increment: () => ++count, decrement: () => --count, getCount: () => count }; } The inner functions close over the count variable.' },
        { question: 'What is the difference between Promise.all and Promise.allSettled?', context: 'After discussing promises', expectedAnswer: 'Promise.all rejects if any promise rejects. Promise.allSettled waits for all promises to settle (resolve or reject) and returns an array of result objects with status and value/reason.' },
        { question: 'Can you explain the microtask queue vs macrotask queue?', context: 'After discussing the event loop', expectedAnswer: 'Microtasks (Promises, queueMicrotask) have higher priority and run before macrotasks (setTimeout, setInterval). The event loop processes all microtasks before moving to the next macrotask.' },
      ],
    },
    hard: {
      mcqs: [
        { question: 'What is the Temporal Dead Zone (TDZ)?', options: ['A memory leak pattern', 'The period between entering scope and the variable declaration being processed', 'A deprecated JavaScript feature', 'A zone in the event loop'], correctAnswer: 1, explanation: 'The TDZ is the period between entering a scope where let/const are declared and the actual declaration line, during which accessing the variable throws a ReferenceError.' },
        { question: 'What does Object.freeze() do?', options: ['Pauses JavaScript execution', 'Makes an object immutable (shallow)', 'Prevents garbage collection', 'Freezes the event loop'], correctAnswer: 1, explanation: 'Object.freeze() creates a shallow immutable object. Existing properties cannot be modified, added, or removed, but nested objects can still be mutated.' },
        { question: 'Which pattern does the JavaScript module system use?', options: ['Singleton', 'Factory', 'Revealing Module', 'All of the above can be implemented'], correctAnswer: 3, explanation: 'JavaScript modules can implement various design patterns. ES modules are singletons by default, but factory and revealing module patterns can also be implemented.' },
        { question: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?', options: ['true', 'false', 'undefined', 'Error'], correctAnswer: 1, explanation: 'Due to floating-point precision, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.' },
        { question: 'What is a WeakMap and when would you use it?', options: ['A map that allows weak connections', 'A map with weakly held keys that allows garbage collection of key objects', 'A smaller version of Map', 'A map for storing weak references'], correctAnswer: 1, explanation: 'WeakMap holds weak references to key objects, allowing them to be garbage collected when no other references exist. Useful for metadata attached to objects.' },
      ],
      codingQuestions: [
        { question: 'Implement a LRU (Least Recently Used) cache with O(1) get and put operations.', hint: 'Use a combination of Map (for O(1) lookup) and doubly-linked list logic (Map maintains insertion order in JS).', solution: 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n    this.cache.set(key, value);\n  }\n}', difficulty: 'hard' },
        { question: 'Implement a custom Promise.all() from scratch.', hint: 'Create a new Promise, iterate through the input array, track resolved count.', solution: 'function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let completed = 0;\n    if (promises.length === 0) return resolve([]);\n    promises.forEach((promise, index) => {\n      Promise.resolve(promise).then(value => {\n        results[index] = value;\n        completed++;\n        if (completed === promises.length) resolve(results);\n      }).catch(reject);\n    });\n  });\n}', difficulty: 'hard' },
        { question: 'Implement a function that curries another function for any number of arguments.', hint: 'Use recursion to collect arguments until the expected arity is reached.', solution: 'function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn.apply(this, args);\n    }\n    return function (...args2) {\n      return curried.apply(this, args.concat(args2));\n    };\n  };\n}', difficulty: 'hard' },
      ],
      hrQuestions: [
        { question: 'Describe a time when you had to make a difficult architectural decision.', sampleAnswer: 'When scaling our real-time dashboard, I had to choose between WebSockets and Server-Sent Events. I evaluated both, considering bidirectional needs, server load, and client support...', tips: 'Explain the trade-offs you considered and justify your final decision.' },
        { question: 'How do you mentor junior developers?', sampleAnswer: 'I pair-program on complex tasks, provide detailed code review feedback with explanations, create documentation, and encourage questions in a safe learning environment...', tips: 'Show leadership, patience, and investment in team growth.' },
        { question: 'Tell me about a project that failed and what you learned.', sampleAnswer: 'We launched a feature without proper load testing and it crashed under real traffic. I learned the importance of performance testing, staging environments, and gradual rollouts...', tips: 'Be honest about failures and focus on lessons learned and improvements made.' },
      ],
      technicalQuestions: [
        { question: 'Explain the V8 engine\'s garbage collection mechanism.', answer: 'V8 uses generational garbage collection with a young generation (Scavenger) and old generation (Mark-Sweep-Compact). New objects are allocated in the young generation and promoted to old generation if they survive GC cycles. Mark-Sweep marks reachable objects and sweeps unmarked ones.', topic: 'internals' },
        { question: 'How does the JavaScript JIT compiler work?', answer: 'The JIT (Just-In-Time) compiler compiles JavaScript to machine code at runtime. V8 uses Ignition (interpreter) for initial execution and TurboFan (optimizing compiler) for hot code paths, with deoptimization fallback for assumption violations.', topic: 'internals' },
        { question: 'Explain the Proxy object and its use cases.', answer: 'Proxy creates a wrapper that intercepts fundamental operations (get, set, has, apply, construct, etc.) through handler traps. Use cases include validation, logging, virtual properties, negative array indices, and implementing reactive systems.', topic: 'metaprogramming' },
        { question: 'What are SharedArrayBuffer and Atomics?', answer: 'SharedArrayBuffer allows sharing memory between workers. Atomics provides atomic operations (add, sub, load, store, wait, notify) on shared memory to prevent race conditions in concurrent access.', topic: 'concurrency' },
      ],
      followUpQuestions: [
        { question: 'How would you detect and fix a memory leak in a Node.js application?', context: 'After discussing garbage collection', expectedAnswer: 'Use --inspect flag with Chrome DevTools, take heap snapshots at intervals, compare them to find growing objects. Use process.memoryUsage() for monitoring. Common fixes include clearing references, removing event listeners, and closing streams.' },
        { question: 'When would you use a Proxy over a getter/setter?', context: 'After discussing Proxy', expectedAnswer: 'Use Proxy when you need to intercept operations on unknown/dynamic properties, or when you need to intercept operations beyond get/set (like has, deleteProperty, apply). Getters/setters are simpler for known, fixed properties.' },
        { question: 'Explain how you would implement a pub/sub system in JavaScript.', context: 'After discussing design patterns', expectedAnswer: 'Create an EventEmitter class with a map of event names to callback arrays. Implement on(event, callback) to subscribe, emit(event, data) to publish, and off(event, callback) to unsubscribe. Use WeakRef for optional weak subscriptions.' },
      ],
    },
  },
  react: {
    easy: {
      mcqs: [
        { question: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JavaScript that looks like HTML', 'A CSS preprocessor', 'A testing framework'], correctAnswer: 1, explanation: 'JSX is a syntax extension that allows you to write HTML-like code in JavaScript, which is then transpiled to React.createElement() calls.' },
        { question: 'What is a React component?', options: ['An HTML element', 'A reusable piece of UI', 'A CSS class', 'A JavaScript variable'], correctAnswer: 1, explanation: 'A React component is a reusable, self-contained piece of UI that can be composed with other components.' },
        { question: 'Which hook is used to manage state in functional components?', options: ['useEffect', 'useState', 'useContext', 'useRef'], correctAnswer: 1, explanation: 'useState is the hook used to add state management to functional components.' },
        { question: 'What does the key prop do in lists?', options: ['Provides encryption', 'Helps React identify which items have changed', 'Sorts the list', 'Adds keyboard shortcuts'], correctAnswer: 1, explanation: 'The key prop helps React identify which items in a list have changed, been added, or removed for efficient re-rendering.' },
        { question: 'How do you pass data from parent to child in React?', options: ['Using state', 'Using props', 'Using events', 'Using local storage'], correctAnswer: 1, explanation: 'Props (properties) are used to pass data from a parent component to a child component.' },
      ],
      codingQuestions: [
        { question: 'Create a counter component with increment and decrement buttons.', hint: 'Use useState hook to manage the count state.', solution: 'function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>+</button>\n      <button onClick={() => setCount(count - 1)}>-</button>\n    </div>\n  );\n}', difficulty: 'easy' },
        { question: 'Build a toggle switch component that shows/hides content.', hint: 'Use useState with a boolean value.', solution: 'function Toggle() {\n  const [isVisible, setIsVisible] = useState(false);\n  return (\n    <div>\n      <button onClick={() => setIsVisible(!isVisible)}>\n        {isVisible ? "Hide" : "Show"}\n      </button>\n      {isVisible && <p>This content is toggled!</p>}\n    </div>\n  );\n}', difficulty: 'easy' },
        { question: 'Create a component that displays a list of items from an array prop.', hint: 'Use the map() method to render each item.', solution: 'function ItemList({ items }) {\n  return (\n    <ul>\n      {items.map((item, index) => (\n        <li key={index}>{item}</li>\n      ))}\n    </ul>\n  );\n}', difficulty: 'easy' },
      ],
      hrQuestions: [
        { question: 'Why do you prefer React over other frameworks?', sampleAnswer: 'I appreciate React\'s component-based architecture, its large ecosystem, and the flexibility it provides. The virtual DOM and unidirectional data flow make it predictable...', tips: 'Be balanced — acknowledge other frameworks have strengths too.' },
        { question: 'How do you approach learning new React features?', sampleAnswer: 'I read the official React documentation, follow the React blog for updates, build small projects to practice, and engage with the community...', tips: 'Show systematic approach to learning.' },
        { question: 'Describe a React project you are proud of.', sampleAnswer: 'I built a real-time dashboard that visualized data streams using React and D3.js. The challenging part was optimizing renders for live data updates...', tips: 'Focus on technical challenges and your contributions.' },
      ],
      technicalQuestions: [
        { question: 'What is the Virtual DOM?', answer: 'The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to batch and minimize actual DOM manipulations by computing the difference (diffing) between the current and new virtual DOM trees.', topic: 'core' },
        { question: 'What is the difference between state and props?', answer: 'Props are read-only data passed from parent to child components. State is mutable data managed within a component that can trigger re-renders when updated.', topic: 'core' },
        { question: 'What is the purpose of useEffect?', answer: 'useEffect handles side effects in functional components, such as data fetching, subscriptions, DOM manipulation, and timer setup. It runs after render and can return a cleanup function.', topic: 'hooks' },
        { question: 'What is conditional rendering?', answer: 'Conditional rendering is the practice of rendering different UI elements based on conditions, using JavaScript operators like ternary, &&, or if statements inside JSX.', topic: 'patterns' },
      ],
      followUpQuestions: [
        { question: 'What happens if you modify state directly without setState?', context: 'After discussing state', expectedAnswer: 'Direct state mutation won\'t trigger a re-render, leading to stale UI. React needs setState/useState setter to detect changes and schedule re-renders. It can also cause bugs in shouldComponentUpdate comparisons.' },
        { question: 'Why should you not call hooks inside loops or conditions?', context: 'After discussing hooks', expectedAnswer: 'Hooks rely on call order to maintain state between renders. Calling hooks conditionally would change the order between renders, breaking the internal state mapping.' },
        { question: 'When would you use useRef instead of useState?', context: 'After discussing React hooks', expectedAnswer: 'useRef is for values that should persist across renders without causing re-renders (DOM references, previous values, timers). useState triggers re-renders on update, so use it for values that should be reflected in the UI.' },
      ],
    },
    medium: {
      mcqs: [
        { question: 'What is React.memo() used for?', options: ['Creating memoized values', 'Preventing unnecessary re-renders of components', 'Caching API responses', 'Creating shared state'], correctAnswer: 1, explanation: 'React.memo() is a higher-order component that memoizes a component, preventing re-renders when props have not changed.' },
        { question: 'What is the Context API used for?', options: ['Navigation', 'Passing data through the component tree without prop drilling', 'Error handling', 'Testing'], correctAnswer: 1, explanation: 'Context provides a way to pass data through the component tree without having to pass props manually at every level.' },
        { question: 'What is the purpose of useCallback?', options: ['Calling functions', 'Memoizing callback functions to prevent unnecessary re-creation', 'Handling errors in callbacks', 'Creating callback queues'], correctAnswer: 1, explanation: 'useCallback returns a memoized version of the callback function that only changes if its dependencies change.' },
        { question: 'What is a controlled component?', options: ['A component with access control', 'A form element whose value is controlled by React state', 'A component wrapped in ErrorBoundary', 'A component with lifecycle methods'], correctAnswer: 1, explanation: 'A controlled component is a form element whose value is driven by React state, with changes handled through event handlers.' },
        { question: 'What is the Reconciliation process in React?', options: ['Merging git branches', 'The algorithm React uses to diff and update the DOM efficiently', 'Resolving state conflicts', 'Combining multiple contexts'], correctAnswer: 1, explanation: 'Reconciliation is React\'s diffing algorithm that compares virtual DOM trees to determine the minimum number of changes needed to update the real DOM.' },
      ],
      codingQuestions: [
        { question: 'Build a custom hook useLocalStorage that syncs state with localStorage.', hint: 'Combine useState with localStorage.getItem and localStorage.setItem.', solution: 'function useLocalStorage(key, initialValue) {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n\n  const setValue = (value) => {\n    const valueToStore = value instanceof Function ? value(storedValue) : value;\n    setStoredValue(valueToStore);\n    window.localStorage.setItem(key, JSON.stringify(valueToStore));\n  };\n\n  return [storedValue, setValue];\n}', difficulty: 'medium' },
        { question: 'Create a component that fetches and displays data with loading and error states.', hint: 'Use useState for data, loading, and error states, and useEffect for fetching.', solution: 'function DataFetcher({ url }) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    setLoading(true);\n    fetch(url)\n      .then(res => res.json())\n      .then(data => { setData(data); setLoading(false); })\n      .catch(err => { setError(err.message); setLoading(false); });\n  }, [url]);\n\n  if (loading) return <p>Loading...</p>;\n  if (error) return <p>Error: {error}</p>;\n  return <pre>{JSON.stringify(data, null, 2)}</pre>;\n}', difficulty: 'medium' },
        { question: 'Implement a debounced search input component.', hint: 'Use useEffect with a timeout and cleanup function.', solution: 'function DebouncedSearch({ onSearch }) {\n  const [query, setQuery] = useState("");\n\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      if (query) onSearch(query);\n    }, 300);\n    return () => clearTimeout(timer);\n  }, [query, onSearch]);\n\n  return <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />;\n}', difficulty: 'medium' },
      ],
      hrQuestions: [
        { question: 'How do you optimize React application performance?', sampleAnswer: 'I use React.memo, useMemo, useCallback for memoization, implement code splitting with React.lazy, virtualize long lists, and profile with React DevTools...', tips: 'Give concrete techniques with examples of when you applied them.' },
        { question: 'How do you handle disagreements about technical approaches with teammates?', sampleAnswer: 'I present my reasoning backed by data, listen to alternative viewpoints, and focus on finding the best solution rather than winning an argument. If needed, we prototype both approaches...', tips: 'Demonstrate maturity and focus on constructive outcomes.' },
        { question: 'How do you ensure code quality in a React project?', sampleAnswer: 'I implement ESLint with strict rules, write unit tests with React Testing Library, use TypeScript for type safety, conduct code reviews, and maintain a component library with Storybook...', tips: 'Mention specific tools and processes you use.' },
      ],
      technicalQuestions: [
        { question: 'Explain the useReducer hook and when to use it over useState.', answer: 'useReducer manages complex state logic with a reducer function, similar to Redux. Use it when state transitions depend on previous state, when state has multiple sub-values, or when the update logic is complex.', topic: 'hooks' },
        { question: 'What are React portals?', answer: 'Portals render children into a DOM node outside the parent component\'s DOM hierarchy while preserving the React context and event bubbling. Common use cases include modals, tooltips, and floating menus.', topic: 'advanced' },
        { question: 'How does React handle batching of state updates?', answer: 'React 18+ automatically batches all state updates, including those in promises, timeouts, and event handlers. Multiple setState calls in the same event handler result in a single re-render.', topic: 'performance' },
        { question: 'What is the difference between useMemo and useCallback?', answer: 'useMemo memoizes a computed value, while useCallback memoizes a function reference. useMemo returns the result of calling the function, useCallback returns the function itself.', topic: 'hooks' },
      ],
      followUpQuestions: [
        { question: 'How would you handle global state without Redux?', context: 'After discussing Context API', expectedAnswer: 'Use Context API with useReducer for complex state. For simpler needs, combine multiple contexts. For performance-critical apps, consider Zustand or Jotai. Lift state appropriately and use composition to minimize prop drilling.' },
        { question: 'What are the pitfalls of overusing React.memo?', context: 'After discussing performance optimization', expectedAnswer: 'React.memo adds overhead for prop comparison. If props change frequently or are complex objects, the comparison cost outweighs re-render savings. It should be used selectively, guided by profiling data.' },
        { question: 'How do you handle error boundaries in functional components?', context: 'After discussing error handling', expectedAnswer: 'Error boundaries currently require class components with componentDidCatch/getDerivedStateFromError. In functional components, you can use libraries like react-error-boundary that provide a wrapper component and useErrorBoundary hook.' },
      ],
    },
    hard: {
      mcqs: [
        { question: 'What is the purpose of React.forwardRef?', options: ['Forwarding emails', 'Passing a ref through a component to a child element', 'Creating forward navigation', 'Forwarding props'], correctAnswer: 1, explanation: 'React.forwardRef allows you to pass a ref through a component to one of its child elements, enabling parent components to access child DOM nodes.' },
        { question: 'What is Concurrent Mode in React?', options: ['Running React in multiple threads', 'A rendering strategy that allows React to interrupt, pause, and resume rendering work', 'Using multiple React instances', 'Server-side rendering'], correctAnswer: 1, explanation: 'Concurrent Mode enables React to work on multiple tasks simultaneously, pausing and resuming work based on priority, enabling features like Suspense and transitions.' },
        { question: 'What is the purpose of useImperativeHandle?', options: ['Handling imperative code', 'Customizing the instance value exposed to parent components when using ref', 'Managing side effects', 'Creating imperative APIs'], correctAnswer: 1, explanation: 'useImperativeHandle customizes the ref value exposed to parent components, allowing you to expose specific methods instead of the entire DOM node.' },
        { question: 'What is a Higher-Order Component (HOC)?', options: ['A component at the top of the tree', 'A function that takes a component and returns a new component with enhanced functionality', 'A component with higher priority', 'A class component'], correctAnswer: 1, explanation: 'A HOC is an advanced pattern where a function takes a component and returns a new component with additional props or behavior.' },
        { question: 'What does React.lazy() do?', options: ['Makes components lazy', 'Enables dynamic import of components for code splitting', 'Delays state updates', 'Creates lazy-loaded images'], correctAnswer: 1, explanation: 'React.lazy() enables dynamic import of components, allowing code splitting and loading components on demand, reducing the initial bundle size.' },
      ],
      codingQuestions: [
        { question: 'Implement a custom hook useIntersectionObserver for lazy-loading elements.', hint: 'Use the IntersectionObserver API with useRef and useEffect.', solution: 'function useIntersectionObserver(options = {}) {\n  const [entry, setEntry] = useState(null);\n  const [node, setNode] = useState(null);\n\n  const observer = useRef(null);\n\n  useEffect(() => {\n    if (observer.current) observer.current.disconnect();\n    observer.current = new IntersectionObserver(([entry]) => setEntry(entry), options);\n    if (node) observer.current.observe(node);\n    return () => observer.current.disconnect();\n  }, [node, options.threshold, options.root, options.rootMargin]);\n\n  return [setNode, entry];\n}', difficulty: 'hard' },
        { question: 'Build a recursive tree component that renders nested data with expand/collapse functionality.', hint: 'Use recursion and state to track expanded nodes.', solution: 'function TreeNode({ node, level = 0 }) {\n  const [isExpanded, setIsExpanded] = useState(false);\n  const hasChildren = node.children && node.children.length > 0;\n\n  return (\n    <div style={{ marginLeft: level * 20 }}>\n      <div onClick={() => hasChildren && setIsExpanded(!isExpanded)}>\n        {hasChildren && (isExpanded ? "▼ " : "▶ ")}\n        {node.label}\n      </div>\n      {isExpanded && hasChildren && node.children.map((child, i) => (\n        <TreeNode key={i} node={child} level={level + 1} />\n      ))}\n    </div>\n  );\n}', difficulty: 'hard' },
        { question: 'Create a virtualized list component that only renders visible items.', hint: 'Calculate visible range based on scroll position, container height, and item height.', solution: 'function VirtualList({ items, itemHeight, containerHeight }) {\n  const [scrollTop, setScrollTop] = useState(0);\n  const startIndex = Math.floor(scrollTop / itemHeight);\n  const visibleCount = Math.ceil(containerHeight / itemHeight) + 1;\n  const endIndex = Math.min(startIndex + visibleCount, items.length);\n  const totalHeight = items.length * itemHeight;\n  const visibleItems = items.slice(startIndex, endIndex);\n\n  return (\n    <div style={{ height: containerHeight, overflow: "auto" }} onScroll={e => setScrollTop(e.target.scrollTop)}>\n      <div style={{ height: totalHeight, position: "relative" }}>\n        {visibleItems.map((item, i) => (\n          <div key={startIndex + i} style={{ position: "absolute", top: (startIndex + i) * itemHeight, height: itemHeight }}>\n            {item}\n          </div>\n        ))}\n      </div>\n    </div>\n  );\n}', difficulty: 'hard' },
      ],
      hrQuestions: [
        { question: 'How would you lead the migration of a large legacy React codebase?', sampleAnswer: 'I would create a phased migration plan, starting with setting up tooling and types. Migrate leaf components first, add tests before migrating, use the adapter pattern for gradual transition...', tips: 'Show strategic thinking, risk mitigation, and team coordination.' },
        { question: 'Describe your approach to building a design system in React.', sampleAnswer: 'I start with design tokens, build atomic components with consistent APIs, add Storybook for documentation, ensure accessibility, and publish as an npm package with versioning...', tips: 'Demonstrate knowledge of design systems, component libraries, and systematic thinking.' },
        { question: 'How do you handle performance issues in large-scale React applications?', sampleAnswer: 'I profile with React DevTools, identify unnecessary renders, implement virtualization for lists, use code splitting, optimize bundle size with tree shaking, and implement SSR for critical pages...', tips: 'Provide a systematic approach with measurable outcomes.' },
      ],
      technicalQuestions: [
        { question: 'Explain React Server Components and their benefits.', answer: 'Server Components render on the server, reducing bundle size by keeping server-only code out of the client bundle. They can directly access databases and filesystem, stream to the client, and interleave with Client Components for interactive parts.', topic: 'architecture' },
        { question: 'How does React Fiber architecture work?', answer: 'Fiber is a reimplementation of React\'s core algorithm. It uses a linked-list tree of fiber nodes to enable incremental rendering, allowing work to be split into chunks and spread across multiple frames, with priority-based scheduling.', topic: 'internals' },
        { question: 'What is the difference between SSR, SSG, and ISR?', answer: 'SSR renders on each request (dynamic). SSG generates static HTML at build time (fast, cacheable). ISR combines both by statically generating pages but revalidating them at specified intervals, offering both performance and freshness.', topic: 'rendering' },
        { question: 'How would you implement micro-frontends with React?', answer: 'Use Module Federation for runtime integration, or iframe-based isolation. Share common dependencies, use a shell application for routing, implement cross-app communication via custom events or shared state, and ensure independent deployment.', topic: 'architecture' },
      ],
      followUpQuestions: [
        { question: 'What are the trade-offs of Server Components vs Client Components?', context: 'After discussing Server Components', expectedAnswer: 'Server Components cannot use hooks, event handlers, or browser APIs. They reduce bundle size and enable direct data access but require careful component tree design. Mix both based on interactivity needs.' },
        { question: 'How does Suspense work under the hood?', context: 'After discussing concurrent features', expectedAnswer: 'Suspense catches promises thrown during rendering. When a component throws a promise (via lazy or data fetching), React suspends that subtree, shows the fallback, and resumes rendering when the promise resolves. It integrates with the concurrent scheduler.' },
        { question: 'How would you implement optimistic updates in React?', context: 'After discussing state management', expectedAnswer: 'Update the UI immediately with the expected result before the server confirms. If the server request fails, roll back to the previous state. Use React Query\'s onMutate/onError or implement manually with try/catch and state snapshots.' },
      ],
    },
  },
  node: {
    easy: {
      mcqs: [
        { question: 'What is Node.js?', options: ['A frontend framework', 'A JavaScript runtime built on Chrome\'s V8 engine', 'A database', 'A CSS library'], correctAnswer: 1, explanation: 'Node.js is a JavaScript runtime environment that executes JavaScript code outside the browser, built on Chrome\'s V8 JavaScript engine.' },
        { question: 'Which module is used to create a web server in Node.js?', options: ['fs', 'http', 'path', 'os'], correctAnswer: 1, explanation: 'The http module provides functionality to create HTTP servers and handle requests and responses.' },
        { question: 'What does npm stand for?', options: ['Node Package Manager', 'New Project Manager', 'Node Process Module', 'Network Protocol Manager'], correctAnswer: 0, explanation: 'npm stands for Node Package Manager and is used to install, share, and manage packages.' },
        { question: 'Which function is used to include modules in Node.js?', options: ['include()', 'require()', 'import()', 'fetch()'], correctAnswer: 1, explanation: 'require() is the CommonJS function used to include modules in Node.js. ES modules use import statements.' },
        { question: 'What is the purpose of package.json?', options: ['To store data', 'To define project metadata and dependencies', 'To configure the server', 'To store user sessions'], correctAnswer: 1, explanation: 'package.json contains project metadata, scripts, dependencies, and configuration for Node.js projects.' },
      ],
      codingQuestions: [
        { question: 'Create a simple HTTP server that responds with "Hello World" on port 3000.', hint: 'Use the http module and createServer.', solution: 'const http = require("http");\n\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { "Content-Type": "text/plain" });\n  res.end("Hello World");\n});\n\nserver.listen(3000, () => console.log("Server running on port 3000"));', difficulty: 'easy' },
        { question: 'Write a function that reads a file and logs its contents.', hint: 'Use fs.readFile with utf8 encoding.', solution: 'const fs = require("fs");\n\nfunction readFileContents(filePath) {\n  fs.readFile(filePath, "utf8", (err, data) => {\n    if (err) {\n      console.error("Error reading file:", err.message);\n      return;\n    }\n    console.log(data);\n  });\n}', difficulty: 'easy' },
        { question: 'Create an Express route that returns a JSON response.', hint: 'Use express() and app.get().', solution: 'const express = require("express");\nconst app = express();\n\napp.get("/api/hello", (req, res) => {\n  res.json({ message: "Hello from the API!" });\n});\n\napp.listen(3000);', difficulty: 'easy' },
      ],
      hrQuestions: [
        { question: 'Why do you prefer Node.js for backend development?', sampleAnswer: 'Node.js allows me to use JavaScript across the full stack, has excellent npm ecosystem, handles I/O-bound operations efficiently with its event-driven architecture...', tips: 'Be specific about Node.js strengths for your use case.' },
        { question: 'How do you handle pressure during deployments?', sampleAnswer: 'I follow a checklist approach: pre-deployment testing, staging validation, monitoring dashboards, and rollback plans. This systematic approach reduces stress and errors...', tips: 'Show preparedness and systematic thinking.' },
        { question: 'Describe your experience working in an Agile team.', sampleAnswer: 'I participate in sprint planning, daily standups, and retrospectives. I break down tasks, estimate story points, and collaborate closely with QA and product...', tips: 'Give specific examples of Agile practices you follow.' },
      ],
      technicalQuestions: [
        { question: 'What is the Event-Driven architecture in Node.js?', answer: 'Node.js uses an event-driven, non-blocking I/O model. When operations complete, events are emitted and their callbacks are placed in the event queue for processing by the event loop, enabling efficient handling of concurrent operations.', topic: 'core' },
        { question: 'What is middleware in Express?', answer: 'Middleware functions have access to req, res, and next. They execute during the request-response cycle and can modify request/response objects, end the cycle, or call the next middleware.', topic: 'express' },
        { question: 'What is the difference between process.nextTick() and setImmediate()?', answer: 'process.nextTick() callbacks run before any I/O events in the current event loop iteration. setImmediate() callbacks run in the next iteration of the event loop, after I/O events.', topic: 'event-loop' },
        { question: 'What are streams in Node.js?', answer: 'Streams are objects for reading/writing data in chunks rather than loading entire content into memory. Types include Readable, Writable, Duplex, and Transform streams.', topic: 'core' },
      ],
      followUpQuestions: [
        { question: 'When would you choose Node.js over Python for a backend?', context: 'After discussing Node.js strengths', expectedAnswer: 'Choose Node.js for real-time applications (WebSockets, chat), I/O-heavy applications, full-stack JavaScript teams, and microservices. Python is better for CPU-heavy computation, data science, and ML-heavy backends.' },
        { question: 'How does Node.js handle concurrent requests with a single thread?', context: 'After discussing the event loop', expectedAnswer: 'Node.js uses the event loop and libuv\'s thread pool. I/O operations are delegated to the OS or thread pool while the main thread continues processing. Callbacks are executed when operations complete, enabling concurrency without multi-threading.' },
        { question: 'What are the common security vulnerabilities in Express apps?', context: 'After discussing Express middleware', expectedAnswer: 'Common vulnerabilities include XSS, CSRF, SQL/NoSQL injection, broken authentication, rate limiting absence, and insecure headers. Use helmet for headers, validate input, implement rate limiting, sanitize data, and use parameterized queries.' },
      ],
    },
    medium: {
      mcqs: [
        { question: 'What is the purpose of the cluster module?', options: ['File clustering', 'Creating child processes to share server port and utilize multi-core CPUs', 'Database clustering', 'Organizing code into clusters'], correctAnswer: 1, explanation: 'The cluster module allows you to create child processes (workers) that share the same server port, utilizing all CPU cores for improved performance.' },
        { question: 'What is libuv?', options: ['A UI library', 'A cross-platform library that provides the event loop and async I/O for Node.js', 'A testing framework', 'A logging library'], correctAnswer: 1, explanation: 'libuv is the C library that provides the event loop, file system operations, DNS functions, threading, and other async I/O primitives for Node.js.' },
        { question: 'Which pattern does Node.js use for error handling in callbacks?', options: ['Try-catch', 'Error-first callback', 'Promise rejection', 'Event emission'], correctAnswer: 1, explanation: 'Node.js follows the error-first callback convention where the first parameter of a callback is reserved for an error object (null if no error).' },
        { question: 'What is the purpose of the Buffer class?', options: ['To buffer video', 'To handle binary data directly', 'To create cache', 'To manage memory pools'], correctAnswer: 1, explanation: 'The Buffer class is used to handle binary data directly, useful for I/O operations, file handling, and network protocols.' },
        { question: 'What does process.env contain?', options: ['Process information', 'Environment variables', 'Error messages', 'System metrics'], correctAnswer: 1, explanation: 'process.env is an object containing the user environment variables, commonly used for configuration like database URLs and API keys.' },
      ],
      codingQuestions: [
        { question: 'Implement a rate limiter middleware for Express.', hint: 'Use a Map to track request counts per IP with timestamps.', solution: 'function rateLimiter(maxRequests, windowMs) {\n  const requests = new Map();\n  return (req, res, next) => {\n    const ip = req.ip;\n    const now = Date.now();\n    const windowStart = now - windowMs;\n    const requestLog = requests.get(ip) || [];\n    const recentRequests = requestLog.filter(t => t > windowStart);\n    if (recentRequests.length >= maxRequests) {\n      return res.status(429).json({ error: "Too many requests" });\n    }\n    recentRequests.push(now);\n    requests.set(ip, recentRequests);\n    next();\n  };\n}', difficulty: 'medium' },
        { question: 'Create a file upload endpoint with validation using multer and Express.', hint: 'Configure multer with file filter and size limits.', solution: 'const multer = require("multer");\nconst upload = multer({\n  dest: "uploads/",\n  limits: { fileSize: 5 * 1024 * 1024 },\n  fileFilter: (req, file, cb) => {\n    if (file.mimetype.startsWith("image/")) cb(null, true);\n    else cb(new Error("Only images allowed"), false);\n  }\n}).single("image");\n\napp.post("/upload", (req, res) => {\n  upload(req, res, (err) => {\n    if (err) return res.status(400).json({ error: err.message });\n    res.json({ file: req.file });\n  });\n});', difficulty: 'medium' },
        { question: 'Build a simple pub/sub event system using EventEmitter.', hint: 'Extend EventEmitter and add subscribe/publish methods.', solution: 'const EventEmitter = require("events");\n\nclass PubSub extends EventEmitter {\n  subscribe(channel, handler) {\n    this.on(channel, handler);\n    return () => this.off(channel, handler);\n  }\n  publish(channel, data) {\n    this.emit(channel, data);\n  }\n}\n\nconst pubsub = new PubSub();\nconst unsub = pubsub.subscribe("news", data => console.log("Received:", data));\npubsub.publish("news", { title: "Hello" });\nunsub(); // unsubscribe', difficulty: 'medium' },
      ],
      hrQuestions: [
        { question: 'How do you approach debugging production issues in Node.js?', sampleAnswer: 'I use structured logging with correlation IDs, monitoring tools like PM2 or New Relic, and reproduce issues in staging. For critical bugs, I analyze logs, heap dumps, and use remote debugging...', tips: 'Show systematic debugging approach with real tools.' },
        { question: 'Describe a time you improved the performance of a Node.js application.', sampleAnswer: 'I identified a bottleneck in database queries by profiling. I added proper indexing, implemented connection pooling, and introduced Redis caching, reducing response times by 60%...', tips: 'Use specific metrics to demonstrate impact.' },
        { question: 'How do you handle technical debt?', sampleAnswer: 'I document it, prioritize based on impact, allocate sprint time for refactoring, add tests before refactoring, and address it incrementally alongside feature work...', tips: 'Show balance between shipping features and maintaining quality.' },
      ],
      technicalQuestions: [
        { question: 'Explain the difference between Worker Threads and Child Processes.', answer: 'Worker Threads share memory via SharedArrayBuffer and are lighter-weight, suitable for CPU-intensive JavaScript tasks. Child Processes are separate OS processes with their own memory space, useful for running separate programs or scripts.', topic: 'concurrency' },
        { question: 'How does Node.js handle backpressure in streams?', answer: 'When a writable stream cannot process data as fast as it is being produced, it signals backpressure. The write() method returns false when the internal buffer exceeds highWaterMark, and the drain event signals readiness for more data.', topic: 'streams' },
        { question: 'What is the difference between Authentication and Authorization?', answer: 'Authentication verifies identity (who you are) using credentials like passwords or tokens. Authorization determines permissions (what you can do) based on roles, policies, or access control lists.', topic: 'security' },
        { question: 'Explain connection pooling in Node.js.', answer: 'Connection pooling maintains a cache of database connections for reuse. Instead of opening and closing connections per request, connections are borrowed from the pool and returned after use, reducing connection overhead and improving performance.', topic: 'database' },
      ],
      followUpQuestions: [
        { question: 'How would you implement graceful shutdown in a Node.js server?', context: 'After discussing production deployment', expectedAnswer: 'Listen for SIGTERM/SIGINT signals, stop accepting new connections, wait for in-flight requests to complete (with a timeout), close database connections, flush logs, and then exit. Use server.close() and drain connection pools.' },
        { question: 'When would you use Worker Threads vs a message queue?', context: 'After discussing concurrency', expectedAnswer: 'Use Worker Threads for CPU-intensive tasks within the same process (image processing, heavy computation). Use message queues (RabbitMQ, SQS) for distributed tasks, cross-service communication, and work that needs persistence and retry logic.' },
        { question: 'How would you implement horizontal scaling for a Node.js app?', context: 'After discussing cluster module', expectedAnswer: 'Use a load balancer (Nginx, AWS ALB) in front of multiple Node.js instances. Externalize sessions (Redis), use sticky sessions if needed, share state through a database or cache, and ensure stateless application design.' },
      ],
    },
    hard: {
      mcqs: [
        { question: 'What is the role of the V8 TurboFan compiler in Node.js?', options: ['Compresses files', 'An optimizing JIT compiler that generates highly optimized machine code for hot functions', 'Manages fan speed', 'Compiles TypeScript'], correctAnswer: 1, explanation: 'TurboFan is V8\'s optimizing JIT compiler that analyzes frequently executed (hot) code paths and generates highly optimized machine code for peak performance.' },
        { question: 'What is the N-API?', options: ['A network API', 'A stable ABI for building native addons independent of V8 version', 'A node package', 'A notification API'], correctAnswer: 1, explanation: 'N-API provides a stable Application Binary Interface for native addons, ensuring they work across Node.js versions without recompilation.' },
        { question: 'What does the --max-old-space-size flag control?', options: ['Disk space', 'Maximum heap size for V8\'s old generation memory', 'Network buffer size', 'File descriptor limit'], correctAnswer: 1, explanation: 'This flag sets the maximum memory (in MB) for V8\'s old generation heap, used for long-lived objects. Default is ~1.5GB on 64-bit systems.' },
        { question: 'What is the purpose of AsyncLocalStorage?', options: ['Storing files', 'Providing a way to create async context that flows through callbacks and promise chains', 'Local file system access', 'Browser storage API'], correctAnswer: 1, explanation: 'AsyncLocalStorage creates stores that flow through the entire async call chain, useful for request-scoped data like user context, request IDs, and tracing.' },
        { question: 'What happens during a "Stop-The-World" GC pause?', options: ['Server crashes', 'All JavaScript execution is paused while garbage collector runs', 'Network stops', 'Logs are flushed'], correctAnswer: 1, explanation: 'During STW pauses, all JavaScript execution is halted while the garbage collector identifies and frees unreachable memory. V8 minimizes these pauses with incremental and concurrent GC strategies.' },
      ],
      codingQuestions: [
        { question: 'Implement a connection pool manager for database connections.', hint: 'Use a queue for pending requests and track active/idle connections.', solution: 'class ConnectionPool {\n  constructor(factory, maxSize = 10) {\n    this.factory = factory;\n    this.maxSize = maxSize;\n    this.pool = [];\n    this.active = 0;\n    this.waiting = [];\n  }\n  async acquire() {\n    if (this.pool.length > 0) {\n      this.active++;\n      return this.pool.pop();\n    }\n    if (this.active < this.maxSize) {\n      this.active++;\n      return await this.factory();\n    }\n    return new Promise(resolve => this.waiting.push(resolve));\n  }\n  release(conn) {\n    if (this.waiting.length > 0) {\n      this.waiting.shift()(conn);\n    } else {\n      this.active--;\n      this.pool.push(conn);\n    }\n  }\n}', difficulty: 'hard' },
        { question: 'Build a streaming JSON parser that handles large files without loading them entirely into memory.', hint: 'Use Transform stream and parse JSON objects as they arrive.', solution: 'const { Transform } = require("stream");\n\nclass JSONLineParser extends Transform {\n  constructor() {\n    super({ objectMode: true });\n    this.buffer = "";\n  }\n  _transform(chunk, encoding, callback) {\n    this.buffer += chunk.toString();\n    const lines = this.buffer.split("\\n");\n    this.buffer = lines.pop();\n    for (const line of lines) {\n      if (line.trim()) {\n        try {\n          this.push(JSON.parse(line));\n        } catch (e) {\n          this.emit("error", new Error(`Invalid JSON: ${line}`));\n        }\n      }\n    }\n    callback();\n  }\n  _flush(callback) {\n    if (this.buffer.trim()) {\n      try { this.push(JSON.parse(this.buffer)); } catch (e) {}\n    }\n    callback();\n  }\n}', difficulty: 'hard' },
        { question: 'Implement a circuit breaker pattern for external API calls.', hint: 'Track failures and open the circuit after a threshold, with a half-open retry state.', solution: 'class CircuitBreaker {\n  constructor(fn, options = {}) {\n    this.fn = fn;\n    this.failureThreshold = options.failureThreshold || 5;\n    this.resetTimeout = options.resetTimeout || 30000;\n    this.state = "CLOSED";\n    this.failures = 0;\n    this.nextRetry = 0;\n  }\n  async call(...args) {\n    if (this.state === "OPEN") {\n      if (Date.now() < this.nextRetry) throw new Error("Circuit is OPEN");\n      this.state = "HALF-OPEN";\n    }\n    try {\n      const result = await this.fn(...args);\n      this.onSuccess();\n      return result;\n    } catch (err) {\n      this.onFailure();\n      throw err;\n    }\n  }\n  onSuccess() { this.failures = 0; this.state = "CLOSED"; }\n  onFailure() {\n    this.failures++;\n    if (this.failures >= this.failureThreshold) {\n      this.state = "OPEN";\n      this.nextRetry = Date.now() + this.resetTimeout;\n    }\n  }\n}', difficulty: 'hard' },
      ],
      hrQuestions: [
        { question: 'How would you architect a system to handle 10 million concurrent connections?', sampleAnswer: 'I would use a multi-tier architecture with load balancers, WebSocket servers with clustering, shared state via Redis, horizontal scaling with auto-scaling groups, and a CDN for static assets...', tips: 'Demonstrate understanding of distributed systems, scaling strategies, and infrastructure.' },
        { question: 'Describe a zero-downtime deployment strategy.', sampleAnswer: 'I implement blue-green deployments with health checks, rolling updates behind a load balancer, database migrations that are backwards-compatible, and feature flags for gradual rollouts...', tips: 'Show practical deployment experience and risk mitigation.' },
        { question: 'How do you ensure reliability in distributed systems?', sampleAnswer: 'I implement circuit breakers, retries with backoff, idempotent operations, health checks, distributed tracing, eventual consistency patterns, and comprehensive monitoring with alerting...', tips: 'Mention specific patterns and tools you have used.' },
      ],
      technicalQuestions: [
        { question: 'Explain how the event loop phases work in Node.js.', answer: 'The event loop has phases: timers (setTimeout/setInterval), pending callbacks (system errors), idle/prepare (internal), poll (I/O), check (setImmediate), and close callbacks. Each phase has a FIFO queue of callbacks. process.nextTick runs between phases.', topic: 'internals' },
        { question: 'How would you implement distributed tracing in microservices?', answer: 'Use a trace ID propagated through request headers. Each service creates spans with timing data and sends them to a collector (Jaeger/Zipkin). Use AsyncLocalStorage for in-process context propagation. Tools like OpenTelemetry standardize this.', topic: 'observability' },
        { question: 'What are the OWASP Top 10 vulnerabilities and how do you prevent them in Node.js?', answer: 'Key ones include Injection (parameterized queries), Broken Auth (JWT, bcrypt), XSS (output encoding, CSP), Insecure Deserialization (validate input), Security Misconfiguration (helmet), and Broken Access Control (middleware guards). Use npm audit for dependency vulnerabilities.', topic: 'security' },
        { question: 'Explain CQRS and Event Sourcing patterns.', answer: 'CQRS separates read and write models for independent scaling. Event Sourcing stores state changes as immutable events rather than current state. Combined, they enable temporal queries, audit trails, and replay capabilities, but add complexity.', topic: 'architecture' },
      ],
      followUpQuestions: [
        { question: 'How would you handle a memory leak in production?', context: 'After discussing V8 memory management', expectedAnswer: 'Take heap snapshots at intervals using --inspect or heapdump module, compare them to find growing objects. Use process.memoryUsage() monitoring. Common causes: event listeners not removed, closures holding references, growing caches without eviction, global variables.' },
        { question: 'What are the trade-offs of using PM2 vs Kubernetes?', context: 'After discussing deployment', expectedAnswer: 'PM2 is simpler for single-server deployments with built-in clustering, monitoring, and auto-restart. Kubernetes handles multi-node orchestration, auto-scaling, service discovery, and rolling updates but has higher complexity and infrastructure costs.' },
        { question: 'How would you design an API gateway in Node.js?', context: 'After discussing microservices', expectedAnswer: 'Implement request routing based on path/headers, authentication/authorization middleware, rate limiting per client, request/response transformation, circuit breaking for downstream services, caching, logging, and monitoring. Use http-proxy or write custom proxy logic.' },
      ],
    },
  },
  python: {
    easy: {
      mcqs: [
        { question: 'What is Python?', options: ['A compiled language', 'An interpreted, high-level programming language', 'A markup language', 'A database system'], correctAnswer: 1, explanation: 'Python is an interpreted, high-level, general-purpose programming language known for its clear syntax and readability.' },
        { question: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2, explanation: 'The def keyword is used to define a function in Python.' },
        { question: 'What is a list in Python?', options: ['A fixed-size array', 'An ordered, mutable collection of items', 'A dictionary', 'A tuple'], correctAnswer: 1, explanation: 'A list is an ordered, mutable collection that can contain items of different types.' },
        { question: 'How do you add an item to the end of a list?', options: ['list.add()', 'list.append()', 'list.insert()', 'list.push()'], correctAnswer: 1, explanation: 'The append() method adds an item to the end of a list.' },
        { question: 'What does len() return?', options: ['The type of an object', 'The number of items in an object', 'The memory size', 'The index of the last item'], correctAnswer: 1, explanation: 'len() returns the number of items in a sequence or collection.' },
      ],
      codingQuestions: [
        { question: 'Write a function that checks if a string is a palindrome.', hint: 'Compare the string with its reverse.', solution: 'def is_palindrome(s):\n    s = s.lower().replace(" ", "")\n    return s == s[::-1]', difficulty: 'easy' },
        { question: 'Write a function that returns the factorial of a number.', hint: 'Use recursion or a loop.', solution: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)', difficulty: 'easy' },
        { question: 'Write a function to find all even numbers in a list.', hint: 'Use list comprehension with modulo.', solution: 'def find_evens(numbers):\n    return [n for n in numbers if n % 2 == 0]', difficulty: 'easy' },
      ],
      hrQuestions: [
        { question: 'Why do you choose Python as your primary language?', sampleAnswer: 'Python\'s readability and extensive library ecosystem make it ideal for rapid development. Its versatility spans web development, data science, automation, and AI...', tips: 'Highlight specific use cases relevant to the role.' },
        { question: 'How do you approach debugging in Python?', sampleAnswer: 'I use pdb for interactive debugging, logging module for structured logs, and write unit tests. For complex issues, I use print statements strategically and IDE debuggers...', tips: 'Mention specific Python debugging tools.' },
        { question: 'What projects have you built with Python?', sampleAnswer: 'I built a REST API with Flask, a data pipeline with pandas, and automated testing scripts. Each project taught me different aspects of Python\'s ecosystem...', tips: 'Focus on diversity of projects and what you learned.' },
      ],
      technicalQuestions: [
        { question: 'What is the difference between a list and a tuple?', answer: 'Lists are mutable (can be changed), use square brackets [], and are slightly slower. Tuples are immutable, use parentheses (), are faster, and can be used as dictionary keys.', topic: 'data-structures' },
        { question: 'What are Python decorators?', answer: 'Decorators are functions that modify the behavior of other functions. They use the @decorator syntax and are commonly used for logging, authentication, caching, and other cross-cutting concerns.', topic: 'functions' },
        { question: 'What is PEP 8?', answer: 'PEP 8 is the Python Enhancement Proposal that defines coding style conventions for Python code, including indentation (4 spaces), naming conventions, line length (79 chars), and import organization.', topic: 'best-practices' },
        { question: 'What is a virtual environment?', answer: 'A virtual environment is an isolated Python environment that allows you to install packages for a specific project without affecting the global Python installation. Created with venv or virtualenv.', topic: 'tooling' },
      ],
      followUpQuestions: [
        { question: 'When would you use a tuple over a list?', context: 'After discussing lists vs tuples', expectedAnswer: 'Use tuples for immutable data (coordinates, RGB values), dictionary keys, function return values with multiple elements, and when you want to signal that the data should not be modified.' },
        { question: 'Can you give an example of a practical decorator?', context: 'After discussing decorators', expectedAnswer: 'A timing decorator: def timer(func): def wrapper(*args): start = time.time(); result = func(*args); print(f"Took {time.time()-start}s"); return result; return wrapper. Apply with @timer.' },
        { question: 'How do you manage dependencies in a Python project?', context: 'After discussing virtual environments', expectedAnswer: 'Use requirements.txt with pip freeze, or modern tools like Poetry/Pipenv for dependency management. Pin versions for reproducibility. Use virtual environments to isolate project dependencies.' },
      ],
    },
    medium: {
      mcqs: [
        { question: 'What is a generator in Python?', options: ['A function that generates random numbers', 'A function that yields values lazily one at a time', 'A class for generating objects', 'A module for code generation'], correctAnswer: 1, explanation: 'A generator is a function that uses yield to produce values lazily, one at a time, instead of computing and storing all values in memory at once.' },
        { question: 'What is the GIL in Python?', options: ['A graphics library', 'The Global Interpreter Lock that prevents multiple threads from executing Python bytecodes simultaneously', 'A garbage collector', 'A GUI toolkit'], correctAnswer: 1, explanation: 'The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once, which limits true parallelism for CPU-bound tasks.' },
        { question: 'What is the difference between __str__ and __repr__?', options: ['They are identical', '__str__ is for end-users, __repr__ is for developers/debugging', '__repr__ is deprecated', '__str__ is for numbers only'], correctAnswer: 1, explanation: '__str__ returns a user-friendly string representation, while __repr__ returns an unambiguous developer-focused string, ideally one that could recreate the object.' },
        { question: 'What does the * operator do in function arguments?', options: ['Multiplication only', 'Packs/unpacks positional arguments', 'Creates pointers', 'Glob pattern matching'], correctAnswer: 1, explanation: '*args collects positional arguments into a tuple, and *iterable unpacks an iterable into positional arguments.' },
        { question: 'What is a context manager?', options: ['A project management tool', 'An object that defines __enter__ and __exit__ methods for with statements', 'A package manager', 'A memory manager'], correctAnswer: 1, explanation: 'Context managers implement __enter__ and __exit__ to manage resources (file handles, locks, connections) and ensure proper cleanup.' },
      ],
      codingQuestions: [
        { question: 'Implement a LRU cache decorator using functools.', hint: 'Use collections.OrderedDict or functools.lru_cache.', solution: 'from functools import wraps\nfrom collections import OrderedDict\n\ndef lru_cache(maxsize=128):\n    def decorator(func):\n        cache = OrderedDict()\n        @wraps(func)\n        def wrapper(*args):\n            if args in cache:\n                cache.move_to_end(args)\n                return cache[args]\n            result = func(*args)\n            cache[args] = result\n            if len(cache) > maxsize:\n                cache.popitem(last=False)\n            return result\n        return wrapper\n    return decorator', difficulty: 'medium' },
        { question: 'Write a generator that yields Fibonacci numbers.', hint: 'Use a while loop with yield.', solution: 'def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\n# Usage: gen = fibonacci(); [next(gen) for _ in range(10)]', difficulty: 'medium' },
        { question: 'Implement a context manager for database connections.', hint: 'Use __enter__ and __exit__ methods or contextlib.', solution: 'from contextlib import contextmanager\n\n@contextmanager\ndef db_connection(url):\n    conn = create_connection(url)\n    try:\n        yield conn\n        conn.commit()\n    except Exception:\n        conn.rollback()\n        raise\n    finally:\n        conn.close()', difficulty: 'medium' },
      ],
      hrQuestions: [
        { question: 'How do you handle Python version compatibility issues?', sampleAnswer: 'I use pyenv for managing Python versions, tox for testing across versions, and follow best practices for writing compatible code. I leverage __future__ imports when needed...', tips: 'Show practical experience with version management tools.' },
        { question: 'Describe your experience with Python testing frameworks.', sampleAnswer: 'I primarily use pytest with fixtures, parametrize, and plugins. I mock external services, aim for high coverage, and integrate tests into CI/CD pipelines...', tips: 'Mention specific frameworks and testing strategies.' },
        { question: 'How do you optimize Python code performance?', sampleAnswer: 'I profile with cProfile, use generators for memory efficiency, leverage built-in functions, consider algorithmic improvements, and use C extensions or Cython for CPU-bound bottlenecks...', tips: 'Mention profiling before optimizing.' },
      ],
      technicalQuestions: [
        { question: 'Explain metaclasses in Python.', answer: 'Metaclasses are classes of classes that define how classes behave. type is the default metaclass. Custom metaclasses can control class creation, modify class attributes, register classes, or enforce patterns like Singleton.', topic: 'advanced' },
        { question: 'What is the MRO (Method Resolution Order)?', answer: 'MRO determines the order in which base classes are searched when looking up a method. Python uses the C3 linearization algorithm. You can view it with ClassName.__mro__ or ClassName.mro().', topic: 'oop' },
        { question: 'How does Python memory management work?', answer: 'Python uses reference counting as the primary mechanism and a cyclic garbage collector for circular references. Objects are allocated on a private heap. The memory manager handles allocation/deallocation with specialized allocators for different object sizes.', topic: 'internals' },
        { question: 'What is the difference between multiprocessing and threading in Python?', answer: 'Threading uses threads that share memory but are limited by the GIL for CPU-bound tasks. Multiprocessing uses separate processes with their own memory space, bypassing the GIL, ideal for CPU-intensive work but with higher overhead.', topic: 'concurrency' },
      ],
      followUpQuestions: [
        { question: 'How would you implement a Singleton pattern in Python?', context: 'After discussing metaclasses', expectedAnswer: 'Using a metaclass: class SingletonMeta(type): _instances = {}; def __call__(cls, *args, **kwargs): if cls not in cls._instances: cls._instances[cls] = super().__call__(*args, **kwargs); return cls._instances[cls]' },
        { question: 'When would you use asyncio over threading?', context: 'After discussing concurrency', expectedAnswer: 'Use asyncio for I/O-bound tasks with many concurrent operations (web scraping, API calls). It has lower overhead than threads. Use threading for blocking I/O or when integrating with libraries that don\'t support async. Use multiprocessing for CPU-bound tasks.' },
        { question: 'How do you handle circular imports in Python?', context: 'After discussing modules', expectedAnswer: 'Restructure code to remove circular dependencies, use import inside functions (lazy import), use typing.TYPE_CHECKING for type-hint-only imports, or consolidate shared items into a common module.' },
      ],
    },
    hard: {
      mcqs: [
        { question: 'What is a descriptor in Python?', options: ['A comment system', 'An object that defines __get__, __set__, or __delete__ methods that control attribute access on another class', 'A documentation tool', 'A file descriptor'], correctAnswer: 1, explanation: 'Descriptors are objects that customize attribute access through __get__, __set__, and __delete__ protocol methods. Properties, static methods, and class methods are implemented as descriptors.' },
        { question: 'What is the difference between __new__ and __init__?', options: ['They are identical', '__new__ creates the instance, __init__ initializes it', '__init__ creates the instance', '__new__ is deprecated'], correctAnswer: 1, explanation: '__new__ is the constructor that creates and returns a new instance. __init__ is the initializer that sets up the already-created instance. __new__ is called before __init__.' },
        { question: 'What is the purpose of __slots__?', options: ['Creating time slots', 'Restricting instance attributes and reducing memory usage by avoiding __dict__', 'Managing thread slots', 'Defining function signatures'], correctAnswer: 1, explanation: '__slots__ tells Python to use a more compact internal representation for instances, explicitly listing allowed attributes and preventing __dict__ creation, saving memory.' },
        { question: 'What is a coroutine in Python?', options: ['A routine that runs in cores', 'A function that can suspend and resume execution using async/await', 'A type of loop', 'A testing routine'], correctAnswer: 1, explanation: 'Coroutines are special functions declared with async def that can suspend execution with await, allowing cooperative multitasking and efficient I/O operations.' },
        { question: 'What is the walrus operator (:=)?', options: ['A comparison operator', 'An assignment expression that assigns and returns a value', 'A bitwise operator', 'A ternary operator'], correctAnswer: 1, explanation: 'The walrus operator := (added in Python 3.8) allows assignment within expressions, reducing code duplication by assigning and using a value in the same expression.' },
      ],
      codingQuestions: [
        { question: 'Implement a thread-safe singleton with double-checked locking in Python.', hint: 'Use threading.Lock and double-check the instance.', solution: 'import threading\n\nclass Singleton:\n    _instance = None\n    _lock = threading.Lock()\n\n    def __new__(cls, *args, **kwargs):\n        if cls._instance is None:\n            with cls._lock:\n                if cls._instance is None:\n                    cls._instance = super().__new__(cls)\n        return cls._instance', difficulty: 'hard' },
        { question: 'Implement a custom async iterator that fetches paginated data.', hint: 'Use __aiter__ and __anext__ methods.', solution: 'class PaginatedFetcher:\n    def __init__(self, url, per_page=10):\n        self.url = url\n        self.per_page = per_page\n        self.page = 0\n        self.done = False\n\n    def __aiter__(self):\n        return self\n\n    async def __anext__(self):\n        if self.done:\n            raise StopAsyncIteration\n        self.page += 1\n        async with aiohttp.ClientSession() as session:\n            async with session.get(f"{self.url}?page={self.page}&per_page={self.per_page}") as resp:\n                data = await resp.json()\n                if not data:\n                    self.done = True\n                    raise StopAsyncIteration\n                return data', difficulty: 'hard' },
        { question: 'Implement a type-safe event system with generics using Python typing.', hint: 'Use TypeVar, Generic, and callable types.', solution: 'from typing import TypeVar, Generic, Callable, List\n\nT = TypeVar("T")\n\nclass Event(Generic[T]):\n    def __init__(self):\n        self._handlers: List[Callable[[T], None]] = []\n\n    def subscribe(self, handler: Callable[[T], None]):\n        self._handlers.append(handler)\n        return lambda: self._handlers.remove(handler)\n\n    def emit(self, data: T):\n        for handler in self._handlers:\n            handler(data)\n\n# Usage:\nclick_event = Event[dict]()\nunsub = click_event.subscribe(lambda data: print(data))\nclick_event.emit({"x": 10, "y": 20})\nunsub()', difficulty: 'hard' },
      ],
      hrQuestions: [
        { question: 'How would you design a data pipeline processing terabytes of data?', sampleAnswer: 'I would use a combination of Apache Kafka for streaming, Apache Spark for distributed processing, Python for orchestration and custom transformations, and S3/GCS for storage...', tips: 'Show understanding of distributed data processing at scale.' },
        { question: 'How do you contribute to the Python community?', sampleAnswer: 'I maintain open-source packages, contribute to CPython documentation, write technical blog posts, speak at PyCon, and mentor Python developers in online communities...', tips: 'Be honest about your contributions, big or small.' },
        { question: 'Describe a time you had to choose between code elegance and performance.', sampleAnswer: 'When processing large datasets, I had to replace elegant list comprehensions with generators and numpy vectorization. I documented why the less readable approach was necessary...', tips: 'Show pragmatic decision-making with clear reasoning.' },
      ],
      technicalQuestions: [
        { question: 'How does Python\'s garbage collector handle circular references?', answer: 'Python\'s cyclic GC uses a generational approach with 3 generations. It periodically traverses objects, identifies reference cycles that are unreachable, and collects them. Objects that survive collections are promoted to older generations. The gc module provides control over this process.', topic: 'internals' },
        { question: 'Explain Python\'s import system and importlib.', answer: 'Python\'s import system uses finders and loaders. sys.meta_path contains finders that locate modules, and loaders that load them. importlib provides programmatic import control, custom importers, and the ability to reload modules. __import__ is the built-in function underlying import statements.', topic: 'internals' },
        { question: 'What are Abstract Base Classes (ABCs) and when should you use them?', answer: 'ABCs define interfaces that subclasses must implement. Using abc.ABC and @abstractmethod, they enforce contracts at instantiation time. Use them when you need to ensure subclasses implement specific methods, create formal interfaces, or use isinstance checks against an interface.', topic: 'oop' },
        { question: 'How would you implement a custom memory allocator in Python?', answer: 'Override __new__ for custom object allocation. Use ctypes or cffi for low-level memory management. Implement object pools for frequently created/destroyed objects. Use __slots__ to reduce per-instance memory. For extreme cases, write C extensions with custom allocators.', topic: 'advanced' },
      ],
      followUpQuestions: [
        { question: 'How would you debug a memory leak in a long-running Python service?', context: 'After discussing garbage collection', expectedAnswer: 'Use tracemalloc to track allocations, objgraph to find reference chains, gc.get_objects() to inspect live objects. Monitor RSS with psutil. Look for growing collections, unclosed files/connections, circular references with __del__, and C extension leaks.' },
        { question: 'When would you bypass the GIL for performance?', context: 'After discussing the GIL', expectedAnswer: 'Use multiprocessing for CPU-bound parallelism, C extensions that release the GIL (numpy, pandas), ctypes with nogil, or Cython with nogil blocks. For I/O-bound concurrency, asyncio or threading work fine despite the GIL.' },
        { question: 'How would you implement dependency injection in Python?', context: 'After discussing design patterns', expectedAnswer: 'Use constructor injection (passing dependencies as arguments), Python\'s type hints with a DI container (like dependency-injector), or simple factory functions. Python\'s dynamic nature makes DI simpler than in static languages - often just passing functions or objects as arguments suffices.' },
      ],
    },
  },
  database: {
    easy: {
      mcqs: [
        { question: 'What does SQL stand for?', options: ['Simple Query Language', 'Structured Query Language', 'Standard Query Language', 'System Query Language'], correctAnswer: 1, explanation: 'SQL stands for Structured Query Language, used to manage and query relational databases.' },
        { question: 'What is a primary key?', options: ['The first column in a table', 'A unique identifier for each record in a table', 'The most important data field', 'A foreign key reference'], correctAnswer: 1, explanation: 'A primary key uniquely identifies each record in a table and cannot contain NULL values.' },
        { question: 'What is MongoDB?', options: ['A SQL database', 'A NoSQL document database', 'A graph database', 'A key-value store'], correctAnswer: 1, explanation: 'MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents.' },
        { question: 'What does CRUD stand for?', options: ['Create, Run, Update, Deploy', 'Create, Read, Update, Delete', 'Copy, Read, Upload, Delete', 'Create, Remove, Update, Display'], correctAnswer: 1, explanation: 'CRUD stands for Create, Read, Update, Delete - the four basic operations of persistent storage.' },
        { question: 'What is an index in a database?', options: ['A table of contents', 'A data structure that improves query performance on specific columns', 'A row number', 'A backup system'], correctAnswer: 1, explanation: 'An index is a data structure that speeds up data retrieval operations on a database table by providing quick access paths to rows.' },
      ],
      codingQuestions: [
        { question: 'Write a MongoDB query to find all users with age greater than 25.', hint: 'Use the $gt operator in the find query.', solution: 'db.users.find({ age: { $gt: 25 } })', difficulty: 'easy' },
        { question: 'Write a SQL query to select all columns from a "products" table where price is less than 100.', hint: 'Use SELECT * with WHERE clause.', solution: 'SELECT * FROM products WHERE price < 100;', difficulty: 'easy' },
        { question: 'Write a Mongoose schema for a blog post with title, content, author, and date fields.', hint: 'Use mongoose.Schema with appropriate types.', solution: 'const mongoose = require("mongoose");\n\nconst PostSchema = new mongoose.Schema({\n  title: { type: String, required: true },\n  content: { type: String, required: true },\n  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },\n  date: { type: Date, default: Date.now }\n});', difficulty: 'easy' },
      ],
      hrQuestions: [
        { question: 'When would you choose MongoDB over a relational database?', sampleAnswer: 'I would choose MongoDB for flexible schemas, rapid prototyping, document-oriented data, horizontal scaling needs, and when the data model naturally fits a document structure...', tips: 'Give specific use cases and trade-offs.' },
        { question: 'How do you ensure data integrity in your applications?', sampleAnswer: 'I use database constraints, transactions, application-level validation, input sanitization, and proper error handling. I also implement backups and monitoring...', tips: 'Cover both database-level and application-level strategies.' },
        { question: 'Describe your experience with database migrations.', sampleAnswer: 'I use migration tools like Flyway/Knex for schema changes, test migrations in staging first, ensure backwards compatibility, and maintain rollback scripts...', tips: 'Emphasize careful planning and testing.' },
      ],
      technicalQuestions: [
        { question: 'What is normalization?', answer: 'Normalization is the process of organizing data to minimize redundancy. Normal forms (1NF, 2NF, 3NF, BCNF) progressively eliminate data anomalies by ensuring atomic values, removing partial dependencies, and eliminating transitive dependencies.', topic: 'design' },
        { question: 'What is the difference between SQL and NoSQL databases?', answer: 'SQL databases are relational with fixed schemas, ACID compliance, and use SQL. NoSQL databases are non-relational with flexible schemas, eventual consistency options, and include document, key-value, column-family, and graph types.', topic: 'fundamentals' },
        { question: 'What is a JOIN in SQL?', answer: 'A JOIN combines rows from two or more tables based on related columns. Types include INNER JOIN (matching rows), LEFT JOIN (all left + matching right), RIGHT JOIN (all right + matching left), and FULL JOIN (all from both).', topic: 'queries' },
        { question: 'What is an ORM?', answer: 'An Object-Relational Mapping (ORM) converts between programming language objects and database tables. Examples include Sequelize (Node.js), SQLAlchemy (Python), and Mongoose (MongoDB ODM). ORMs abstract SQL queries into method calls.', topic: 'tools' },
      ],
      followUpQuestions: [
        { question: 'What are the downsides of normalization?', context: 'After discussing normalization', expectedAnswer: 'Over-normalization leads to many JOINs, increasing query complexity and reducing performance. For read-heavy workloads, some denormalization can improve performance by reducing JOINs at the cost of data redundancy and update complexity.' },
        { question: 'When would you choose a graph database?', context: 'After discussing NoSQL types', expectedAnswer: 'Graph databases excel for highly connected data: social networks, recommendation engines, knowledge graphs, fraud detection. They efficiently traverse relationships without expensive JOINs. Examples: Neo4j, Amazon Neptune.' },
        { question: 'What are the limitations of ORMs?', context: 'After discussing ORMs', expectedAnswer: 'ORMs can generate inefficient queries (N+1 problem), add abstraction overhead, make complex queries harder to write, and may not support all database-specific features. For performance-critical queries, raw SQL is often better.' },
      ],
    },
    medium: {
      mcqs: [
        { question: 'What is ACID in databases?', options: ['A chemical property', 'Atomicity, Consistency, Isolation, Durability', 'Advanced Configuration for Integrated Databases', 'Automated Concurrent Index Distribution'], correctAnswer: 1, explanation: 'ACID properties ensure reliable database transactions: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).' },
        { question: 'What is sharding?', options: ['Deleting data', 'Distributing data across multiple database instances horizontally', 'Compressing data', 'Encrypting data'], correctAnswer: 1, explanation: 'Sharding distributes data across multiple servers/instances based on a shard key, enabling horizontal scaling for large datasets.' },
        { question: 'What is the CAP theorem?', options: ['A database cap on size', 'A theorem stating distributed systems can provide at most 2 of 3: Consistency, Availability, Partition tolerance', 'A capping algorithm', 'A concurrency control pattern'], correctAnswer: 1, explanation: 'The CAP theorem states that in the presence of a network partition, a distributed system must choose between consistency and availability.' },
        { question: 'What is a database transaction?', options: ['A financial record', 'A unit of work that is either completed entirely or not at all', 'A data transfer', 'A query optimization'], correctAnswer: 1, explanation: 'A transaction is a sequence of operations treated as a single logical unit of work, ensuring data integrity through ACID properties.' },
        { question: 'What is an aggregation pipeline in MongoDB?', options: ['A data pipeline tool', 'A framework for transforming and analyzing documents through sequential stages', 'A backup pipeline', 'A replication method'], correctAnswer: 1, explanation: 'MongoDB\'s aggregation pipeline processes documents through sequential stages ($match, $group, $sort, $project, etc.) for complex data transformations and analysis.' },
      ],
      codingQuestions: [
        { question: 'Write a MongoDB aggregation pipeline to group orders by customer and calculate total spending.', hint: 'Use $group with $sum accumulator.', solution: 'db.orders.aggregate([\n  { $group: {\n    _id: "$customerId",\n    totalSpent: { $sum: "$amount" },\n    orderCount: { $sum: 1 },\n    avgOrder: { $avg: "$amount" }\n  }},\n  { $sort: { totalSpent: -1 } }\n])', difficulty: 'medium' },
        { question: 'Write a SQL query to find the second highest salary.', hint: 'Use subquery or LIMIT/OFFSET.', solution: 'SELECT MAX(salary) as second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\n-- Alternative:\nSELECT salary FROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;', difficulty: 'medium' },
        { question: 'Implement a Mongoose middleware that automatically updates a "lastModified" field.', hint: 'Use pre-save hook.', solution: 'const schema = new mongoose.Schema({\n  data: String,\n  lastModified: Date\n});\n\nschema.pre("save", function(next) {\n  this.lastModified = new Date();\n  next();\n});\n\nschema.pre("findOneAndUpdate", function(next) {\n  this.set({ lastModified: new Date() });\n  next();\n});', difficulty: 'medium' },
      ],
      hrQuestions: [
        { question: 'How do you handle database performance issues?', sampleAnswer: 'I start by analyzing slow query logs, add appropriate indexes, optimize query patterns, implement caching layers, and consider denormalization for read-heavy workloads...', tips: 'Show a systematic approach to performance tuning.' },
        { question: 'Describe a data migration challenge you faced.', sampleAnswer: 'Migrating from a monolithic database to microservice-specific databases required careful data mapping, dual-write strategies, and thorough validation...', tips: 'Focus on the challenges and solutions.' },
        { question: 'How do you ensure database security?', sampleAnswer: 'I implement least-privilege access, encrypt data at rest and in transit, use parameterized queries, regularly audit access logs, and keep database software updated...', tips: 'Cover multiple layers of security.' },
      ],
      technicalQuestions: [
        { question: 'Explain database replication strategies.', answer: 'Master-slave replication sends writes to master and reads to replicas. Multi-master allows writes to any node. Synchronous replication ensures consistency but adds latency. Asynchronous replication is faster but may have data lag.', topic: 'infrastructure' },
        { question: 'What is the N+1 query problem?', answer: 'N+1 occurs when code fetches a list of N items (1 query) then fetches related data for each item individually (N queries). Solved with eager loading, JOINs, or batch queries using $in operator.', topic: 'performance' },
        { question: 'How do MongoDB indexes work?', answer: 'MongoDB uses B-tree indexes by default. Indexes store a subset of fields in sorted order, enabling efficient queries, sorts, and range scans. Types include single-field, compound, multikey (arrays), text, geospatial, and hashed indexes.', topic: 'mongodb' },
        { question: 'What is connection pooling and why is it important?', answer: 'Connection pooling maintains a cache of database connections for reuse. Creating connections is expensive (TCP handshake, auth). Pools reduce this overhead, improve response times, and limit total connections to prevent database overload.', topic: 'performance' },
      ],
      followUpQuestions: [
        { question: 'How would you handle eventual consistency in a distributed system?', context: 'After discussing CAP theorem', expectedAnswer: 'Implement conflict resolution strategies (last-write-wins, vector clocks), use CRDTs for automatic convergence, design idempotent operations, implement read-your-writes consistency where needed, and use event sourcing for audit trails.' },
        { question: 'When should you denormalize data?', context: 'After discussing the N+1 problem', expectedAnswer: 'Denormalize when read performance is critical and the data is read-heavy. Common patterns include embedding related data, caching computed values, and maintaining materialized views. Accept the trade-off of more complex writes and potential data inconsistency.' },
        { question: 'How do you design a schema for a multi-tenant application?', context: 'After discussing database design', expectedAnswer: 'Options: separate databases (best isolation, highest cost), separate schemas (good isolation), shared tables with tenant_id (most efficient). Choice depends on data isolation requirements, scale, compliance needs, and cost constraints.' },
      ],
    },
    hard: {
      mcqs: [
        { question: 'What is MVCC?', options: ['Multi-Version Compiled Code', 'Multi-Version Concurrency Control - allows concurrent reads and writes without locking', 'Multiple Virtual Connection Control', 'Managed Version Control Configuration'], correctAnswer: 1, explanation: 'MVCC allows multiple transactions to access data concurrently by maintaining multiple versions of data. Readers don\'t block writers and vice versa.' },
        { question: 'What is a Write-Ahead Log (WAL)?', options: ['A logging library', 'A technique where changes are written to a log before the actual data, ensuring durability', 'A wall for data protection', 'A write queue'], correctAnswer: 1, explanation: 'WAL ensures durability by writing all changes to a sequential log before modifying the actual data. In case of crashes, the log can be replayed to recover committed transactions.' },
        { question: 'What is a Bloom filter?', options: ['An image filter', 'A space-efficient probabilistic data structure for testing set membership', 'A data cleaning tool', 'A network filter'], correctAnswer: 1, explanation: 'A Bloom filter is a probabilistic data structure that can tell you if an element is definitely not in a set or possibly in a set. Used in databases to avoid unnecessary disk reads.' },
        { question: 'What is the difference between optimistic and pessimistic locking?', options: ['One is positive, one is negative', 'Optimistic assumes no conflicts and checks at commit; pessimistic locks data preemptively', 'They are the same', 'One uses locks, one uses keys'], correctAnswer: 1, explanation: 'Optimistic locking checks for conflicts at commit time using version numbers. Pessimistic locking acquires locks before accessing data. Optimistic is better for low-contention scenarios.' },
        { question: 'What is a LSM tree?', options: ['A binary search tree', 'A Log-Structured Merge tree optimized for write-heavy workloads', 'A linked sorted map', 'A linear scan method'], correctAnswer: 1, explanation: 'LSM trees buffer writes in memory (memtable), flush to sorted disk files (SSTables), and merge them periodically. Used by Cassandra, RocksDB, and LevelDB for high write throughput.' },
      ],
      codingQuestions: [
        { question: 'Design and implement a database connection pool with health checking.', hint: 'Track connection health with periodic pings and auto-replacement of dead connections.', solution: 'class HealthCheckedPool {\n  constructor(factory, maxSize = 10, healthCheckInterval = 30000) {\n    this.factory = factory;\n    this.maxSize = maxSize;\n    this.idle = [];\n    this.active = new Set();\n    this.healthCheck = setInterval(() => this.checkHealth(), healthCheckInterval);\n  }\n  async checkHealth() {\n    for (let i = this.idle.length - 1; i >= 0; i--) {\n      try { await this.idle[i].ping(); }\n      catch { this.idle.splice(i, 1); }\n    }\n  }\n  async acquire() {\n    while (this.idle.length > 0) {\n      const conn = this.idle.pop();\n      try { await conn.ping(); this.active.add(conn); return conn; }\n      catch { continue; }\n    }\n    if (this.active.size < this.maxSize) {\n      const conn = await this.factory();\n      this.active.add(conn); return conn;\n    }\n    throw new Error("Pool exhausted");\n  }\n  release(conn) { this.active.delete(conn); this.idle.push(conn); }\n  async destroy() { clearInterval(this.healthCheck); }\n}', difficulty: 'hard' },
        { question: 'Write an optimized MongoDB aggregation that calculates running totals with window functions.', hint: 'Use $setWindowFields (MongoDB 5.0+) for window operations.', solution: 'db.transactions.aggregate([\n  { $sort: { date: 1 } },\n  { $setWindowFields: {\n    partitionBy: "$accountId",\n    sortBy: { date: 1 },\n    output: {\n      runningTotal: {\n        $sum: "$amount",\n        window: { documents: ["unbounded", "current"] }\n      },\n      movingAvg: {\n        $avg: "$amount",\n        window: { documents: [-6, 0] }\n      }\n    }\n  }}\n])', difficulty: 'hard' },
        { question: 'Implement a simple in-memory B-tree index supporting insert, search, and range queries.', hint: 'Use a sorted array with binary search for a simplified B-tree node.', solution: 'class BTreeIndex {\n  constructor() { this.data = []; }\n  insert(key, value) {\n    const idx = this._bisect(key);\n    this.data.splice(idx, 0, { key, value });\n  }\n  search(key) {\n    const idx = this._bisect(key);\n    if (idx < this.data.length && this.data[idx].key === key)\n      return this.data[idx].value;\n    return null;\n  }\n  range(start, end) {\n    const startIdx = this._bisect(start);\n    const results = [];\n    for (let i = startIdx; i < this.data.length && this.data[i].key <= end; i++)\n      results.push(this.data[i]);\n    return results;\n  }\n  _bisect(key) {\n    let lo = 0, hi = this.data.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.data[mid].key < key) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n}', difficulty: 'hard' },
      ],
      hrQuestions: [
        { question: 'How would you design a database strategy for a globally distributed application?', sampleAnswer: 'I would use multi-region deployment with CockroachDB or DynamoDB Global Tables, implement conflict resolution, use CDN caching for reads, and design for partition tolerance with regional failover...', tips: 'Show understanding of global distribution challenges.' },
        { question: 'Describe how you would handle a database outage in production.', sampleAnswer: 'Immediate: activate runbook, switch to read replica, enable cached responses. Short-term: identify root cause, restore from backups if needed. Post-mortem: document timeline, implement safeguards...', tips: 'Show incident response methodology and composure.' },
        { question: 'How do you make database architecture decisions for new projects?', sampleAnswer: 'I analyze data access patterns, consistency requirements, scale projections, team expertise, and operational costs. I prototype with the top candidates and benchmark against expected workloads...', tips: 'Demonstrate systematic decision-making.' },
      ],
      technicalQuestions: [
        { question: 'Explain the internals of a B+ tree index.', answer: 'B+ trees store data only in leaf nodes (linked for range scans), with internal nodes containing only keys for routing. They have high fan-out (many keys per node), minimizing disk I/O. Typically 3-4 levels deep for billions of rows. Balanced height ensures O(log n) lookups.', topic: 'internals' },
        { question: 'How does MongoDB\'s WiredTiger storage engine work?', answer: 'WiredTiger uses B-trees for indexes, LSM trees for some workloads, MVCC for concurrent access, and document-level locking. It supports compression (snappy, zlib, zstd), encryption at rest, and checkpoint-based durability with journaling.', topic: 'mongodb-internals' },
        { question: 'What is consensus in distributed databases?', answer: 'Consensus protocols (Raft, Paxos) ensure all nodes agree on data state. A leader accepts writes and replicates to followers. Writes are committed when a majority (quorum) acknowledges. Leader election occurs on leader failure.', topic: 'distributed' },
        { question: 'How would you design a time-series database schema?', answer: 'Use bucket pattern: group measurements by time window per device. Partition by time for efficient range queries and data expiration. Pre-aggregate for common queries. Use columnar storage for compression. Index on device_id + timestamp.', topic: 'design' },
      ],
      followUpQuestions: [
        { question: 'How would you migrate from MongoDB to PostgreSQL?', context: 'After discussing database trade-offs', expectedAnswer: 'Analyze document schemas to design relational tables, handle embedded documents (normalize or use JSONB), build ETL pipeline with validation, run dual-write during transition, benchmark queries, migrate in phases starting with less critical data, and maintain rollback capability.' },
        { question: 'How do you handle hot partitions in a sharded database?', context: 'After discussing sharding', expectedAnswer: 'Identify hot shard keys through monitoring. Strategies: use composite shard keys, add random prefixes (scatter-gather), time-based rotation, application-level caching for hot data, or split hot ranges into smaller shards.' },
        { question: 'What are the trade-offs between strong and eventual consistency?', context: 'After discussing consistency models', expectedAnswer: 'Strong consistency: simpler application logic, higher latency, lower availability during partitions. Eventual consistency: lower latency, higher availability, but requires conflict resolution, idempotent operations, and application-level handling of stale reads.' },
      ],
    },
  },
};

/**
 * Default/fallback question set for topics not in the bank
 */
const defaultQuestions = {
  mcqs: [
    { question: 'What is the purpose of version control?', options: ['Backing up files', 'Tracking changes and enabling collaboration on code', 'Compiling code', 'Debugging'], correctAnswer: 1, explanation: 'Version control systems track code changes, enable collaboration, and maintain history of modifications.' },
    { question: 'What does API stand for?', options: ['Application Programming Interface', 'Automated Program Integration', 'Application Process Integration', 'Advanced Programming Interface'], correctAnswer: 0, explanation: 'API stands for Application Programming Interface, defining how software components interact.' },
    { question: 'What is the purpose of unit testing?', options: ['Testing the entire application', 'Testing individual components or functions in isolation', 'Testing the user interface', 'Testing database performance'], correctAnswer: 1, explanation: 'Unit tests verify that individual components work correctly in isolation.' },
    { question: 'What is CI/CD?', options: ['Code Integration/Code Deployment', 'Continuous Integration/Continuous Delivery or Deployment', 'Central Interface/Central Database', 'Common Integration/Common Design'], correctAnswer: 1, explanation: 'CI/CD automates building, testing, and deploying code changes to catch issues early and deliver updates faster.' },
    { question: 'What is a RESTful API?', options: ['A sleeping API', 'An API that follows REST architectural constraints using HTTP methods', 'A GraphQL API', 'A WebSocket API'], correctAnswer: 1, explanation: 'REST APIs use HTTP methods (GET, POST, PUT, DELETE) and follow constraints like statelessness and resource-based URLs.' },
  ],
  codingQuestions: [
    { question: 'Write a function that removes duplicates from an array.', hint: 'Use a Set or filter with indexOf.', solution: 'function removeDuplicates(arr) {\n  return [...new Set(arr)];\n}', difficulty: 'easy' },
    { question: 'Implement a stack data structure with push, pop, and peek operations.', hint: 'Use an array as the underlying storage.', solution: 'class Stack {\n  constructor() { this.items = []; }\n  push(item) { this.items.push(item); }\n  pop() { return this.items.pop(); }\n  peek() { return this.items[this.items.length - 1]; }\n  isEmpty() { return this.items.length === 0; }\n  size() { return this.items.length; }\n}', difficulty: 'medium' },
    { question: 'Write a function to check if two strings are anagrams.', hint: 'Sort both strings and compare, or use character frequency counts.', solution: 'function areAnagrams(str1, str2) {\n  const normalize = s => s.toLowerCase().replace(/\\s/g, "").split("").sort().join("");\n  return normalize(str1) === normalize(str2);\n}', difficulty: 'easy' },
  ],
  hrQuestions: [
    { question: 'Where do you see yourself in 5 years?', sampleAnswer: 'I see myself as a senior engineer or tech lead, contributing to architecture decisions, mentoring junior developers, and building impactful products...', tips: 'Show ambition while being realistic. Connect your goals to the company\'s mission.' },
    { question: 'How do you handle a disagreement with a colleague?', sampleAnswer: 'I listen to understand their perspective, present my reasoning with data, and focus on finding the best solution for the team and project...', tips: 'Emphasize communication, respect, and focus on outcomes over ego.' },
    { question: 'What is your biggest weakness?', sampleAnswer: 'I sometimes spend too much time optimizing code when a simpler solution would suffice. I am learning to balance perfectionism with pragmatism...', tips: 'Be honest but show self-awareness and improvement efforts.' },
  ],
  technicalQuestions: [
    { question: 'What is the difference between a stack and a queue?', answer: 'A stack is LIFO (Last In, First Out) - elements are added and removed from the same end. A queue is FIFO (First In, First Out) - elements are added at the back and removed from the front.', topic: 'data-structures' },
    { question: 'Explain the difference between HTTP and HTTPS.', answer: 'HTTPS encrypts data in transit using TLS/SSL, preventing eavesdropping and tampering. HTTP sends data in plain text. HTTPS requires SSL certificates and uses port 443 vs port 80.', topic: 'networking' },
    { question: 'What is Big O notation?', answer: 'Big O describes the upper bound of an algorithm\'s time or space complexity as input grows. Common complexities: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n), O(n²) quadratic, O(2^n) exponential.', topic: 'algorithms' },
    { question: 'What is the MVC pattern?', answer: 'Model-View-Controller separates an application into: Model (data and business logic), View (user interface), and Controller (handles input and mediates between Model and View).', topic: 'architecture' },
  ],
  followUpQuestions: [
    { question: 'Can you give a real-world example of each time complexity?', context: 'After discussing Big O', expectedAnswer: 'O(1): array access by index. O(log n): binary search. O(n): linear search. O(n log n): merge sort. O(n²): bubble sort. O(2^n): recursive Fibonacci without memoization.' },
    { question: 'How would you choose between a stack and a queue for a specific problem?', context: 'After discussing data structures', expectedAnswer: 'Use a stack for undo/redo, expression parsing, DFS, and backtracking. Use a queue for BFS, task scheduling, message processing, and any FIFO ordering requirement.' },
    { question: 'What are the limitations of the MVC pattern?', context: 'After discussing MVC', expectedAnswer: 'MVC can lead to "fat controllers" or "fat models", tight coupling between components, difficulty testing, and complexity in large applications. Modern variations like MVVM, MVP, or clean architecture address some limitations.' },
  ],
};

/**
 * Generate interview questions based on topic, difficulty, and language
 * @param {string} topic - Interview topic
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {string} language - Programming language
 * @returns {Object} Generated interview questions
 */
async function generateInterviewQuestions(topic = 'javascript', difficulty = 'medium', language = 'javascript') {
  if (process.env.GEMINI_API_KEY) {
    const prompt = `Generate technical interview questions on the topic "${topic}" with difficulty level "${difficulty}" and return a JSON object. The JSON object must match this schema exactly:
{
  "mcqs": [
    { "question": "string", "options": ["string"], "correctAnswer": number (0-3 index), "explanation": "string" }
  ],
  "codingQuestions": [
    { "question": "string", "hint": "string", "solution": "string", "difficulty": "string" }
  ],
  "hrQuestions": [
    { "question": "string", "sampleAnswer": "string", "tips": "string" }
  ],
  "technicalQuestions": [
    { "question": "string", "answer": "string", "topic": "string" }
  ],
  "followUpQuestions": [
    { "question": "string", "context": "string", "expectedAnswer": "string" }
  ]
}

Please provide exactly 5 MCQs, 3 Coding questions, 3 HR questions, 4 Technical questions, and 3 Follow-up questions.`;
    const result = await callGemini(prompt, "You are a technical interviewer. Output valid JSON matching the requested schema.");
    if (result) return result;
  }

  const normalizedTopic = topic.toLowerCase().trim();
  const normalizedDifficulty = difficulty.toLowerCase().trim();


  // Map common topic aliases
  const topicMap = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'javascript',
    typescript: 'javascript',
    react: 'react',
    reactjs: 'react',
    'react.js': 'react',
    node: 'node',
    nodejs: 'node',
    'node.js': 'node',
    express: 'node',
    expressjs: 'node',
    python: 'python',
    py: 'python',
    django: 'python',
    flask: 'python',
    database: 'database',
    db: 'database',
    sql: 'database',
    nosql: 'database',
    mongodb: 'database',
    mongo: 'database',
    mysql: 'database',
    postgresql: 'database',
    postgres: 'database',
  };

  const resolvedTopic = topicMap[normalizedTopic] || 'javascript';
  const validDifficulty = ['easy', 'medium', 'hard'].includes(normalizedDifficulty) ? normalizedDifficulty : 'medium';

  const questions = (questionBank[resolvedTopic] && questionBank[resolvedTopic][validDifficulty]) || defaultQuestions;

  return {
    mcqs: questions.mcqs,
    codingQuestions: questions.codingQuestions,
    hrQuestions: questions.hrQuestions,
    technicalQuestions: questions.technicalQuestions,
    followUpQuestions: questions.followUpQuestions,
  };
}

module.exports = {
  analyzeCode,
  analyzeComplexity,
  detectBugs,
  generateDocumentation,
  generateInterviewQuestions,
};
