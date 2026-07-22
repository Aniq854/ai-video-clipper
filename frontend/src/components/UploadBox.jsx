'use client';

import { useState, useRef } from 'react';

export default function UploadBox({ onFileSelect, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type.startsWith('video/')) {
      onFileSelect(file);
    } else {
      alert('Please select a valid video file.');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div 
      className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        accept="video/*" 
        onChange={handleChange} 
        style={{ display: 'none' }} 
      />
      
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {dragActive ? '📥' : '🎬'}
      </div>
      
      {selectedFile ? (
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{selectedFile.name}</h4>
          <p style={{ color: 'var(--text-secondary)' }}>{formatBytes(selectedFile.size)}</p>
        </div>
      ) : (
        <div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Drag & drop your video here</h4>
          <p style={{ color: 'var(--text-secondary)' }}>or click to browse (.mp4, .mov, .mkv, .avi, .webm)</p>
        </div>
      )}
    </div>
  );
}
