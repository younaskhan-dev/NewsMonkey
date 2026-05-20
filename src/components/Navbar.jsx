'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton, useUser, useAuth } from '@clerk/nextjs'
import { Menu, X, Newspaper, Home, Trophy, Briefcase, Film, HeartPulse, Microscope, Cpu, Search, Moon, Sun, User, Clock, Trash2, Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useNewsStore from '@/store/useNewsStore'
import { getNotificationsAPI, markNotificationReadAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const categories = [
  { name: 'General', path: '/', icon: Home },
  { name: 'Business', path: '/business', icon: Briefcase },
  { name: 'Entertainment', path: '/entertainment', icon: Film },
  { name: 'Health', path: '/health', icon: HeartPulse },
  { name: 'Science', path: '/science', icon: Microscope },
  { name: 'Sports', path: '/sports', icon: Trophy },
  { name: 'Technology', path: '/technology', icon: Cpu },
]

const searchSuggestions = [
  "Artificial Intelligence",
  "Global Economy",
  "Space Exploration",
  "Electric Vehicles",
  "Climate Change"
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [localSearch, setLocalSearch] = useState('')

  // Notification states
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const notifRef = useRef(null)
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  const { searchQuery, setSearchQuery, searchHistory, initSearchHistory, clearSearchHistory } = useNewsStore()

  useEffect(() => {
    initSearchHistory()
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }
  }, [initSearchHistory])

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Load and poll notifications
  useEffect(() => {
    if (isSignedIn && user?.id) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [isSignedIn, user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await getNotificationsAPI(getToken, user?.id)
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationReadAPI(getToken, id, user?.id)
      if (id === 'all') {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      } else {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification read:", error)
    }
  }

  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (root.classList.contains('dark')) {
        root.classList.remove('dark')
        setIsDarkMode(false)
      } else {
        root.classList.add('dark')
        setIsDarkMode(true)
      }
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim())
      setShowSearchDropdown(false)
      if (pathname !== '/') {
        router.push('/')
      }
    }
  }

  const handleSuggestionClick = (query) => {
    setLocalSearch(query)
    setSearchQuery(query)
    setShowSearchDropdown(false)
    if (pathname !== '/') {
      router.push('/')
    }
  }

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg sm:text-xl tracking-tight shrink-0 group">
          <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <Newspaper className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent font-black">
            NewsMonkey
          </span>
        </Link>

        {/* Desktop Categories with Animated Active Tabs */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {categories.map((cat) => {
            const isActive = pathname === cat.path && !searchQuery
            return (
              <Link key={cat.path} href={cat.path} onClick={() => setSearchQuery('')}>
                <div className="relative px-3 py-2 rounded-lg text-sm font-semibold transition-colors hover:text-primary">
                  <span className="relative z-10 flex items-center gap-1.5">
                    <cat.icon className="w-4 h-4" />
                    {cat.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavbarTab"
                      className="absolute inset-0 bg-primary/10 border-b-2 border-primary rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Desktop Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search news..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                setShowSearchDropdown(true)
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full h-10 pl-9 pr-10 rounded-full border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('')
                  setSearchQuery('')
                }}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Search Dropdown (Suggestions & History) */}
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 left-0 right-0 bg-background border rounded-2xl shadow-xl overflow-hidden z-50 p-4 grid gap-4"
            >
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-xs rounded-full transition-colors flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3 opacity-70" />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Popular Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {searchSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-xs font-medium rounded-full transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right side Actions (Dark Mode, Bell, Profile, Menu Button) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-muted"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </Button>

          {/* Notification Bell */}
          {isSignedIn && (
            <div className="relative" ref={notifRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="rounded-full hover:bg-muted relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-foreground/80" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 w-auto sm:w-96 max-w-lg mx-auto bg-background border rounded-2xl shadow-2xl overflow-hidden z-50 p-4 grid gap-3"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => handleMarkAsRead('all')}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-6 font-medium">
                        No notifications yet. You're all caught up!
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={cn(
                            "py-3 first:pt-0 last:pb-0 flex gap-3 items-start transition-colors rounded-xl p-2",
                            !notif.isRead ? "bg-primary/5 font-semibold" : "opacity-80"
                          )}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }} />
                          <div className="flex-1">
                            <p className="text-xs text-foreground leading-relaxed">{notif.message}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {notif.articleUrl && (
                                <a
                                  href={notif.articleUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                >
                                  View <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-bold">
                  <User className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in">
              <Button variant="default" size="sm" className="rounded-full font-bold px-4 shadow-md text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar Row (Visible only on md and smaller) */}
      <div className="md:hidden border-t bg-background/95 px-4 py-2" ref={mobileSearchRef}>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search news..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              setShowSearchDropdown(true)
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full h-9 pl-9 pr-10 rounded-full border bg-muted/60 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none text-xs transition-all font-medium"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('')
                setSearchQuery('')
              }}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Mobile Search Dropdown */}
        {showSearchDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 right-4 mt-2 bg-background border rounded-2xl shadow-2xl overflow-hidden z-50 p-4 grid gap-4"
          >
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(item)}
                      className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground text-xs rounded-full transition-colors flex items-center gap-1 font-medium"
                    >
                      <Clock className="w-3 h-3 opacity-70" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                Popular Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-xs font-bold rounded-full transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b px-4 py-4 grid gap-2 shadow-2xl "
          >
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1 text-center">
              Categories
            </div>
            {categories.map((cat) => (
              <Link key={cat.path} href={cat.path} onClick={() => { setIsOpen(false); setSearchQuery(''); }}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-center gap-3 h-12 rounded-xl font-semibold text-base ",
                    pathname === cat.path && !searchQuery && "bg-primary/10 text-primary font-bold "
                  )}
                >
                  <cat.icon className="w-5 h-5 " />
                  {cat.name}
                </Button>
              </Link>
            ))}

            {isSignedIn && (
              <div className="pt-2 border-t mt-2 ">
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full justify-center gap-3 h-12 rounded-xl font-bold text-base shadow-md">
                    <User className="w-5 h-5" /> Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
