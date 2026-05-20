const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

// Cache ongoing or recent requests to prevent React StrictMode double-fetching and API rate limits
const requestCache = new Map();

export const fetchNews = async (
  category = 'general', 
  page = 1, 
  pageSize = 9, 
  country = 'us',
  searchQuery = '',
  dateFilter = 'all'
) => {
  const cacheKey = `${category}-${page}-${pageSize}-${country}-${searchQuery}-${dateFilter}`;
  
  // If there's an ongoing or recently cached request (within 10 minutes), return it
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 600000) {
      return cached.promise;
    }
  }

  let url = '';

  if (searchQuery || dateFilter !== 'all') {
    const query = searchQuery || 'news';
    let fromParam = '';

    if (dateFilter === 'today') {
      fromParam = `&from=${new Date(Date.now() - 86400000).toISOString()}`;
    } else if (dateFilter === 'week') {
      fromParam = `&from=${new Date(Date.now() - 7 * 86400000).toISOString()}`;
    } else if (dateFilter === 'month') {
      fromParam = `&from=${new Date(Date.now() - 30 * 86400000).toISOString()}`;
    }

    url = `${BACKEND_URL}/news/search?q=${encodeURIComponent(query)}&lang=en&country=${country}&max=${pageSize}&page=${page}${fromParam}`;
  } else {
    url = `${BACKEND_URL}/news/top-headlines?category=${category}&lang=en&country=${country}&max=${pageSize}&page=${page}`;
  }
  
  const promise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`News API responded with status: ${response.status}`);
        return { articles: [], totalArticles: 0 };
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("Notice: Could not fetch news from API (possible rate limit or network issue):", error.message);
      return { articles: [], totalArticles: 0 };
    }
  })();

  requestCache.set(cacheKey, { promise, timestamp: Date.now() });
  
  return promise;
};
