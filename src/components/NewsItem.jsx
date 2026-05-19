'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExternalLink, Calendar, User, Clock, Bookmark, BookmarkCheck, MessageSquare, ThumbsUp, Sparkles, Volume2, VolumeX, Pause, Play, Square } from 'lucide-react'
import CommentSection from './CommentSection'
import AuthModal from './AuthModal'
import { addBookmarkAPI, deleteBookmarkAPI, checkBookmarkAPI, toggleLikeAPI, getArticleLikesAPI, getArticleSummaryAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const NewsItem = ({ title, description, urlToImage, url, author, publishedAt, source, category }) => {
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkId, setBookmarkId] = useState(null)
  const [bookmarking, setBookmarking] = useState(false)

  // Like states
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  // AI Summary states
  const [summaryBullets, setSummaryBullets] = useState([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryFetched, setSummaryFetched] = useState(false)

  // Audio Reader states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speechError, setSpeechError] = useState(false)

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalAction, setAuthModalAction] = useState('access this feature')

  // Calculate estimated reading time based on description length
  const wordCount = description ? description.split(/\s+/).length : 20
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  useEffect(() => {
    if (url) {
      loadLikeData()
    }
    if (isSignedIn && url) {
      checkBookmarkStatus()
    }
  }, [isSignedIn, url, user])

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const loadLikeData = async () => {
    try {
      const data = await getArticleLikesAPI(url, user?.id)
      setLikeCount(data.totalLikes)
      setIsLiked(data.isLiked)
    } catch (error) {
      console.error("Error loading like data:", error)
    }
  }

  const checkBookmarkStatus = async () => {
    try {
      const data = await checkBookmarkAPI(getToken, url, user?.id)
      setIsBookmarked(data.isBookmarked)
      if (data.bookmarkId) setBookmarkId(data.bookmarkId)
    } catch (error) {
      console.error("Error checking bookmark status:", error)
    }
  }

  const handleToggleLike = async () => {
    if (!isSignedIn) {
      setAuthModalAction('like articles')
      setAuthModalOpen(true)
      return
    }
    setLiking(true)
    try {
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)

      const data = await toggleLikeAPI(getToken, {
        clerkId: user?.id,
        articleUrl: url,
        title,
      })
      setIsLiked(data.isLiked)
      setLikeCount(data.totalLikes)
    } catch (error) {
      console.error("Error toggling like:", error)
      setIsLiked(isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1))
    } finally {
      setLiking(false)
    }
  }

  const toggleBookmark = async () => {
    if (!isSignedIn) {
      setAuthModalAction('bookmark articles')
      setAuthModalOpen(true)
      return
    }

    setBookmarking(true)
    try {
      if (isBookmarked && bookmarkId) {
        await deleteBookmarkAPI(getToken, bookmarkId, user?.id)
        setIsBookmarked(false)
        setBookmarkId(null)
      } else {
        const added = await addBookmarkAPI(getToken, {
          clerkId: user?.id,
          title,
          description,
          image: urlToImage,
          url,
          publishedAt,
          source,
          category: category || 'general',
        })
        setIsBookmarked(true)
        setBookmarkId(added._id)
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      alert(error.response?.data?.message || "Error updating bookmark")
    } finally {
      setBookmarking(false)
    }
  }

  const handleFetchSummary = async () => {
    if (summaryFetched) return;
    setSummaryLoading(true)
    try {
      const data = await getArticleSummaryAPI({
        articleUrl: url,
        title,
        description,
      })
      setSummaryBullets(data.summaryBullets || [])
      setSummaryFetched(true)
    } catch (error) {
      console.error("Error fetching AI summary:", error)
      alert("Error generating summary. Please try again.")
    } finally {
      setSummaryLoading(false)
    }
  }

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Your browser does not support the Web Speech API for audio playback.")
      return
    }

    // If currently paused, resume
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const textToSpeak = `${title}. ... ${description || 'No detailed description available.'}`
    const utterance = new SpeechSynthesisUtterance(textToSpeak)

    // Configure voice properties
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to find a natural English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB')) || voices[0]
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setSpeechError(false)
    }

    utterance.onpause = () => {
      setIsPlaying(false)
      setIsPaused(true)
    }

    utterance.onresume = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = (e) => {
      // Ignore normal interruptions from stops/pauses
      if (e.error === 'interrupted') {
        return
      }
      console.error("Speech synthesis error:", e)
      setIsPlaying(false)
      setIsPaused(false)
      setSpeechError(true)
    }

    window.speechSynthesis.speak(utterance)
  }

  const handlePauseAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      setIsPaused(true)
    }
  }

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="h-full flex"
    >
      <Card className="flex flex-col h-full w-full overflow-hidden border border-border/50 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-card">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "object-cover w-full h-full transition-all duration-700 hover:scale-105",
              imageLoaded ? "opacity-100 blur-none" : "opacity-0 blur-sm"
            )}
          />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            {category && (
              <Badge className="bg-primary/95 text-primary-foreground backdrop-blur-md px-3 py-1 text-xs font-semibold rounded-full shadow-lg pointer-events-auto capitalize">
                {category}
              </Badge>
            )}
            <Badge className="bg-background/90 text-foreground backdrop-blur-md px-3 py-1 text-xs font-medium rounded-full shadow-lg pointer-events-auto truncate max-w-[150px]">
              {source || 'Unknown Source'}
            </Badge>
          </div>
        </div>

        {/* Header */}
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg font-bold leading-snug line-clamp-2 hover:text-primary transition-colors duration-200">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {title}
            </a>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 max-w-[140px] truncate">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{author || source || 'Editorial'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              {new Date(publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 ml-auto bg-muted px-2 py-1 rounded-md text-foreground/80">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {readingTime} min read
            </span>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 pt-0 flex-grow">
          <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed">
            {description || "No detailed description available for this headline. Click below to read the complete article on the official source website."}
          </p>
        </CardContent>

        {/* Footer - Optimized 2-Tier Mobile & Desktop Layout */}
        <CardFooter className="p-5 pt-0 mt-auto flex flex-col gap-3">
          {/* Top Row: Primary Actions (Read Story + AI Summary + Listen) */}
          <div className="flex items-center gap-1.5 w-full overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button asChild className="flex-1 group rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 min-w-[110px]">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Read Story
                <ExternalLink className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
              </a>
            </Button>

            {/* AI Summary Modal Trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchSummary}
                  className="rounded-xl border-primary/40 bg-primary/5 hover:bg-primary/15 text-primary font-bold transition-all duration-300 flex items-center gap-1.5 px-3 h-10 shrink-0 shadow-sm hover:shadow group"
                  title="AI Executive Summary"
                >
                  <Sparkles className="w-4 h-4 text-primary animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
                  <span className="text-xs font-extrabold hidden sm:inline">AI Summary</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-card border-primary/20 shadow-2xl z-50">
                <DialogHeader className="border-b pb-4 mb-4">
                  <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-primary">
                    <Sparkles className="w-5 h-5 animate-spin" /> AI Executive Summary
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1 font-medium line-clamp-2">
                    {title}
                  </p>
                </DialogHeader>

                {summaryLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-bounce" />
                    </div>
                    <p className="text-sm font-bold text-foreground animate-pulse">🤖 AI analyzing article content & extracting key insights...</p>
                    <p className="text-xs text-muted-foreground">This will only take a few seconds</p>
                  </div>
                ) : summaryBullets.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8 font-medium">Failed to generate summary. Please try again later.</p>
                ) : (
                  <div className="grid gap-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Key Takeaways
                      </p>
                      <ul className="grid gap-3">
                        {summaryBullets.map((bullet, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="text-sm text-foreground/90 leading-relaxed flex gap-2.5 items-start bg-background/50 p-3 rounded-xl border border-border/50 shadow-sm"
                          >
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary font-extrabold text-xs shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="flex-1 font-medium">{bullet}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t">
                      <p className="text-[10px] text-muted-foreground font-medium">
                        ⚡ Summaries are AI-generated and cached for optimal performance.
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard.writeText(summaryBullets.join('\n\n'))
                          alert("Summary copied to clipboard!")
                        }}
                        className="rounded-xl text-xs font-bold shadow-sm"
                      >
                        Copy Summary
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Listen Button */}
            <Button
              variant={isPlaying || isPaused ? "default" : "outline"}
              size="sm"
              onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
              className={cn(
                "rounded-xl font-bold transition-all duration-300 flex items-center gap-1.5 px-3 h-10 shrink-0 shadow-sm hover:shadow group",
                isPlaying || isPaused ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "border-primary/40 bg-primary/5 hover:bg-primary/15 text-primary"
              )}
              title={isPlaying ? "Pause Audio Reader" : "Listen to Article"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 animate-pulse shrink-0" />
                  <span className="text-xs font-extrabold hidden sm:inline">Pause</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-extrabold hidden sm:inline">Resume</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-extrabold hidden sm:inline">Listen</span>
                </>
              )}
            </Button>
          </div>

          {/* Floating Audio Mini Toolbar */}
          <AnimatePresence>
            {(isPlaying || isPaused) && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-inner overflow-hidden my-0.5"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                    <Volume2 className={cn("w-4 h-4", isPlaying ? "animate-bounce" : "")} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-extrabold text-primary truncate">Podcast Mode</p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {isPlaying ? 'Playing article audio...' : 'Paused'}
                    </p>
                  </div>
                </div>

                {/* Equalizer Wave Animation (Only when playing) */}
                {isPlaying && (
                  <div className="flex items-end gap-1 h-5 px-2 shrink-0">
                    <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: ["70%", "30%", "100%"] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: ["100%", "60%", "30%"] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: ["30%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-primary rounded-full" />
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
                    className="w-8 h-8 rounded-full hover:bg-primary/20 text-primary"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current text-primary" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStopAudio}
                    className="w-8 h-8 rounded-full hover:bg-destructive/20 text-destructive"
                    title="Stop Audio"
                  >
                    <Square className="w-4 h-4 fill-current text-destructive" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Row: Quick Engagement Action Bar (Like, Comment, Save) */}
          <div className="flex items-center justify-between gap-1 w-full bg-muted/40 p-1.5 rounded-2xl border border-border/50 shadow-inner">
            {/* Like Button */}
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={handleToggleLike}
              disabled={liking}
              className={cn(
                "rounded-xl transition-all duration-300 font-bold flex items-center gap-1.5 px-3 flex-1 h-9",
                isLiked ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              )}
              title={isLiked ? "Unlike Article" : "Like Article"}
            >
              <ThumbsUp className={cn("w-4 h-4 transition-transform shrink-0", isLiked ? "fill-current scale-110" : "")} />
              <span className="text-xs">{likeCount > 0 ? likeCount : 'Like'}</span>
            </Button>

            {/* Comments Modal Trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors flex items-center gap-1.5 px-3 flex-1 h-9 font-bold"
                  title="View Comments"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Comment</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-card z-50">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold line-clamp-2">{title}</DialogTitle>
                </DialogHeader>
                <CommentSection articleUrl={url} />
              </DialogContent>
            </Dialog>

            {/* Bookmark Button */}
            <Button
              variant={isBookmarked ? "default" : "ghost"}
              size="sm"
              onClick={toggleBookmark}
              disabled={bookmarking}
              className={cn(
                "rounded-xl transition-all duration-300 font-bold flex items-center gap-1.5 px-3 flex-1 h-9",
                isBookmarked ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              )}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Article"}
            >
              {bookmarking ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 shrink-0" />
              ) : (
                <Bookmark className="w-4 h-4 shrink-0" />
              )}
              <span className="text-xs">{isBookmarked ? 'Saved' : 'Save'}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        actionName={authModalAction} 
      />
    </motion.div>
  )
}

export default NewsItem
