'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Settings, ShieldAlert, Newspaper, User, Menu, X, Trash2, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { syncUserProfile, getUserProfile, updateUserPreferences, getBookmarksAPI, deleteBookmarkAPI, getAdminStatsAPI, getAllUsersAPI, updateUserRoleAPI } from '@/lib/api'

const categories = ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology']

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  
  const [activeTab, setActiveTab] = useState('feed')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [preferences, setPreferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Admin states
  const [adminStats, setAdminStats] = useState(null)
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadDashboardData()
    }
  }, [isLoaded, isSignedIn, user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || `${user.id}@clerk.user`
      const name = user.fullName || user.firstName || user.username || 'User'

      const syncedUser = await syncUserProfile(getToken, { clerkId: user.id, name, email })
      setUserProfile(syncedUser)
      setPreferences(syncedUser.preferences || ['general', 'technology'])

      const bks = await getBookmarksAPI(getToken, user.id)
      setBookmarks(bks)

      if (syncedUser.role === 'admin') {
        const stats = await getAdminStatsAPI(getToken, user.id)
        const usersList = await getAllUsersAPI(getToken, user.id)
        setAdminStats(stats)
        setAllUsers(usersList)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceToggle = (cat) => {
    if (preferences.includes(cat)) {
      if (preferences.length > 1) {
        setPreferences(preferences.filter(p => p !== cat))
      }
    } else {
      setPreferences([...preferences, cat])
    }
  }

  const handleSavePreferences = async () => {
    try {
      const updated = await updateUserPreferences(getToken, user.id, preferences)
      setUserProfile(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving preferences:", error)
    }
  }

  const handleDeleteBookmark = async (id) => {
    try {
      await deleteBookmarkAPI(getToken, id, user.id)
      setBookmarks(bookmarks.filter(b => b._id !== id))
    } catch (error) {
      console.error("Error deleting bookmark:", error)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleAPI(getToken, userId, newRole, user.id)
      setAllUsers(allUsers.map(u => u._id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      console.error("Error updating role:", error)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/20 relative overflow-x-hidden">
      {/* Mobile Floating Menu Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
        title="Toggle Dashboard Menu"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside 
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-card border-r p-6 flex flex-col gap-2 fixed md:relative inset-y-0 left-0 z-40 shadow-2xl md:shadow-none transition-transform h-[calc(100vh-4rem)] md:h-auto overflow-y-auto"
          >
            <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shadow-inner">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm leading-tight truncate">{userProfile?.name || 'Loading...'}</h4>
                <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
              </div>
            </div>

            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1 shrink-0">
              Menu
            </div>

            <Button
              variant={activeTab === 'feed' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 rounded-xl font-bold h-11 shrink-0 text-sm shadow-xs"
              onClick={() => { setActiveTab('feed'); setSidebarOpen(false); }}
            >
              <Newspaper className="w-5 h-5" />
              Personalized Feed
            </Button>

            <Button
              variant={activeTab === 'bookmarks' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 rounded-xl font-bold h-11 shrink-0 text-sm shadow-xs"
              onClick={() => { setActiveTab('bookmarks'); setSidebarOpen(false); }}
            >
              <Bookmark className="w-5 h-5" />
              Saved Bookmarks
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="ml-auto bg-background/50 text-foreground font-extrabold shadow-xs">
                  {bookmarks.length}
                </Badge>
              )}
            </Button>

            <Button
              variant={activeTab === 'preferences' ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 rounded-xl font-bold h-11 shrink-0 text-sm shadow-xs"
              onClick={() => { setActiveTab('preferences'); setSidebarOpen(false); }}
            >
              <Settings className="w-5 h-5" />
              Preferences
            </Button>

            {userProfile?.role === 'admin' && (
              <>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mt-6 mb-1 shrink-0">
                  Admin Management
                </div>
                <Button
                  variant={activeTab === 'admin' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 rounded-xl font-bold h-11 shrink-0 text-sm bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-xs"
                  onClick={() => { setActiveTab('admin'); setSidebarOpen(false); }}
                >
                  <ShieldAlert className="w-5 h-5" />
                  Admin Dashboard
                </Button>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full pt-6 md:pt-10 mb-16 md:mb-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* TAB: Personalized Feed */}
            {activeTab === 'feed' && (
              <div className="grid gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Your Personalized Feed</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Curated news based on your favorite categories: <span className="font-bold text-foreground capitalize">{preferences.join(', ')}</span>.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('preferences')} className="rounded-xl font-bold shadow-xs self-start sm:self-auto">
                    <Settings className="w-4 h-4 mr-2" /> Edit Topics
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.slice(0, 6).map((article) => (
                    <Card key={article._id} className="overflow-hidden flex flex-col h-full rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-video w-full bg-muted relative overflow-hidden">
                        <img src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'} alt={article.title} className="object-cover w-full h-full" />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground capitalize font-bold shadow-md">{article.category}</Badge>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold line-clamp-2">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            {article.title}
                          </a>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 grow">
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{article.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {bookmarks.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-card border rounded-3xl shadow-sm px-4">
                      <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-bold">No personalized articles saved yet</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4 max-w-md mx-auto">Explore our main categories to discover and save stories.</p>
                      <Button asChild className="rounded-xl font-bold shadow-md"><a href="/">Explore News</a></Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Saved Bookmarks */}
            {activeTab === 'bookmarks' && (
              <div className="grid gap-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Saved Bookmarks</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Articles you have saved to read later.</p>
                </div>

                {bookmarks.length === 0 ? (
                  <div className="text-center py-20 bg-card border rounded-3xl shadow-sm max-w-lg mx-auto px-4">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg sm:text-xl font-bold mb-1">No bookmarks found</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mb-6 max-w-md mx-auto">You haven&lsquo;t bookmarked any articles yet. Click the bookmark icon on any news card to save it here.</p>
                    <Button asChild className="rounded-xl font-bold shadow-md"><a href="/">Browse Top Headlines</a></Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                      <Card key={bookmark._id} className="overflow-hidden flex flex-col h-full rounded-2xl border shadow-sm hover:shadow-md transition-shadow bg-card">
                        <div className="aspect-video w-full bg-muted relative overflow-hidden">
                          <img src={bookmark.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop'} alt={bookmark.title} className="object-cover w-full h-full" />
                          <Badge className="absolute top-3 left-3 bg-background text-foreground font-bold truncate max-w-35 shadow-md">{bookmark.source || 'News'}</Badge>
                        </div>
                        <CardHeader className="p-5 pb-3">
                          <CardTitle className="text-base font-bold line-clamp-2 hover:text-primary transition-colors">
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                              {bookmark.title}
                            </a>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 grow">
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{bookmark.description}</p>
                        </CardContent>
                        <div className="p-5 mt-auto flex items-center gap-2 border-t pt-4">
                          <Button asChild size="sm" className="flex-1 rounded-xl font-bold shadow-xs">
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                              Read Article <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBookmark(bookmark._id)} className="rounded-xl text-destructive hover:bg-destructive/10 shadow-xs" title="Remove Bookmark">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Preferences */}
            {activeTab === 'preferences' && (
              <Card className="max-w-2xl rounded-3xl border shadow-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/20">
                  <CardTitle className="text-lg sm:text-xl font-extrabold">News Preferences</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select the topics you are most interested in to personalize your daily news feed.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid gap-6">
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {categories.map((cat) => {
                      const isSelected = preferences.includes(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => handlePreferenceToggle(cat)}
                          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border flex items-center gap-2 transition-all shadow-xs ${
                            isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          <span className="capitalize">{cat}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t">
                    <Button onClick={handleSavePreferences} className="rounded-xl font-bold px-6 shadow-md w-full sm:w-auto justify-center">
                      Save Preferences
                    </Button>
                    {saveSuccess && (
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in self-center sm:self-auto">
                        <Check className="w-4 h-4 shrink-0" /> Preferences updated successfully!
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB: Admin Dashboard */}
            {activeTab === 'admin' && userProfile?.role === 'admin' && (
              <div className="grid gap-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Admin Dashboard</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Platform overview and user role management.</p>
                </div>

                {/* Stats Grid */}
                {adminStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
                      <CardHeader className="p-6 pb-2 bg-primary/5">
                        <CardDescription className="font-bold uppercase tracking-wider text-[10px] sm:text-xs text-primary">Total Users</CardDescription>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-primary">{adminStats.totalUsers}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
                      <CardHeader className="p-6 pb-2 bg-primary/5">
                        <CardDescription className="font-bold uppercase tracking-wider text-[10px] sm:text-xs text-primary">Total Bookmarks</CardDescription>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-primary">{adminStats.totalBookmarks}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="rounded-2xl border shadow-sm bg-card overflow-hidden">
                      <CardHeader className="p-6 pb-2 bg-primary/5">
                        <CardDescription className="font-bold uppercase tracking-wider text-[10px] sm:text-xs text-primary">Total Comments</CardDescription>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-primary">{adminStats.totalComments}</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Users Management Table */}
                <Card className="rounded-3xl border shadow-sm overflow-hidden">
                  <CardHeader className="p-6 border-b bg-muted/20">
                    <CardTitle className="text-base sm:text-lg font-extrabold">User Management</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50 text-muted-foreground font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                          <th className="p-4 pl-6">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4 hidden sm:table-cell">Joined</th>
                          <th className="p-4 pr-6">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-medium">
                        {allUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-4 pl-6 font-bold text-foreground">{u.name}</td>
                            <td className="p-4 text-muted-foreground truncate max-w-30 sm:max-w-none">{u.email}</td>
                            <td className="p-4 text-xs text-muted-foreground hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 pr-6">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                disabled={u.clerkId === user.id}
                                className="bg-muted px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl font-bold text-xs focus:outline-none cursor-pointer border border-border/50 disabled:opacity-50 text-foreground"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
