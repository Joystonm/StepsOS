import React from 'react';

interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function ReplayButton({ onClick, disabled, loading }: ReplayButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="replay-button"
    >
      {loading ? '⏳ Replaying...' : '🔄 Replay'}
    </button>
  );
}
