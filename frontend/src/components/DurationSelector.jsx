'use client';

export default function DurationSelector({ selected, onSelect }) {
  const durations = [20, 30, 60, 180, 300, 420, 600];

  const formatLabel = (val) => {
    if (val < 60) return `${val}s Clips`;
    return `${val / 60}min Clips`;
  };

  return (
    <div className="duration-pills" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {durations.map(duration => (
        <button
          key={duration}
          type="button"
          className={`duration-pill ${selected === duration ? 'active' : ''}`}
          onClick={() => onSelect(duration)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            border: '1px solid var(--border-color)',
            background: selected === duration ? '#ffffff' : 'transparent',
            color: selected === duration ? '#000000' : 'var(--text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem'
          }}
        >
          {formatLabel(duration)}
        </button>
      ))}
    </div>
  );
}
