'use client'

import AuthWrapper from '@/components/AuthWrapper'
import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api'

interface Audio {
  id: number
  title: string
  artist: string
  format: string
  duration_formatted: string
  file_size_mb: number
  cover_image: string
  cover_image_name: string
  is_public: boolean
  is_featured: boolean
  published: boolean
  created_at: string
  uploaded_by: {
    username: string
  }
}

const AudiosPage = () => {
  const [audios, setAudios] = useState<Audio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAudios()
  }, [])

  const fetchAudios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.AUDIOS.ADMIN, {
        headers: getAuthHeaders(token || '')
      })
      const data = await response.json()
      setAudios(data.results || data)
    } catch (error) {
      console.error('Error fetching audios:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (audioId: number, action: 'published' | 'featured') => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = action === 'published' 
        ? API_ENDPOINTS.AUDIOS.TOGGLE_PUBLISHED(audioId.toString())
        : API_ENDPOINTS.AUDIOS.TOGGLE_FEATURED(audioId.toString())
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(token || '')
      })
      if (response.ok) {
        fetchAudios()
      }
    } catch (error) {
      console.error(`Error toggling ${action}:`, error)
    }
  }

  const deleteAudio = async (audioId: number) => {
    if (!confirm('Are you sure you want to delete this audio?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.AUDIOS.DELETE(audioId.toString()), {
        method: 'DELETE',
        headers: getAuthHeaders(token || '')
      })
      if (response.ok) {
        fetchAudios()
      }
    } catch (error) {
      console.error('Error deleting audio:', error)
    }
  }

  const filteredAudios = audios.filter(audio => {
    const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.artist.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'published' && audio.published) ||
                         (statusFilter === 'unpublished' && !audio.published) ||
                         (statusFilter === 'featured' && audio.is_featured)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (audio: Audio) => {
    if (!audio.published) return <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">Draft</span>
    if (audio.is_featured) return <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Featured</span>
    return <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">Published</span>
  }

  if (loading) {
    return (
      <AuthWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading audios...</div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audio Management</h1>
            <p className="text-gray-600 mt-2">Manage all audio files in your library</p>
          </div>
          <Link href="/audios/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Upload New Audio
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title or artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Audios</option>
            <option value="published">Published</option>
            <option value="unpublished">Drafts</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        {/* Audio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudios.map((audio) => (
            <div key={audio.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              {audio.cover_image && (
                <div className="mb-4">
                  <Image 
                    src={audio.cover_image} 
                    alt={audio.cover_image_name || audio.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{audio.title}</h3>
                  <p className="text-sm text-gray-600">by {audio.artist}</p>
                </div>
                {getStatusBadge(audio)}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  <div>Format: {audio.format?.toUpperCase()}</div>
                  <div>Duration: {audio.duration_formatted}</div>
                  <div>Size: {audio.file_size_mb} MB</div>
                  <div>Uploaded: {new Date(audio.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleStatus(audio.id, 'published')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {audio.published ? 'Unpublish' : 'Publish'}
                </button>
                
                <button
                  onClick={() => toggleStatus(audio.id, 'featured')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  {audio.is_featured ? 'Remove Featured' : 'Make Featured'}
                </button>
                
                <Link href={`/audios/edit?id=${audio.id}`}>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Edit
                  </button>
                </Link>
                
                <button
                  onClick={() => deleteAudio(audio.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAudios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No audios found matching your criteria.</p>
          </div>
        )}
      </div>
    </AuthWrapper>
  )
}

export default AudiosPage
