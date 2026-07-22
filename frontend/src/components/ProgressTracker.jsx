'use client';

export default function ProgressTracker({ status, progress }) {
  const steps = [
    { id: 'uploading', label: 'Uploading Video' },
    { id: 'extracting', label: 'Extracting Audio' },
    { id: 'transcribing', label: 'Transcribing' },
    { id: 'analyzing', label: 'AI Analysis' },
    { id: 'cutting', label: 'Cutting Clips' },
    { id: 'thumbnails', label: 'Generating Thumbnails' },
    { id: 'done', label: 'Complete' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);
  const safeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div>
      <div className="step-list">
        {steps.map((step, index) => {
          const isDone = index < safeIndex || status === 'done';
          const isActive = index === safeIndex && status !== 'done';
          
          return (
            <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="step-indicator">
                {isDone ? '✓' : index + 1}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
