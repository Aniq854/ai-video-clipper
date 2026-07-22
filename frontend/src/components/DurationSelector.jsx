'use client';

export default function DurationSelector({ selected, onSelect }) {
  const durations = [20, 30, 40, 60];

  return (
    <div className="duration-pills">
      {durations.map(duration => (
        <button
          key={duration}
          className={`duration-pill ${selected === duration ? 'active' : ''}`}
          onClick={() => onSelect(duration)}
        >
          ~{duration}s Clips
        </button>
      ))}
    </div>
  );
}
