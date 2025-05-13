const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || 'v1.0.0';

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get quotes
app.get('/api/quotes', (req, res) => {
  try {
    const quotesData = fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8');
    const quotes = JSON.parse(quotesData);
    
    // If category parameter is provided, filter quotes by category
    const category = req.query.category;
    let filteredQuotes = quotes;
    
    if (category && category !== 'all') {
      filteredQuotes = quotes.filter(quote => quote.category === category);
    }
    
    res.json({
      quotes: filteredQuotes,
      version: VERSION,
      deployment: process.env.DEPLOYMENT_COLOR || 'unknown'
    });
  } catch (error) {
    console.error('Error reading quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Endpoint to get categories
app.get('/api/categories', (req, res) => {
  try {
    const quotesData = fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8');
    const quotes = JSON.parse(quotesData);
    
    // Extract unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    res.json({
      categories: categories,
      version: VERSION,
      deployment: process.env.DEPLOYMENT_COLOR || 'unknown'
    });
  } catch (error) {
    console.error('Error reading categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check endpoint (useful for deployment checks)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    version: VERSION,
    deployment: process.env.DEPLOYMENT_COLOR || 'unknown'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Quote Generator (${VERSION} - ${process.env.DEPLOYMENT_COLOR || 'unknown'}) running on port ${PORT}`);
});