"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
}

export function TimePicker({ 
  value, 
  onChange, 
  placeholder = "Select time",
  className = ""
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Convert 24-hour format to 12-hour format for display
  useEffect(() => {
    if (value && isClient) {
      try {
        const [hours, minutes] = value.split(':')
        const hourNum = parseInt(hours)
        if (!isNaN(hourNum)) {
          const isPM = hourNum >= 12
          const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
          
          setHour(displayHour.toString())
          setMinute(minutes || '00')
          setPeriod(isPM ? 'PM' : 'AM')
        }
      } catch (error) {
        console.error('Error parsing time:', error)
      }
    }
  }, [value, isClient])

  // Convert 12-hour format to 24-hour format for API
  const convertTo24Hour = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
    if (!hour) return ''
    
    let hourNum = parseInt(hour)
    if (period === 'PM' && hourNum !== 12) {
      hourNum += 12
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0
    }
    
    return `${hourNum.toString().padStart(2, '0')}:${minute}`
  }

  const getDisplayText = (): string => {
    if (!hour) return placeholder
    
    const displayHour = hour === '0' ? '12' : hour
    return `${displayHour}:${minute} ${period}`
  }

  const handleHourChange = (newHour: string) => {
    setHour(newHour)
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
  }

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod)
  }

  const handleDone = () => {
    if (hour && minute) {
      const time24 = convertTo24Hour(hour, minute, period)
      onChange?.(time24)
    }
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Don't render the component until client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          disabled
        >
          <Clock className="mr-2 h-4 w-4" />
          {placeholder}
        </Button>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Clock className="mr-2 h-4 w-4" />
        {getDisplayText()}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hour
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minute
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => handleMinuteChange(e.target.value.padStart(2, '0'))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value as 'AM' | 'PM')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDone}
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