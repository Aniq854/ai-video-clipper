'use client';

import { useEffect, useState, useRef } from 'react';

function AdsterraSlot({ adKey = 'efe0fefd36bfb795e47ea6fa1736f7e3', refreshKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous ad content safely
    containerRef.current.innerHTML = '';

    // Create an isolated iframe for safe Adsterra script execution
    const iframe = document.createElement('iframe');
    iframe.width = '728';
    iframe.height = '90';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';

    containerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; }</style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${adKey}',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
        </body>
      </html>
    `);
    doc.close();
  }, [refreshKey, adKey]);

  return (
    <div 
      ref={containerRef} 
      className="ad-slot-wrapper"
      style={{
        width: '100%',
        maxWidth: '728px',
        height: '90px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    />
  );
}

export default function HeaderAds() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh ads automatically every 30 seconds for maximum impression rotation
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header-ads-container">
      <div className="ads-flex-layout">
        <div className="ad-box">
          <span className="ad-badge">ADVERTISEMENT</span>
          <AdsterraSlot refreshKey={refreshKey} />
        </div>
        <div className="ad-box desktop-only">
          <span className="ad-badge">ADVERTISEMENT</span>
          <AdsterraSlot refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
