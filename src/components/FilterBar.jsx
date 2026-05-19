'use client'

import React from 'react'
import { Globe, Calendar, Filter, RotateCcw } from 'lucide-react'
import useNewsStore from '@/store/useNewsStore'
import { Button } from '@/components/ui/button'

const countries = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'in', name: 'India' },
  { code: 'au', name: 'Australia' },
  { code: 'any', name: 'Global (Any)' }
]

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Past 24 Hours' },
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' }
]

const FilterBar = () => {
  const { 
    country, 
    setCountry, 
    dateFilter, 
    setDateFilter, 
    sourceFilter, 
    setSourceFilter, 
    articles, 
    resetFilters 
  } = useNewsStore()

  // Dynamically compute unique sources from current articles
  const availableSources = ['all', ...new Set(articles.map(a => a.source?.name).filter(Boolean))]

  return (
    <div className="bg-background/80 backdrop-blur-md border-b py-3 px-4 sticky top-16 z-40 shadow-sm transition-colors">
      <div className="container mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left side: Filters Container with Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto flex-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 sm:mr-2">
            <Filter className="w-4 h-4 text-primary" /> <span className="hidden md:inline">Filters:</span>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-xl border border-border/50 shadow-xs shrink-0 transition-colors">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground pr-1"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="bg-background text-foreground font-medium">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-xl border border-border/50 shadow-xs shrink-0 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground pr-1"
            >
              {dateOptions.map((d) => (
                <option key={d.value} value={d.value} className="bg-background text-foreground font-medium">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          {availableSources.length > 1 && (
            <div className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-xl border border-border/50 shadow-xs shrink-0 transition-colors">
              <span className="text-xs font-bold text-muted-foreground">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground max-w-[140px] sm:max-w-[180px] truncate pr-1"
              >
                {availableSources.map((s) => (
                  <option key={s} value={s} className="bg-background text-foreground font-medium">
                    {s === 'all' ? 'All Sources' : s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right side: Reset Filters */}
        {(country !== 'us' || dateFilter !== 'all' || sourceFilter !== 'all') && (
          <div className="flex justify-end sm:justify-start pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 rounded-xl px-4 py-1.5 h-auto font-bold shadow-xs w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5 animate-spin-once" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterBar
