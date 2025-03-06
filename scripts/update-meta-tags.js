const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get environment variables or use defaults
const APP_TITLE = process.env.REACT_APP_TITLE || 'aureusDex';
const APP_DESCRIPTION = process.env.REACT_APP_DESCRIPTION || 'aureusDex is a decentralized exchange for the token on the Avalanche network.';
const APP_KEYWORDS = process.env.REACT_APP_KEYWORDS || 'dex, trading, rewards, blockchain';
const APP_OG_IMAGE = process.env.REACT_APP_OG_IMAGE || 'https://aureusdex.xyz/logo192.png';
const APP_URL = process.env.REACT_APP_URL || 'https://aureusdex.xyz';

// Path to the built index.html
const indexPath = path.resolve(__dirname, '../build/index.html');

try {
  // Read the file
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Update title
  html = html.replace(/<title>.*?<\/title>/, `<title>${APP_TITLE}</title>`);
  
  // Check if meta description exists and update it
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${APP_DESCRIPTION}"`);
  } else {
    // Add meta description if it doesn't exist
    html = html.replace('</head>', `  <meta name="description" content="${APP_DESCRIPTION}">\n  </head>`);
  }
  
  // Check if meta keywords exists and update it
  if (html.includes('<meta name="keywords"')) {
    html = html.replace(/<meta name="keywords" content=".*?"/, `<meta name="keywords" content="${APP_KEYWORDS}"`);
  } else {
    // Add meta keywords if it doesn't exist
    html = html.replace('</head>', `  <meta name="keywords" content="${APP_KEYWORDS}">\n  </head>`);
  }
  
  // Update or add Open Graph tags
  if (html.includes('<meta property="og:title"')) {
    html = html.replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${APP_TITLE}"`);
  } else {
    html = html.replace('</head>', `  <meta property="og:title" content="${APP_TITLE}">\n  </head>`);
  }
  
  if (html.includes('<meta property="og:description"')) {
    html = html.replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${APP_DESCRIPTION}"`);
  } else {
    html = html.replace('</head>', `  <meta property="og:description" content="${APP_DESCRIPTION}">\n  </head>`);
  }
  
  if (html.includes('<meta property="og:image"')) {
    html = html.replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${APP_OG_IMAGE}"`);
  } else {
    html = html.replace('</head>', `  <meta property="og:image" content="${APP_OG_IMAGE}">\n  </head>`);
  }
  
  if (html.includes('<meta property="og:url"')) {
    html = html.replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${APP_URL}"`);
  } else {
    html = html.replace('</head>', `  <meta property="og:url" content="${APP_URL}">\n  </head>`);
  }
  
  // Write the updated HTML back to the file
  fs.writeFileSync(indexPath, html);
  
  console.log('✅ Successfully updated meta tags in build/index.html');
} catch (error) {
  console.error('❌ Error updating meta tags:', error);
  process.exit(1);
} 