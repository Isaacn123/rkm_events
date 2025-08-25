'use client'

import AuthWrapper from '@/components/AuthWrapper'
import Link from 'next/link'
import React, { useState } from 'react'
import { API_ENDPOINTS, getAuthHeadersForUpload } from '@/lib/api'

const CreateAudioPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    is_public: true,
    is_featured: false,
    published: false
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) {
      setMessage('Please select an audio file')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const formDataToSend = new FormData()
      
      // Add audio file
      formDataToSend.append('audio_file', audioFile)
      
      // Add cover image file if provided
      if (coverImageFile) {
        formDataToSend.append('cover_image_file', coverImageFile)
      }
      
      // Add other form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData].toString())
      })

      const response = await fetch(API_ENDPOINTS.AUDIOS.UPLOAD, {
        method: 'POST',
        headers: getAuthHeadersForUpload(token || ''),
        body: formDataToSend
      })

      if (response.ok) {
        setMessage('Audio uploaded successfully!')
        setFormData({
          title: '',
          description: '',
          artist: '',
          album: '',
          genre: '',
          year: '',
          is_public: true,
          is_featured: false,
          published: false
        })
        setAudioFile(null)
        setCoverImageFile(null)
      } else {
        const errorData = await response.json()
        setMessage(`Error: ${errorData.message || 'Failed to upload audio'}`)
      }
    } catch (error) {
      setMessage('Error uploading audio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload New Audio</h1>
              <p className="text-gray-600 mt-2">Add a new audio file to your library</p>
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
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter audio title..."
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File *
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: MP3, WAV, M4A, AAC, OGG
                </p>
              </div>

              {/* Cover Image Upload - Only active after title is entered */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${formData.title ? 'text-gray-700' : 'text-gray-400'}`}>
                  Cover Image (Optional)
                  {formData.title && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  disabled={!formData.title}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formData.title 
                      ? 'border-gray-300 bg-white' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title 
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
                  value={formData.artist}
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
                  value={formData.album}
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
                  value={formData.genre}
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
                  value={formData.year}
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
                value={formData.description}
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
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Make this audio public</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as featured</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
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
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Audio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthWrapper>
  )
}

export default CreateAudioPage
