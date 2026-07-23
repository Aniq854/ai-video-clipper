'use client';

import { useState, useRef } from 'react';

export default function UploadBox({ onFileSelect, selectedFile, onUrlSelect, youtubeUrl }) {
  const [activeMode, setActiveMode] = useState(youtubeUrl ? 'link' : 'file');
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState(youtubeUrl || '');
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
      if (onUrlSelect) onUrlSelect('');
    } else {
      alert('Please select a valid video file.');
    }
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    if (onUrlSelect) onUrlSelect(val);
    if (onFileSelect && val) onFileSelect(null);
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
    <div>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => { setActiveMode('file'); if (onUrlSelect) onUrlSelect(''); }}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: activeMode === 'file' ? '1px solid #ffffff' : '1px solid #27272a',
            background: activeMode === 'file' ? '#ffffff' : '#09090b',
            color: activeMode === 'file' ? '#000000' : '#a1a1aa',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          📁 Upload Local Video
        </button>

        <button
          type="button"
          onClick={() => { setActiveMode('link'); if (onFileSelect) onFileSelect(null); }}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: activeMode === 'link' ? '1px solid #ffffff' : '1px solid #27272a',
            background: activeMode === 'link' ? '#ffffff' : '#09090b',
            color: activeMode === 'link' ? '#000000' : '#a1a1aa',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          🔗 YouTube Link
        </button>
      </div>

      {activeMode === 'file' ? (
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
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>{selectedFile.name}</h4>
              <p style={{ color: '#a1a1aa' }}>{formatBytes(selectedFile.size)}</p>
            </div>
          ) : (
            <div>
              <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Drag & drop your video here</h4>
              <p style={{ color: '#a1a1aa' }}>or click to browse (.mp4, .mov, .mkv, .avi, .webm)</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '1rem', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📺</div>
          <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Paste YouTube Video URL</h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Paste any long YouTube video link to generate viral clips & thumbnails automatically.
          </p>
          <input 
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={urlInput}
            onChange={handleUrlChange}
            style={{
              width: '100%',
              padding: '0.875rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #3f3f46',
              background: '#000000',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}
