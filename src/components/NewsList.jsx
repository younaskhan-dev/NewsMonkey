'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import InfiniteScroll from 'react-infinite-scroll-component'
import NewsItem from './NewsItem'
import { NewsItemSkeleton } from './NewsItemSkeleton'
import FilterBar from './FilterBar'
import AuthModal from './AuthModal'
import useNewsStore from '@/store/useNewsStore'
import { fetchNews } from '@/lib/newsApi'
import { getUserProfile } from '@/lib/api'
import { cn } from '@/lib/utils'

const NewsList = ({ category }) => {
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const { 
    articles, 
    page, 
    totalResults, 
    loading, 
    searchQuery,
    country,
    dateFilter,
    sourceFilter,
    setArticles, 
    appendArticles, 
    setPage, 
    setTotalResults, 
    setLoading,
    setCategory
  } = useNewsStore()

  // For You tab states
  const [activeTab, setActiveTab] = useState('headlines') // 'headlines' | 'foryou'
  const [userPreferences, setUserPreferences] = useState([])
  const [selectedPref, setSelectedPref] = useState('')
  const [forYouArticles, setForYouArticles] = useState([])
  const [forYouLoading, setForYouLoading] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    let ignore = false;

    const loadInitialNews = async () => {
      const isCached = useNewsStore.getState().categoryCache[category];
      if (!isCached || searchQuery || country !== 'us' || dateFilter !== 'all') {
        setLoading(true)
      }
      setCategory(category)
      
      const data = await fetchNews(category, 1, 9, country, searchQuery, dateFilter)
      
      if (!ignore) {
        if (data && data.articles && data.articles.length > 0) {
          setArticles(data.articles, category)
          setTotalResults(data.totalArticles || data.articles.length, category)
        } else if (data && data.articles?.length === 0) {
          setArticles([], category)
          setTotalResults(0, category)
        }
        setLoading(false)
      }
    }

    loadInitialNews()

    return () => {
      ignore = true
    }
  }, [category, searchQuery, country, dateFilter, setArticles, setLoading, setTotalResults, setCategory])

  // Load For You preferences
  useEffect(() => {
    if (isSignedIn && user?.id && activeTab === 'foryou') {
      loadUserPreferences()
    }
  }, [isSignedIn, user, activeTab])

  const loadUserPreferences = async () => {
    setForYouLoading(true)
    try {
      const profile = await getUserProfile(getToken, user?.id)
      const prefs = profile?.preferences?.length > 0 ? profile.preferences : ['technology', 'business', 'sports']
      setUserPreferences(prefs)
      setSelectedPref(prefs[0])
      
      const data = await fetchNews(prefs[0], 1, 15, country, '', 'all')
      setForYouArticles(data?.articles || [])
    } catch (error) {
      console.error("Error loading user preferences:", error)
    } finally {
      setForYouLoading(false)
    }
  }

  const handlePrefChange = async (pref) => {
    setSelectedPref(pref)
    setForYouLoading(true)
    try {
      const data = await fetchNews(pref, 1, 15, country, '', 'all')
      setForYouArticles(data?.articles || [])
    } catch (error) {
      console.error("Error fetching pref news:", error)
    } finally {
      setForYouLoading(false)
    }
  }

  const fetchMoreData = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    
    const data = await fetchNews(category, nextPage, 9, country, searchQuery, dateFilter)
    
    if (data && data.articles) {
      appendArticles(data.articles)
    }
  }

  // Client-side filtering by source
  const filteredArticles = sourceFilter === 'all' 
    ? articles 
    : articles.filter(a => a.source?.name === sourceFilter)

  return (
    <>
      <FilterBar />
      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Tab Switcher for Home Page - Premium Segmented Control */}
        {category === 'general' && !searchQuery && (
          <div className="flex items-center justify-center p-1.5 bg-muted/60 backdrop-blur-md rounded-full max-w-md mx-auto mb-8 border border-border/50 shadow-inner">
            <button
              onClick={() => setActiveTab('headlines')}
              className={cn(
                "flex-1 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'headlines' ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🔥 Top Headlines
            </button>
            <button
              onClick={() => {
                if (!isSignedIn) {
                  setAuthModalOpen(true)
                  return
                }
                setActiveTab('foryou')
              }}
              className={cn(
                "flex-1 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2",
                activeTab === 'foryou' ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              ✨ For You {isSignedIn ? '' : '🔒'}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold capitalize flex items-center gap-3 tracking-tight">
            {searchQuery ? (
              <span>Search Results for <span className="text-primary">&ldquo;{searchQuery}&rdquo;</span></span>
            ) : activeTab === 'foryou' ? (
              <span>Personalized Feed <span className="text-primary text-lg sm:text-xl">({selectedPref})</span></span>
            ) : category === 'general' ? (
              'Top Headlines'
            ) : (
              `${category} News`
            )}
            {(loading || forYouLoading) && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping shrink-0" />}
          </h1>
          
          {!loading && !forYouLoading && activeTab === 'headlines' && (
            <p className="text-xs sm:text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border/50">
              Showing {filteredArticles.length} of {totalResults} articles
            </p>
          )}
        </div>

        {activeTab === 'foryou' ? (
          <div>
            {/* Preference Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8">
              {userPreferences.map((pref) => (
                <button
                  key={pref}
                  onClick={() => handlePrefChange(pref)}
                  className={cn(
                    "px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold capitalize transition-all shadow-sm",
                    selectedPref === pref ? "bg-primary text-primary-foreground scale-105 shadow-md" : "bg-card border hover:bg-muted text-muted-foreground"
                  )}
                >
                  {pref}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            {forYouLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <NewsItemSkeleton key={i} />
                ))}
              </div>
            ) : forYouArticles.length === 0 ? (
              <div className="text-center py-20 bg-card border rounded-3xl shadow-sm max-w-2xl mx-auto px-4">
                <h3 className="text-xl font-bold mb-2">No personalized articles found</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  We couldn&lsquo;t find articles for &ldquo;{selectedPref}&rdquo;. Try updating your preferences in the dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {forYouArticles.map((article, index) => (
                  <NewsItem
                    key={article.url + index}
                    title={article.title}
                    description={article.description}
                    urlToImage={article.image}
                    url={article.url}
                    author={article.source?.name}
                    publishedAt={article.publishedAt}
                    source={article.source?.name}
                    category={selectedPref}
                  />
                ))}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <NewsItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-3xl shadow-sm max-w-2xl mx-auto px-4">
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              We couldn&lsquo;t find any news matching your current filters or search query. Try adjusting your criteria or resetting filters.
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={filteredArticles.length}
            next={fetchMoreData}
            hasMore={articles.length < totalResults}
            loader={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[...Array(3)].map((_, i) => (
                  <NewsItemSkeleton key={i} />
                ))}
              </div>
            }
            endMessage={
              <p className="text-center text-muted-foreground mt-12 mb-6 font-medium">
                <b>🎉 You have reached the end of the feed!</b>
              </p>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <NewsItem
                  key={article.url + index}
                  title={article.title}
                  description={article.description}
                  urlToImage={article.image}
                  url={article.url}
                  author={article.source?.name}
                  publishedAt={article.publishedAt}
                  source={article.source?.name}
                  category={category}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName="view your personalized feed" 
      />
    </>
  )
}

export default NewsList
