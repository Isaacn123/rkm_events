// components/DynamicCKEditorWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicCKEditor = dynamic(() => import('./ClientCKEditor'), {
  ssr: false,
});

interface FormData {
  description: string;
  title: string;
  date: string;
  start_date: string;
  end_date: string;
  dates?: string; // Keep for backward compatibility
  time: string;
  image_url: string;
  location: string;
  author: string;
  slug: string;
  published: boolean;
}
interface DynamicCKEditorWrapperProps {
  formData:FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  MyCustomUploadAdapterPlugin: (editor: {
    plugins: {
      get(name: string): {
        createUploadAdapter?: (loader: unknown) => unknown;
      };
    };
  }) => void;
}

export default function DynamicCKEditorWrapper({formData, setFormData, MyCustomUploadAdapterPlugin }:DynamicCKEditorWrapperProps) {
  return        <DynamicCKEditor
                    value={formData.description}
                    onChange={(data) => setFormData(prev => ({ ...prev, description: data }))}
                    uploadAdapter={MyCustomUploadAdapterPlugin}
                  />;
}
