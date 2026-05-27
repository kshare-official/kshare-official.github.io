const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../_posts');
const categoriesDir = path.join(__dirname, '../_pages/categories');
const tagsDir = path.join(__dirname, '../_pages/tags');

// Ensure directories exist and are clean
if (fs.existsSync(categoriesDir)) {
  fs.rmSync(categoriesDir, { recursive: true, force: true });
}
fs.mkdirSync(categoriesDir, { recursive: true });

if (fs.existsSync(tagsDir)) {
  fs.rmSync(tagsDir, { recursive: true, force: true });
}
fs.mkdirSync(tagsDir, { recursive: true });

const postsByCategory = {};
const postsByTag = {};

// Helper to slugify
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\- _]+/g, '')
    .replace(/[ _]+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read all posts
const files = fs.readdirSync(postsDir);
files.forEach(file => {
  if (!file.endsWith('.md')) return;
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Simple front matter parser
  const match = content.match(/^---([\s\S]+?)---/);
  if (!match) return;
  
  const frontMatter = match[1];
  const lines = frontMatter.split('\n');
  
  let inCategories = false;
  let inTags = false;
  
  const categories = new Set();
  const tags = new Set();
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('categories:')) {
      const parts = trimmed.split(':');
      if (parts[1] && parts[1].trim()) {
        const val = parts[1].trim();
        if (val.startsWith('[') && val.endsWith(']')) {
          val.slice(1, -1).split(',').forEach(c => categories.add(c.trim().replace(/['"]/g, '')));
        } else {
          categories.add(val.replace(/['"]/g, ''));
        }
      } else {
        inCategories = true;
        inTags = false;
      }
      return;
    }
    
    if (trimmed.startsWith('tags:')) {
      const parts = trimmed.split(':');
      if (parts[1] && parts[1].trim()) {
        const val = parts[1].trim();
        if (val.startsWith('[') && val.endsWith(']')) {
          val.slice(1, -1).split(',').forEach(t => tags.add(t.trim().replace(/['"]/g, '')));
        } else {
          tags.add(val.replace(/['"]/g, ''));
        }
      } else {
        inTags = true;
        inCategories = false;
      }
      return;
    }
    
    if (trimmed.includes(':') && !trimmed.startsWith('-')) {
      inCategories = false;
      inTags = false;
    }
    
    if (inCategories && trimmed.startsWith('-')) {
      categories.add(trimmed.substring(1).trim().replace(/['"]/g, ''));
    }
    
    if (inTags && trimmed.startsWith('-')) {
      tags.add(trimmed.substring(1).trim().replace(/['"]/g, ''));
    }
  });
  
  categories.forEach(c => {
    if (!c) return;
    if (!postsByCategory[c]) postsByCategory[c] = [];
    postsByCategory[c].push(file);
  });
  
  tags.forEach(t => {
    if (!t) return;
    if (!postsByTag[t]) postsByTag[t] = [];
    postsByTag[t].push(file);
  });
});

const pageSize = 10;
let generatedCategoriesCount = 0;
let generatedTagsCount = 0;

// Generate category md files
Object.keys(postsByCategory).forEach(category => {
  if (!category) return;
  const slug = slugify(category);
  const posts = postsByCategory[category];
  const totalPages = Math.ceil(posts.length / pageSize);

  for (let p = 1; p <= totalPages; p++) {
    const filename = p === 1 ? `${slug}.md` : `${slug}-page-${p}.md`;
    const filePath = path.join(categoriesDir, filename);
    const permalink = p === 1 ? `/categories/${slug}/` : `/categories/${slug}/page/${p}/`;
    
    const content = `---
layout: category
title: "${category}${p > 1 ? ` - Page ${p}` : ''}"
description: "Latest posts in ${category} category${p > 1 ? `, page ${p}` : ''}"
permalink: ${permalink}
category_name: "${category}"
page_number: ${p}
total_pages: ${totalPages}
---
`;
    fs.writeFileSync(filePath, content, 'utf8');
    generatedCategoriesCount++;
  }
});

// Generate tag md files
Object.keys(postsByTag).forEach(tag => {
  if (!tag) return;
  const slug = slugify(tag);
  const posts = postsByTag[tag];
  const totalPages = Math.ceil(posts.length / pageSize);

  for (let p = 1; p <= totalPages; p++) {
    const filename = p === 1 ? `${slug}.md` : `${slug}-page-${p}.md`;
    const filePath = path.join(tagsDir, filename);
    const permalink = p === 1 ? `/tags/${slug}/` : `/tags/${slug}/page/${p}/`;
    
    const content = `---
layout: tag
title: "${tag}${p > 1 ? ` - Page ${p}` : ''}"
description: "Posts tagged with ${tag}${p > 1 ? `, page ${p}` : ''}"
permalink: ${permalink}
tag_name: "${tag}"
page_number: ${p}
total_pages: ${totalPages}
---
`;
    fs.writeFileSync(filePath, content, 'utf8');
    generatedTagsCount++;
  }
});

console.log(`Found ${Object.keys(postsByCategory).length} categories (generated ${generatedCategoriesCount} pages).`);
console.log(`Found ${Object.keys(postsByTag).length} tags (generated ${generatedTagsCount} pages).`);
console.log('✓ Archives generation complete.');
