'use client'

import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { MessageSquare, Send, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCommentsAPI, addCommentAPI, deleteCommentAPI, getUserProfile } from '@/lib/api'

const CommentSection = ({ articleUrl }) => {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (articleUrl) {
      loadComments()
    }
  }, [articleUrl])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkAdminStatus()
    }
  }, [isLoaded, isSignedIn])

  const checkAdminStatus = async () => {
    try {
      const profile = await getUserProfile(getToken, user?.id)
      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getCommentsAPI(articleUrl)
      setComments(data)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !isSignedIn) return

    setSubmitting(true)
    try {
      const added = await addCommentAPI(getToken, {
        clerkId: user?.id,
        articleUrl,
        text: newComment.trim(),
        userName: user.fullName || user.firstName || 'User',
        userImage: user.imageUrl,
      })
      setComments([added, ...comments])
      setNewComment('')
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (id) => {
    try {
      await deleteCommentAPI(getToken, id, user?.id)
      setComments(comments.filter(c => c._id !== id))
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <div className="mt-8 border-t pt-6 bg-card rounded-2xl p-6 border shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isSignedIn ? (
        <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 border">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Add to the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              className="flex-1 h-10 px-4 rounded-xl border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm transition-all"
            />
            <Button type="submit" disabled={submitting || !newComment.trim()} className="rounded-xl px-5 font-semibold shadow-md">
              {submitting ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted/40 border rounded-xl p-4 text-center mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground font-medium">Please sign in to join the conversation and share your thoughts.</p>
          <Button asChild size="sm" className="rounded-xl font-bold px-6 shadow-sm"><a href="/sign-in">Sign In</a></Button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8 font-medium">No comments yet. Be the first to share your opinion!</p>
      ) : (
        <div className="grid gap-4 divide-y">
          {comments.map((comment) => {
            const isOwner = isSignedIn && comment.userId === user?.id
            return (
              <div key={comment._id} className="pt-4 first:pt-0 flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 border mt-0.5">
                  {comment.userImage ? (
                    <img src={comment.userImage} alt={comment.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                      {comment.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-foreground">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/90 mt-1 leading-relaxed">{comment.text}</p>
                </div>
                {(isOwner || isAdmin) && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-opacity self-start"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommentSection
