'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Sparkles, Heart, Bookmark, MessageSquare, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AuthModal({ isOpen, onClose, actionName = 'access this feature' }) {
  // Map actions to specific icons and texts for customization
  const getActionDetails = () => {
    switch (actionName) {
      case 'like articles':
        return {
          icon: <Heart className="w-8 h-8 text-rose-500 animate-pulse" />,
          title: "Show your appreciation",
          desc: "Sign in to like articles, save reactions, and help personalize the news feed for everyone."
        }
      case 'bookmark articles':
        return {
          icon: <Bookmark className="w-8 h-8 text-amber-500" />,
          title: "Save for later reading",
          desc: "Sign in to add this article to your bookmarks and access it anytime from your personal dashboard."
        }
      case 'view your personalized feed':
        return {
          icon: <Sparkles className="w-8 h-8 text-primary animate-pulse" />,
          title: "Unlock Your 'For You' Feed",
          desc: "Sign in to setup your topic preferences and get a customized daily feed based on what you love."
        }
      case 'comment on articles':
        return {
          icon: <MessageSquare className="w-8 h-8 text-sky-500" />,
          title: "Join the conversation",
          desc: "Sign in to share your thoughts, reply to other readers, and be part of the community."
        }
      default:
        return {
          icon: <Lock className="w-8 h-8 text-primary" />,
          title: "Authentication Required",
          desc: "Sign in to unlock full engagement features like comments, custom feeds, bookmarks, and likes."
        }
    }
  }

  const details = getActionDetails()

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6 bg-card/95 border-primary/20 shadow-2xl backdrop-blur-md overflow-hidden z-50">
        <div className="flex flex-col items-center text-center p-4">
          {/* Animated Header Icon Wrapper */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner border border-primary/10 relative"
          >
            <div className="absolute -top-1.5 -right-1.5 p-1 bg-background border border-primary/20 rounded-full shadow-md">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </div>
            {details.icon}
          </motion.div>

          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight bg-linear-to-r from-foreground via-foreground/95 to-foreground/80 bg-clip-text text-transparent">
              {details.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
              {details.desc}
            </DialogDescription>
          </DialogHeader>

          {/* Action Benefits List */}
          <div className="w-full grid gap-2.5 my-6 text-left text-xs bg-muted/40 p-4 rounded-2xl border border-border/40">
            <div className="flex items-center gap-2.5 font-bold text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Personalized For You daily feeds</span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Unlimited saved bookmarks & engagement</span>
            </div>
            <div className="flex items-center gap-2.5 font-bold text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Real-time notifications & breaking updates</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl font-bold h-11 border-border/60 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              asChild
              className="flex-1 rounded-xl font-bold h-11 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <a href="/sign-in">
                Sign In
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
