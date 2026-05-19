import { create } from 'zustand'

const useNewsStore = create((set, get) => ({
  articles: [],
  page: 1,
  totalResults: 0,
  loading: false,
  category: 'general',
  country: 'us',
  pageSize: 9,
  categoryCache: {}, // Stores { [category]: { articles, totalResults, page } }
  
  // Search & Filter states
  searchQuery: '',
  searchHistory: [], // Loaded from localStorage on client side
  dateFilter: 'all', // 'all', 'today', 'week', 'month'
  sourceFilter: 'all',

  setArticles: (articles, cat) => set((state) => {
    const currentCat = cat || state.category;
    return { 
      articles, 
      categoryCache: {
        ...state.categoryCache,
        [currentCat]: { ...state.categoryCache[currentCat], articles, totalResults: state.totalResults, page: state.page }
      }
    }
  }),
  
  appendArticles: (newArticles) => set((state) => {
    const updatedArticles = [...state.articles, ...newArticles];
    return { 
      articles: updatedArticles,
      categoryCache: {
        ...state.categoryCache,
        [state.category]: { ...state.categoryCache[state.category], articles: updatedArticles, totalResults: state.totalResults, page: state.page }
      }
    }
  }),

  setPage: (page) => set((state) => ({ 
    page,
    categoryCache: {
      ...state.categoryCache,
      [state.category]: { ...state.categoryCache[state.category], page }
    }
  })),

  setTotalResults: (totalResults, cat) => set((state) => {
    const currentCat = cat || state.category;
    return { 
      totalResults,
      categoryCache: {
        ...state.categoryCache,
        [currentCat]: { ...state.categoryCache[currentCat], totalResults }
      }
    }
  }),

  setLoading: (loading) => set({ loading }),

  setCategory: (category) => set((state) => {
    // If switching category, reset search query so category news loads cleanly
    if (state.categoryCache[category] && !state.searchQuery && state.dateFilter === 'all' && state.sourceFilter === 'all') {
      const cached = state.categoryCache[category];
      return {
        category,
        searchQuery: '',
        articles: cached.articles,
        totalResults: cached.totalResults,
        page: cached.page,
        loading: false
      }
    }
    return { category, searchQuery: '', articles: [], page: 1, totalResults: 0, loading: true }
  }),

  setCountry: (country) => set({ country, articles: [], page: 1, categoryCache: {}, loading: true }),

  setSearchQuery: (searchQuery) => set((state) => {
    let history = [...state.searchHistory];
    if (searchQuery && !history.includes(searchQuery)) {
      history = [searchQuery, ...history].slice(0, 5); // Keep last 5 searches
      if (typeof window !== 'undefined') {
        localStorage.setItem('news_search_history', JSON.stringify(history));
      }
    }
    return { searchQuery, articles: [], page: 1, categoryCache: {}, searchHistory: history, loading: true };
  }),

  initSearchHistory: () => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('news_search_history');
      if (history) {
        set({ searchHistory: JSON.parse(history) });
      }
    }
  },

  clearSearchHistory: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('news_search_history');
    }
    set({ searchHistory: [] });
  },

  setDateFilter: (dateFilter) => set({ dateFilter, articles: [], page: 1, categoryCache: {}, loading: true }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  resetFilters: () => set({ country: 'us', dateFilter: 'all', sourceFilter: 'all', searchQuery: '', articles: [], page: 1, categoryCache: {}, loading: true })
}))

export default useNewsStore
