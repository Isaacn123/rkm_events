"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, X } from 'lucide-react'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onDateRangeChange?: (startDate: string | undefined, endDate: string | undefined) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  className = "",
  placeholder = "Select date range"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(startDate || '')
  const [localEndDate, setLocalEndDate] = useState(endDate || '')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    setLocalStartDate(startDate || '')
    setLocalEndDate(endDate || '')
  }, [startDate, endDate])

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      const day = date.getDate()
      const month = date.toLocaleDateString('en-US', { month: 'long' })
      const year = date.getFullYear()
      
      // Add ordinal suffix
      const getOrdinalSuffix = (day: number): string => {
        if (day >= 11 && day <= 13) return 'th'
        switch (day % 10) {
          case 1: return 'st'
          case 2: return 'nd'
          case 3: return 'rd'
          default: return 'th'
        }
      }
      
      return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
    } catch (error) {
      return ''
    }
  }

  const getDisplayText = (): string => {
    if (!isClient) return placeholder
    
    if (!localStartDate && !localEndDate) {
      return placeholder
    }
    
    if (localStartDate && localEndDate) {
      const startFormatted = formatDateForDisplay(localStartDate)
      const endFormatted = formatDateForDisplay(localEndDate)
      
      if (!startFormatted || !endFormatted) return placeholder
      
      // Check if same year
      const startYear = new Date(localStartDate).getFullYear()
      const endYear = new Date(localEndDate).getFullYear()
      
      if (startYear === endYear) {
        const startMonth = new Date(localStartDate).toLocaleDateString('en-US', { month: 'long' })
        const endMonth = new Date(localEndDate).toLocaleDateString('en-US', { month: 'long' })
        
        if (startMonth === endMonth) {
          const startDay = new Date(localStartDate).getDate()
          const endDay = new Date(localEndDate).getDate()
          const month = startMonth
          const year = startYear
          
          const getOrdinalSuffix = (day: number): string => {
            if (day >= 11 && day <= 13) return 'th'
            switch (day % 10) {
              case 1: return 'st'
              case 2: return 'nd'
              case 3: return 'rd'
              default: return 'th'
            }
          }
          
          return `${startDay}${getOrdinalSuffix(startDay)} to ${endDay}${getOrdinalSuffix(endDay)} ${month} ${year}`
        } else {
          return `${startFormatted} to ${endFormatted}`
        }
      } else {
        return `${startFormatted} to ${endFormatted}`
      }
    } else if (localStartDate) {
      return formatDateForDisplay(localStartDate)
    } else if (localEndDate) {
      return formatDateForDisplay(localEndDate)
    }
    
    return placeholder
  }

  const handleStartDateChange = (value: string) => {
    setLocalStartDate(value)
    if (onDateRangeChange) {
      onDateRangeChange(value, localEndDate)
    }
  }

  const handleEndDateChange = (value: string) => {
    setLocalEndDate(value)
    if (onDateRangeChange) {
      onDateRangeChange(localStartDate, value)
    }
  }

  const clearDates = () => {
    setLocalStartDate('')
    setLocalEndDate('')
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined)
    }
  }

  // Don't render the component until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal relative"
          disabled
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{placeholder}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal relative"
      >
        <Calendar className="mr-2 h-4 w-4" />
        <span className="flex-1 text-left">{getDisplayText()}</span>
        {(localStartDate || localEndDate) && (
          <div
            className="ml-auto h-4 w-4 p-0 cursor-pointer hover:bg-gray-100 rounded flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              clearDates()
            }}
          >
            <X className="h-3 w-3" />
          </div>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={localStartDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearDates}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 