const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../_posts');
const configPath = path.join(__dirname, '../_config.yml');
const sitemapPath = path.join(__dirname, '../sitemap.xml');

// Read url from _config.yml
const configContent = fs.readFileSync(configPath, 'utf8');
const urlMatch = configContent.match(/^url:\s*["']?([^"'\r\n\s]+)/m);
if (!urlMatch) {
  console.error('Error: Could not find url in _config.yml');
  process.exit(1);
}
const siteUrl = urlMatch[1].replace(/\/$/, ''); // Remove trailing slash if any

const urls = [];

// Helper to format date to ISO 8601 (YYYY-MM-DDTHH:mm:ss+HH:MM)
function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().replace(/\.\d+Z$/, '+00:00');
  }
  
  const tzOffset = -date.getTimezoneOffset();
  const diff = tzOffset >= 0 ? '+' : '-';
  const pad = num => String(Math.floor(Math.abs(num))).padStart(2, '0');
  
  return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes()) +
    ':' + pad(date.getSeconds()) +
    diff + pad(tzOffset / 60) +
    ':' + pad(tzOffset % 60);
}

// 1. Add Homepage
const stats = fs.statSync(path.join(__dirname, '../index.html'));
urls.push({
  loc: `${siteUrl}/`,
  lastmod: formatDate(stats.mtime)
});

// 2. Add Static Pages
const allowedStatics = [
  { file: 'about.html', url: '/about/' },
  { file: 'contact.html', url: '/contact/' },
  { file: 'disclaimer.html', url: '/disclaimer/' },
  { file: 'privacy.html', url: '/privacy/' },
  { file: 'terms.html', url: '/terms/' },
  { file: 'categories.html', url: '/categories/' },
  { file: 'tags.html', url: '/tags/' }
];

allowedStatics.forEach(item => {
  const filePath = path.join(__dirname, '..', item.file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    urls.push({
      loc: `${siteUrl}${item.url}`,
      lastmod: formatDate(stats.mtime)
    });
  }
});

// 3. Add Category Pages
const categoriesDir = path.join(__dirname, '../_pages/categories');
if (fs.existsSync(categoriesDir)) {
  const files = fs.readdirSync(categoriesDir);
  files.forEach(file => {
    if (!file.endsWith('.md')) return;
    // We only want the main category page, not page-2, page-3 etc.
    if (file.includes('-page-')) return;
    const slug = file.replace('.md', '');
    const stats = fs.statSync(path.join(categoriesDir, file));
    urls.push({
      loc: `${siteUrl}/categories/${slug}/`,
      lastmod: formatDate(stats.mtime)
    });
  });
}

// 4. Add Posts
if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir);
  files.forEach(file => {
    if (!file.endsWith('.md')) return;
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Front matter parser
    const match = content.match(/^---([\s\S]+?)---/);
    if (!match) return;
    
    const lines = match[1].split('\n');
    let dateStr = '';
    let lastModifiedStr = '';
    let sitemapAllowed = true;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('date:')) {
        dateStr = trimmed.split('date:')[1].trim();
      } else if (trimmed.startsWith('last_modified_at:')) {
        lastModifiedStr = trimmed.split('last_modified_at:')[1].trim();
      } else if (trimmed.startsWith('sitemap:')) {
        sitemapAllowed = trimmed.split('sitemap:')[1].trim() !== 'false';
      }
    });
    
    if (!sitemapAllowed) return;
    
    // In Jekyll posts permalinks default to /:title/ or defined per-collection.
    // Let's get the title slug from filename: YYYY-MM-DD-title-slug.md
    const filenameMatch = file.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
    if (!filenameMatch) return;
    const postSlug = filenameMatch[1];
    
    // Use last_modified_at if present, otherwise dateStr, otherwise mtime
    const fileStats = fs.statSync(filePath);
    const postDate = lastModifiedStr || dateStr || fileStats.mtime;
    
    urls.push({
      loc: `${siteUrl}/${postSlug}/`,
      lastmod: formatDate(postDate)
    });
  });
}

// Build XML Content
let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

urls.forEach(item => {
  xmlContent += '  <url>\n';
  xmlContent += `    <loc>${item.loc}</loc>\n`;
  xmlContent += `    <lastmod>${item.lastmod}</lastmod>\n`;
  xmlContent += '  </url>\n';
});

xmlContent += '</urlset>';

fs.writeFileSync(sitemapPath, xmlContent, 'utf8');
console.log(`✓ Sitemap generation complete. Generated ${urls.length} URLs in sitemap.xml`);
