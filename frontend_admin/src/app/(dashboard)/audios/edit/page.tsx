'use client'

import AuthWrapper from '@/components/AuthWrapper'
import Link from 'next/link'
import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api'

interface Audio {
  id: number
  title: string
  description: string
  artist: string
  album: string
  genre: string
  year: number
  cover_image: string
  cover_image_name: string
  is_public: boolean
  is_featured: boolean
  published: boolean
}

// Separate component for search params logic
const EditAudioContent = () => {
  const searchParams = useSearchParams()
  const audioId = searchParams.get('id')
  
  const [audio, setAudio] = useState<Audio | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')


  const fetchAudio = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.AUDIOS.UPDATE(audioId || ''), {
        headers: getAuthHeaders(token || '')
      })
      if (response.ok) {
        const data = await response.json()
        setAudio(data)
      } else {
        setMessage('Error loading audio')
      }
    } catch {
      setMessage('Error loading audio')
    } finally {
      setLoading(false)
    }
  }, [audioId])

  useEffect(() => {
    if (audioId) {
      fetchAudio()
    }
  }, [audioId, fetchAudio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audio) return

    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.AUDIOS.UPDATE(audioId || ''), {
        method: 'PATCH',
        headers: getAuthHeaders(token || ''),
        body: JSON.stringify(audio)
      })

      if (response.ok) {
        setMessage('Audio updated successfully!')
      } else {
        setMessage('Error updating audio')
      }
    } catch {
      setMessage('Error updating audio')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setAudio(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    } : null)
  }



  if (loading) {
    return (
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading audio...</div>
        </div>
      </AuthWrapper>
    )
  }

  if (!audio) {
    return (
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Audio not found</p>
            <Link href="/audios">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Back to Audios
              </button>
            </Link>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Audio</h1>
              <p className="text-gray-600 mt-2">Update audio information</p>
            </div>
            <Link href="/audios">
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                Back to Audios
              </button>
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* Title First */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={audio.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter audio title..."
              />
            </div>

            {/* Cover Image Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Image</h3>
              
              {/* Current Cover Image */}
              {audio.cover_image && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Cover Image
                  </label>
                  <img 
                    src={audio.cover_image} 
                    alt={audio.cover_image_name || audio.title}
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {/* New Cover Image Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${audio.title ? 'text-gray-700' : 'text-gray-400'}`}>
                  Upload New Cover Image (Optional)
                  {audio.title && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!audio.title}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    audio.title 
                      ? 'border-gray-300 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {audio.title 
                    ? 'Will be uploaded to ImgBB automatically' 
                    : 'Enter a title first to enable cover image upload'
                  }
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  name="artist"
                  value={audio.artist || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter artist name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album
                </label>
                <input
                  type="text"
                  name="album"
                  value={audio.album || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <input
                  type="text"
                  name="genre"
                  value={audio.genre || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={audio.year || ''}
                  onChange={handleInputChange}
                  min="1900"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={audio.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={audio.is_public}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Make this audio public</span>
                </label>

                <label className="flex items-center">
                  <input type="checkbox"
                    name="is_featured"
                    checked={audio.is_featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as featured</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={audio.published}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href="/audios">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthWrapper>
  )
}

// Main component with Suspense boundary
const EditAudioPage = () => {
  return (
    <Suspense fallback={
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AuthWrapper>
    }>
      <EditAudioContent />
    </Suspense>
  )
}

export default EditAudioPage
