'use client';

export default function PlatformSelector({ selected, onSelect }) {
  const platforms = [
    {
      id: '9:16',
      label: 'Vertical (9:16)',
      desc: 'TikTok, Instagram Reels, Shorts',
      icon: '📱'
    },
    {
      id: '16:9',
      label: 'Landscape (16:9)',
      desc: 'YouTube, Facebook Watch',
      icon: '🎬'
    },
    {
      id: '1:1',
      label: 'Square (1:1)',
      desc: 'Instagram Feed, Facebook',
      icon: '🟦'
    }
  ];

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
        Select Platform / Size:
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {platforms.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
