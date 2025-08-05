'use client'
import { useState } from 'react';
import DynamicCKEditorWrapper from '@/components/DynamicCkeditorWrapper';
import { PhotoIcon } from '@heroicons/react/24/outline';
import React from 'react'
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { TimePicker } from '@/components/ui/time-picker';

interface EventData {
  title: string;
  description: string;
  date: string;
  start_date: string;
  end_date: string;
  time: string;
  image_url: string;
  location: string;
  author: string;
  slug: string;
  published: boolean;
}

const Event = () => {

  const [formData, setFormData] = useState<EventData>({
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
  })
  const [imageLoading, setImageLoading] = useState(false);
    // ImgBB API Key - Replace with your actual API key
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

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
    return data.data.url; // This is the direct image URL
  };

   // Minimal type to avoid 'any' for editor
  type EditorWithPlugins = {
    plugins: {
      get(name: string): {
        createUploadAdapter?: (loader: unknown) => unknown;
      };
    };
  };

  function MyCustomUploadAdapterPlugin(editor: EditorWithPlugins) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: unknown) => {
      return new MyUploadAdapter(loader);
    };
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 32MB for ImgBB)
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

  class MyUploadAdapter {
    loader: unknown;
    constructor(loader: unknown) {
      this.loader = loader;
    }

    async upload() {
      // Type assertion for loader with file property
      const file = await (this.loader as { file: Promise<File> }).file;
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY as string);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Image upload failed');
      const data = await response.json();
      // CKEditor expects an object with a 'default' property containing the image URL
      return { default: data.data.url };
    }

    abort() {
      // Optional: handle abort
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    // Prepare the data to send
    const eventData: Partial<EventData> = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      author: formData.author,
      image_url: formData.image_url,
      published: formData.published,
    };

    // Add optional fields only if they have values
    if (formData.time) {
      eventData.time = formData.time;
    }
    
    // Handle date field - can be ISO format or formatted string
    if (formData.date) {
      eventData.date = formData.date;
    }
    
    // Handle date range - if both start and end dates are set, create formatted string
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      const formatDateWithOrdinal = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const year = date.getFullYear();
        
        const getOrdinalSuffix = (day: number): string => {
          if (day >= 11 && day <= 13) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        
        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
      };
      
      const startFormatted = formatDateWithOrdinal(startDate);
      const endFormatted = formatDateWithOrdinal(endDate);
      
      if (startDate.getFullYear() === endDate.getFullYear()) {
        if (startDate.getMonth() === endDate.getMonth()) {
          const startDay = startDate.getDate();
          const endDay = endDate.getDate();
          const month = startDate.toLocaleDateString('en-US', { month: 'long' });
          const year = startDate.getFullYear();
          
          const getOrdinalSuffix = (day: number): string => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
              case 1: return 'st';
              case 2: return 'nd';
              case 3: return 'rd';
              default: return 'th';
            }
          };
          
          eventData.date = `${startDay}${getOrdinalSuffix(startDay)} to ${endDay}${getOrdinalSuffix(endDay)} ${month} ${year}`;
        } else {
          eventData.date = `${startFormatted} to ${endFormatted}`;
        }
      } else {
        eventData.date = `${startFormatted} to ${endFormatted}`;
      }
    } else if (formData.start_date) {
      // Single start date
      const startDate = new Date(formData.start_date);
      const day = startDate.getDate();
      const month = startDate.toLocaleDateString('en-US', { month: 'long' });
      const year = startDate.getFullYear();
      
      const getOrdinalSuffix = (day: number): string => {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      
      eventData.date = `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    }
    
    // Still send start_date and end_date for backend processing
    if (formData.start_date) {
      eventData.start_date = formData.start_date;
    }
    if (formData.end_date) {
      eventData.end_date = formData.end_date;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        alert('Event created successfully!');
        // Reset form
        setFormData({
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
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Failed to create event: ${errorData.message || errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="bg-white p-4 mx-16 flex justify-center items-center ">
     <div className='shadow-lg shadow-gray-100 rounded w-[900] pt-5'>
            <h1 className='text-2xl font-bold text-slate-500'>Create Event</h1>

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
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label htmlFor="image_upload" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Article Image (Optional)
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
                      onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
              MyCustomUploadAdapterPlugin={MyCustomUploadAdapterPlugin}
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
                    // disabled={loading}
                    className="bg-primary text-white px-2 border-2 border-s-slate-100 rounded-2xl "
                    // style={{ opacity: loading ? 0.6 : 1 }}
                  >
                    {/* {loading ? 'Publishing...' : 'Publish Article'} */}
                    {'Create an Event'}
                  </button>
                </div>
      </div>
      </form>
     </div>



    </div>
  )
}

export default Event
