'use client';

import React from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; // ✅ Runtime value import
// import type { Editor as ClassicEditorType } from '@ckeditor/ckeditor5-core'; // ✅ Optional for typing if needed
import { CKEditor } from '@ckeditor/ckeditor5-react';

type Props = {
  value: string;
  onChange: (data: string) => void;
  uploadAdapter: (editor: ClassicEditor) => void;
};

export default function ClientCKEditor({ value, onChange, uploadAdapter }: Props) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      onReady={(editor: ClassicEditor) => {
        uploadAdapter(editor);
      }}
      onChange={(_: unknown, editor: ClassicEditor) => {
        const data = editor.getData();
        onChange(data);
      }}
      config={{
        placeholder: 'Write your content...',
        toolbar: [
          'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
          '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'imageUpload', 'undo', 'redo'
        ]
      }}
    />
  );
}

