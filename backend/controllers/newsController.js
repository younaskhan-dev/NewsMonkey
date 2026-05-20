// Uses native fetch (Node 18+)

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

/**
 * GET /api/news/top-headlines
 * Query params: category, lang, country, max, page
 */
export const getTopHeadlines = async (req, res) => {
  try {
    const { category = 'general', lang = 'en', country = 'us', max = 9, page = 1 } = req.query;

    if (!GNEWS_API_KEY) {
      return res.status(500).json({ message: 'GNews API key not configured on server.' });
    }

    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=${country}&max=${max}&page=${page}&apikey=${GNEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[GNews] top-headlines responded with status: ${response.status}`);
      return res.status(response.status).json({ articles: [], totalArticles: 0 });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('[GNews] Error fetching top-headlines:', error.message);
    return res.status(500).json({ articles: [], totalArticles: 0, message: error.message });
  }
};

/**
 * GET /api/news/search
 * Query params: q, lang, country, max, page, from
 */
export const searchNews = async (req, res) => {
  try {
    const { q = 'news', lang = 'en', country = 'us', max = 9, page = 1, from } = req.query;

    if (!GNEWS_API_KEY) {
      return res.status(500).json({ message: 'GNews API key not configured on server.' });
    }

    const fromParam = from ? `&from=${from}` : '';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=${lang}&country=${country}&max=${max}&page=${page}${fromParam}&apikey=${GNEWS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[GNews] search responded with status: ${response.status}`);
      return res.status(response.status).json({ articles: [], totalArticles: 0 });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('[GNews] Error fetching search:', error.message);
    return res.status(500).json({ articles: [], totalArticles: 0, message: error.message });
  }
};
