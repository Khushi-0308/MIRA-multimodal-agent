import React from 'react';
import { useMira } from '../../context/MiraContext';
import { AgentState } from '../../types/agent';
import { SlidersHorizontal } from 'lucide-react';

const ALL_STATES: AgentState[] = [
  'idle',
  'listening',
  'observing',
  'thinking',
  'speaking',
  'waiting for approval',
  'executing',
  'verifying',
  'completed',
  'error',
];

export const StateSimulatorBar: React.FC = () => {
  const { agentState, setAgentState } = useMira();

  return (
    <div className="mira-state-simulator-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        <SlidersHorizontal size={13} style={{ color: 'var(--brand-primary)' }} />
        <span style={{ fontWeight: 800 }}>Agent Mascot States:</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Test all 10 expressive expressions
        </span>
      </div>

      <div className="state-sim-pills">
        {ALL_STATES.map((st) => (
          <button
            key={st}
            className={`state-sim-btn ${agentState === st ? 'active' : ''}`}
            onClick={() => setAgentState(st)}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
};
