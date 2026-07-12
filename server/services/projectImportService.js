const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Binary extensions to ignore
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz',
  '.mp4', '.mp3', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.exe', '.dll',
  '.so', '.dylib', '.bin', '.db', '.sqlite'
]);

// Ignored folders and files
const IGNORED_PATHS = [
  'node_modules',
  'bower_components',
  '.git',
  '.github',
  '.vscode',
  'dist',
  'build',
  'out',
  '.next',
  '.nuxt',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml'
];

/**
 * Check if a file is a source code text file
 * @param {string} relativePath 
 * @returns {boolean}
 */
function isSourceFile(relativePath) {
  const parts = relativePath.split(/[/\\]/);
  // Check if any ignored folder is in the path
  if (parts.some(part => IGNORED_PATHS.includes(part))) {
    return false;
  }
  
  const ext = path.extname(relativePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return false;
  }
  
  return true;
}

/**
 * Extract source code from a ZIP archive on disk
 * @param {string} zipFilePath 
 * @returns {string} Concatenated source code
 */
function extractSourceFromZip(zipFilePath) {
  try {
    const zip = new AdmZip(zipFilePath);
    const zipEntries = zip.getEntries();
    let concatenatedCode = '';
    let totalSize = 0;
    const maxSizeLimit = 5 * 1024 * 1024; // 5MB limit
    
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const entryPath = entry.entryName;
      if (!isSourceFile(entryPath)) continue;
      
      const contentBuffer = entry.getData();
      const content = contentBuffer.toString('utf8');
      
      // Make sure it looks like text (doesn't contain null bytes)
      if (content.includes('\u0000')) continue;
      
      const fileHeader = `\n// ==========================================\n// File: ${entryPath}\n// ==========================================\n\n`;
      totalSize += fileHeader.length + content.length;
      
      if (totalSize > maxSizeLimit) {
        concatenatedCode += `\n\n// [Truncated: Project code size exceeds 5MB limit]\n`;
        break;
      }
      
      concatenatedCode += fileHeader + content;
    }
    
    return concatenatedCode;
  } catch (error) {
    console.error('Error extracting zip:', error);
    throw new Error('Failed to extract source code from ZIP: ' + error.message);
  }
}

/**
 * Parse GitHub repository owner and name from a URL
 * @param {string} url 
 * @returns {Object|null} { owner, repo }
 */
function parseGithubUrl(url) {
  try {
    const cleaned = url.trim().replace(/\.git$/, '');
    const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch (error) {
    return null;
  }
}

/**
 * Fetch and extract source code from a public GitHub repository
 * @param {string} githubUrl 
 * @returns {Promise<string>} Concatenated source code
 */
async function extractSourceFromGithub(githubUrl) {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL');
  }
  
  const { owner, repo } = parsed;
  const zipballUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;
  const tempZipPath = path.join(__dirname, `../uploads/projects/github-${owner}-${repo}-${Date.now()}.zip`);
  
  try {
    const response = await fetch(zipballUrl, {
      headers: {
        'User-Agent': 'DevPilotAI-App'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure uploads directory exists
    const dir = path.dirname(tempZipPath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(tempZipPath, buffer);
    
    const code = extractSourceFromZip(tempZipPath);
    
    // Clean up temporary zip file
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
    
    return code;
  } catch (error) {
    // Clean up if temp file was written
    if (fs.existsSync(tempZipPath)) {
      try { fs.unlinkSync(tempZipPath); } catch (e) {}
    }
    console.error('Error fetching github repo:', error);
    throw new Error('Failed to import from GitHub: ' + error.message);
  }
}

module.exports = {
  extractSourceFromZip,
  extractSourceFromGithub,
  parseGithubUrl
};
