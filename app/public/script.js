document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');
    const categorySelect = document.getElementById('category-select');
    const versionInfo = document.getElementById('version-info');
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // State
    let quotes = [];
    let currentCategory = 'all';
    
    // Fetch and populate categories
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            
            // Update version info with deployment color
            versionInfo.textContent = `${data.version} (${data.deployment})`;
            versionInfo.style.backgroundColor = data.deployment === 'blue' ? '#4a90e2' : '#50C878';
            
            // Add categories to select dropdown
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };
    
    // Fetch quotes based on selected category
    const fetchQuotes = async (category = 'all') => {
        try {
            const url = `/api/quotes${category !== 'all' ? `?category=${category}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            
            quotes = data.quotes;
            
            // Show a random quote
            if (quotes.length > 0) {
                displayRandomQuote();
            } else {
                quoteText.textContent = 'No quotes found for this category.';
                quoteAuthor.textContent = '';
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            quoteText.textContent = 'Failed to load quotes.';
            quoteAuthor.textContent = '';
        }
    };
    
    // Display a random quote from the current quotes array
    const displayRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
    };
    
    // Apply theme to document
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);
    };
    
    // Initialize
    const init = () => {
        // Apply saved theme if exists
        const savedTheme = localStorage.getItem('preferred-theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        }
        
        fetchCategories();
        fetchQuotes();
        
        // Event listeners
        newQuoteBtn.addEventListener('click', displayRandomQuote);
        
        categorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            fetchQuotes(currentCategory);
        });
        
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.getAttribute('data-theme');
                applyTheme(theme);
            });
        });
    };
    
    init();
});