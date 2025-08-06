'use client'
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DynamicCKEditorWrapper from '@/components/DynamicCkeditorWrapper';
import { PhotoIcon } from '@heroicons/react/24/outline';
import React from 'react'
import Link from 'next/link';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { getAuthHeaders } from '@/lib/auth';

interface Event {
  id: number;
  title: string;
  description: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  time?: string;
  location: string;
  author: string;
  image_url?: string;
  published: boolean;
  slug?: string;
}

const EditEventPage = () => {
  const { id: eventId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    start_date: '',
    end_date: '',
    time: '',
    description: '',
    image_url: '',
    location: '',
    author: '',
    slug: '',
    published: false,
  });

  // ImgBB API Key
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  const fetchEvent = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      console.log('Fetching event with ID:', eventId);
      console.log('Headers:', headers);
      
      // Test if backend is accessible
      try {
        const testResponse = await fetch('http://45.56.120.65:8001/api/public/list/', {
          method: 'GET',
        });
        console.log('Backend connectivity test status:', testResponse.status);
      } catch (testError) {
        console.error('Backend connectivity test failed:', testError);
        throw new Error('Backend server is not accessible. Please ensure the Django server is running.');
      }
      
      const response = await fetch(`http://45.56.120.65:8001/api/${eventId}/`, {
        headers,
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const eventData: Event = await response.json();
      console.log('Fetched event data:', eventData);
      
      setFormData({
        title: eventData.title || '',
        date: eventData.date || '',
        start_date: eventData.start_date || '',
        end_date: eventData.end_date || '',
        time: eventData.time || '',
        description: eventData.description || '',
        image_url: eventData.image_url || '',
        location: eventData.location || '',
        author: eventData.author || '',
        slug: eventData.slug || '',
        published: eventData.published || false,
      });
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY as string);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      alert('Image size must be less than 32MB');
      return;
    }

    setImageLoading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateRangeChange = (startDate: string | undefined, endDate: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      start_date: startDate || '',
      end_date: endDate || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const headers = await getAuthHeaders();
      console.log('Submitting event update with ID:', eventId);
      console.log('Headers:', headers);
      console.log('Form data:', formData);

      // Prepare the data to send
      const eventData: Record<string, string | boolean | undefined> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        published: formData.published,
      };

      // Only include date/time fields if they have values
      if (formData.start_date && formData.end_date) {
        eventData.start_date = formData.start_date;
        eventData.end_date = formData.end_date;
        
        // Create formatted date string for the date field
        const formatDateWithOrdinal = (date: Date) => {
          const day = date.getDate();
          const month = date.toLocaleDateString('en-US', { month: 'long' });
          const year = date.getFullYear();
          
          const getOrdinalSuffix = (day: number): string => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
              case 1: return 'st';
              case 2: return 'nd';
              case 3: return 'rd';
              default: return 'th';
            }
          };
          
          return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
        };

        try {
          const startDate = new Date(formData.start_date);
          const endDate = new Date(formData.end_date);
          
          const startFormatted = formatDateWithOrdinal(startDate);
          
          if (startDate.getTime() === endDate.getTime()) {
            // Same day
            eventData.date = startFormatted;
          } else {
            // Different days
            const getOrdinalSuffix = (day: number): string => {
              if (day > 3 && day < 21) return 'th';
              switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
              }
            };
            
            const startDay = startDate.getDate();
            const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
            const endDay = endDate.getDate();
            const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
            const year = startDate.getFullYear();
            
            eventData.date = `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} to ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${year}`;
          }
        } catch (error) {
          console.error('Error formatting date range:', error);
        }
      } else if (formData.date) {
        eventData.date = formData.date;
      }

      if (formData.time) {
        eventData.time = formData.time;
      }

      if (formData.image_url) {
        eventData.image_url = formData.image_url;
      }

      if (formData.author) {
        eventData.author = formData.author;
      }

      console.log('Final event data to send:', eventData);

      const response = await fetch(`http://45.56.120.65:8001/api/${eventId}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log('Update response status:', response.status);
      console.log('Update response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown error' };
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedEvent = await response.json();
      console.log('Updated event data:', updatedEvent);

      alert('Event updated successfully!');
      router.push('/events');
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/events">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Back to Events
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 mx-16 flex justify-center items-center">
      <div className='shadow-lg shadow-gray-100 rounded w-[900] pt-5'>
        <div className="flex justify-between items-center mb-6">
          <h1 className='text-2xl font-bold text-slate-500'>Edit Event</h1>
          <Link href="/events">
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Back to Events
            </button>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='md-5 pt-10'>
            <label htmlFor="title" className='font-bold block'>Title</label>
            <input 
              type="text" 
              name='title' 
              id='title' 
              value={formData.title}
              onChange={handleChange}
              style={{width: '100%'}} 
              className='border border-s-slate-200 rounded p-2 block mt-2' 
              required
            />
          </div>

          <div className='md-5'>
            <label htmlFor="time" className='font-bold block'>Time (Optional)</label>
            <TimePicker
              value={formData.time}
              onChange={(time) => setFormData(prev => ({ ...prev, time }))}
              placeholder="Select time (e.g., 3:00 PM)"
              className="w-full"
            />
          </div>

          {/* Date Range Picker */}
          <div className='md-5'>
            <label className='font-bold block mb-2'>Event Date Range</label>
            <DateRangePicker
              startDate={formData.start_date}
              endDate={formData.end_date}
              onDateRangeChange={handleDateRangeChange}
              placeholder="Select event date range (e.g., 20th July to 30th Sept 2025)"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use this for multi-day events. For single day events, use the date field below.
            </p>
          </div>

          <div className='md-5'>
            <label htmlFor="date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Single Date (Optional - for single day events)
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image_upload" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Event Image (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="file"
                name="image_upload"
                id="image_upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {imageLoading && (
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
              )}
            </div>
            {formData.image_url && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.375rem', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PhotoIcon style={{ width: '1rem', height: '1rem', color: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.75rem', color: '#0c4a6e' }}>Image uploaded successfully!</span>
                </div>
              </div>
            )}
          </div>

          <div className='md-5'>
            <label htmlFor="location" className='font-bold block'>Location</label>
            <input 
              type="text" 
              name='location' 
              value={formData.location}
              onChange={handleChange}
              style={{width: '100%'}} 
              id='location' 
              className='border border-s-slate-200 rounded p-2 block mt-2' 
              required
            />
          </div>

          <div className='md-5'>
            <label htmlFor="author" className='font-bold block'>Author (Optional)</label>
            <input 
              type="text" 
              name='author' 
              value={formData.author}
              onChange={handleChange}
              style={{width: '100%'}} 
              id='author' 
              className='border border-s-slate-200 rounded p-2 block mt-2' 
              placeholder="Leave empty to use your username"
            />
          </div>

          <div className='md-5'>
            <label htmlFor="description" className='font-bold block'>Event Description</label>
            <DynamicCKEditorWrapper 
              formData={formData}
              setFormData={setFormData}
              MyCustomUploadAdapterPlugin={() => {}}
            />
          </div>

          <div className='md-5'>
            <label className='font-bold block flex items-center'>
              <input 
                type="checkbox" 
                name='published' 
                checked={formData.published}
                onChange={handleChange}
                className='mr-2'
              />
              Publish Event
            </label>
          </div>

          <div className='md-5 py-5'>
            <div style={{ display:'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-2 border-2 border-s-slate-100 rounded-2xl disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage; 