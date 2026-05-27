const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../_posts');
const categoriesDir = path.join(__dirname, '../_pages/categories');
const tagsDir = path.join(__dirname, '../_pages/tags');

// Ensure directories exist
if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}
if (!fs.existsSync(tagsDir)) {
  fs.mkdirSync(tagsDir, { recursive: true });
}

const categories = new Set();
const tags = new Set();

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
    
    // Check if other front matter key starts
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
});

console.log(`Found ${categories.size} categories and ${tags.size} tags.`);

// Generate category md files
categories.forEach(category => {
  if (!category) return;
  const slug = slugify(category);
  const filePath = path.join(categoriesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    const content = `---
layout: category
title: "${category}"
description: "Latest posts in ${category} category"
permalink: /categories/${slug}/
category_name: "${category}"
---
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`+ Generated category archive: _pages/categories/${slug}.md`);
  }
});

// Generate tag md files
tags.forEach(tag => {
  if (!tag) return;
  const slug = slugify(tag);
  const filePath = path.join(tagsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    const content = `---
layout: tag
title: "${tag}"
description: "Posts tagged with ${tag}"
permalink: /tags/${slug}/
tag_name: "${tag}"
---
`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`+ Generated tag archive: _pages/tags/${slug}.md`);
  }
});

console.log('✓ Archives generation complete.');
