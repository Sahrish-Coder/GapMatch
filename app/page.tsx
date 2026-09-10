'use client';

import { useState, KeyboardEvent, useRef, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  course: string;
  confidentTopics: string[];
  strugglingTopics: string[];
}

interface MatchStudent {
  id: string;
  name: string;
  email: string;
  course: string;
}

interface MatchResult {
  student: MatchStudent;
  score: number;
  theyCanTeachYou: string[];
  youCanTeachThem: string[];
  explanation: string;
}

// ─── Micro SVG icons ───────────────────────────────────────────────────────────

const Icon = {
  User: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Book: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
  Cap: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Help: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  Zap: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Link: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Brain: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  ),
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function scoreColor(score: number) {
  if (score >= 70) return {
    stroke: '#34d399', track: 'rgba(52,211,153,0.15)',
    text: '#6ee7b7', glow: 'rgba(52,211,153,0.4)',
    badge: 'rgba(52,211,153,0.12)', badgeBorder: 'rgba(52,211,153,0.3)', badgeText: '#34d399',
    label: 'Excellent Synergy',
  };
  if (score >= 40) return {
    stroke: '#fbbf24', track: 'rgba(251,191,36,0.15)',
    text: '#fde68a', glow: 'rgba(251,191,36,0.4)',
    badge: 'rgba(251,191,36,0.1)', badgeBorder: 'rgba(251,191,36,0.3)', badgeText: '#fbbf24',
    label: 'Good Potential',
  };
  return {
    stroke: '#f87171', track: 'rgba(248,113,113,0.15)',
    text: '#fca5a5', glow: 'rgba(248,113,113,0.4)',
    badge: 'rgba(248,113,113,0.1)', badgeBorder: 'rgba(248,113,113,0.25)', badgeText: '#f87171',
    label: 'Partial Match',
  };
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

interface ToastData {
  id: number;
  email: string;
  name: string;
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        maxWidth: 480,
        width: 'calc(100vw - 2rem)',
      }}
    >
      <div style={{
        background: 'rgba(15,20,40,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '1rem',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15), 0 0 32px rgba(99,102,241,0.15)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
      }}>
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))',
          border: '1px solid rgba(52,211,153,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          boxShadow: '0 0 12px rgba(52,211,153,0.25)',
        }}>
          ✓
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>
            Email copied to clipboard!
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, wordBreak: 'break-all' }}>
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>{toast.email}</span>
            {' '}— reach out to {toast.name.split(' ')[0]} to start your study session 🎓
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem',
            lineHeight: 1, padding: '2px 4px', flexShrink: 0,
            transition: 'color 0.15s',
          }}
        >×</button>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 2,
        marginTop: 4,
        borderRadius: 9999,
        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
        animation: 'toast-bar 3.5s linear forwards',
        opacity: 0.7,
      }} aria-hidden="true" />
    </div>
  );
}

// ─── ScoreRing ─────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const c = scoreColor(score);

  return (
    <div
      style={{
        position: 'relative',
        width: 96,
        height: 96,
        flexShrink: 0,
        filter: `drop-shadow(0 0 10px ${c.glow})`,
      }}
      aria-label={`Compatibility score: ${score}%`}
    >
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        {/* Outer glow track */}
        <circle cx="48" cy="48" r={r} fill="none" stroke={c.track} strokeWidth="10" />
        {/* Progress arc */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={c.stroke}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 1,
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: c.text, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {score}%
        </span>
        <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          match
        </span>
      </div>
    </div>
  );
}

// ─── Skill Topic Input Panel ────────────────────────────────────────────────────

interface TopicPanelProps {
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  icon: React.ReactNode;
  headerGradient: string;
  headerBorder: string;
  panelClass: string;
  topics: string[];
  onAdd: (t: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
  pillColor: string;
  pillBg: string;
  pillBorder: string;
  addBtnColor: string;
  inputFocusClass: string;
  newPillIndices: number[];
}

function TopicPanel({
  id, title, subtitle, hint, icon,
  headerGradient, headerBorder, panelClass,
  topics, onAdd, onRemove, placeholder,
  pillColor, pillBg, pillBorder, addBtnColor,
  newPillIndices,
}: TopicPanelProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const v = input.trim();
    if (v) { onAdd(v); setInput(''); }
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
  }

  return (
    <div
      className={`gm-topic-panel ${panelClass}`}
      style={{
        borderRadius: '1rem',
        border: `1px solid ${headerBorder}`,
        background: 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: '0.875rem 1.125rem',
        background: headerGradient,
        borderBottom: `1px solid ${headerBorder}`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ color: pillColor, display: 'flex' }}>{icon}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{subtitle}</p>
        </div>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, color: pillColor,
          background: pillBg, border: `1px solid ${pillBorder}`,
          borderRadius: 9999, padding: '2px 10px', whiteSpace: 'nowrap', marginTop: 2,
        }}>
          {topics.length} added
        </span>
      </div>

      {/* Input area */}
      <div style={{ padding: '0.875rem 1.125rem' }}>
        <label htmlFor={id} style={{
          display: 'block', fontSize: '0.75rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '0.04em',
        }}>
          Type a topic — press Enter or comma to add
        </label>

        {/* Tag box */}
        <div
          style={{
            minHeight: 48,
            display: 'flex', flexWrap: 'wrap', gap: 6,
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.2)',
            border: `1px solid ${headerBorder}`,
            borderRadius: '0.625rem',
            alignItems: 'center',
            cursor: 'text',
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {topics.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className={`gm-pill${newPillIndices.includes(i) ? ' gm-pill-new' : ''}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 8px 4px 11px',
                borderRadius: 9999,
                border: `1px solid ${pillBorder}`,
                background: pillBg,
                color: pillColor,
                fontSize: '0.8125rem', fontWeight: 600,
                userSelect: 'none', cursor: 'default',
              }}
            >
              {t}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                aria-label={`Remove ${t}`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: pillColor, opacity: 0.65, fontSize: '0.95rem',
                  lineHeight: 1, padding: '0 2px',
                  display: 'flex', alignItems: 'center',
                  transition: 'opacity 0.15s',
                }}
              >×</button>
            </span>
          ))}
          <input
            id={id}
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={topics.length === 0 ? placeholder : 'Add another…'}
            className="gm-input"
            style={{
              flex: 1, minWidth: 100,
              background: 'transparent', border: 'none', outline: 'none',
              color: '#f1f5f9', fontSize: '0.9rem', padding: '2px 0',
            }}
            aria-label={title}
          />
        </div>

        {/* Add button + hint */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={commit}
            disabled={!input.trim()}
            className="gm-add-btn"
            style={{
              padding: '4px 14px',
              fontSize: '0.78rem', fontWeight: 700,
              borderRadius: 6,
              border: `1px solid ${pillBorder}`,
              color: addBtnColor,
              background: pillBg,
              cursor: 'pointer',
            }}
          >
            + Add Topic
          </button>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{hint}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────

function LoadingScreen({ stage }: { stage: 'submitting' | 'fetching' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '55vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.75rem', textAlign: 'center',
      }}
    >
      {/* Nested rings spinner */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.2)',
          animation: 'pulse-ring 1.8s ease-in-out infinite',
        }} aria-hidden="true" />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.12)',
          borderTopColor: '#818cf8',
          animation: 'spin 0.8s linear infinite',
        }} aria-hidden="true" />
        <div style={{
          position: 'absolute', inset: 18, borderRadius: '50%',
          border: '2px solid rgba(167,139,250,0.1)',
          borderBottomColor: '#c084fc',
          animation: 'spin 1.2s linear infinite reverse',
        }} aria-hidden="true" />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} aria-hidden="true">
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 0 16px rgba(99,102,241,0.9)',
          }} />
        </div>
      </div>

      <div>
        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
          {stage === 'submitting' ? 'Saving your profile…' : 'Running AI Knowledge Matching…'}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', maxWidth: 340, margin: '0 auto' }}>
          {stage === 'fetching'
            ? 'Generating semantic embeddings and calculating complementary coverage scores'
            : 'Storing your knowledge profile to Supabase'}
        </p>
      </div>

      {stage === 'fetching' && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Embedding topics', 'Scoring gaps', 'Generating insights'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#6366f1',
                boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                animation: `pulse-ring 1.5s ease-in-out ${i * 0.4}s infinite`,
              }} />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Synergy Card ────────────────────────────────────────────────────────

function SynergyCard({ match, rank }: { match: MatchResult; rank: number }) {
  const c = scoreColor(match.score);
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  return (
    <article
      className="gm-match-card gm-fade-up"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
        borderRadius: '1.375rem',
        overflow: 'hidden',
      }}
      aria-label={`Study Synergy Card ${rank}: ${match.student.name}`}
    >
      {/* ── Card top stripe ── */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${c.stroke}, transparent)`,
        opacity: 0.8,
      }} aria-hidden="true" />

      <div style={{ padding: '1.375rem 1.5rem 1.5rem' }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.0625rem', fontWeight: 900, color: '#fff',
            boxShadow: '0 0 20px rgba(99,102,241,0.45), 0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '0.02em',
          }} aria-hidden="true">
            {initials(match.student.name)}
          </div>

          {/* Name block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: '1.0625rem', fontWeight: 700, color: '#f1f5f9',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {match.student.name}
              </h3>
              {/* Rank badge */}
              <span style={{
                fontSize: '0.65rem', fontWeight: 800,
                color: rank === 1 ? '#fde68a' : 'rgba(255,255,255,0.4)',
                background: rank === 1 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${rank === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 4, padding: '2px 8px',
              }}>
                {rank === 1 ? '🏆 #1 Match' : `#${rank}`}
              </span>
              {/* Score quality badge */}
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: c.badgeText,
                background: c.badge, border: `1px solid ${c.badgeBorder}`,
                borderRadius: 4, padding: '2px 8px',
              }}>
                {c.label}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
              📚 {match.student.course}
            </p>
          </div>

          <ScoreRing score={match.score} />
        </div>

        {/* ── Synergy badge ── */}
        {(() => {
          const s = match.score;
          const badge = s >= 85
            ? { emoji: '🔥', label: 'Ideal Partner',  color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.45)', glow: 'rgba(244,114,182,0.25)' }
            : s >= 70
            ? { emoji: '⚡', label: 'High Synergy',   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.4)',  glow: 'rgba(251,191,36,0.2)'  }
            : { emoji: '💡', label: 'Skill Swap',     color: '#818cf8', bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.35)', glow: 'rgba(99,102,241,0.18)' };

          return (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 11px',
              borderRadius: 9999,
              border: `1px solid ${badge.border}`,
              background: badge.bg,
              boxShadow: `0 0 10px ${badge.glow}`,
              fontSize: '0.72rem', fontWeight: 800,
              color: badge.color,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              marginBottom: '1rem',
            }}>
              <span>{badge.emoji}</span>
              {badge.label}
            </div>
          );
        })()}
        {match.explanation && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.125rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.13) 0%, rgba(99,102,241,0.07) 100%)',
            borderLeft: '3px solid rgba(167,139,250,0.65)',
            borderRadius: '0 0.75rem 0.75rem 0',
            border: '1px solid rgba(167,139,250,0.18)',
            borderLeftWidth: 3,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <span style={{ color: '#a78bfa', display: 'flex' }}><Icon.Brain /></span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#a78bfa',
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 4, padding: '2px 8px',
              }}>
                ✦ AI Insight
              </span>
            </div>
            <p style={{
              fontSize: '0.875rem', color: 'rgba(241,245,249,0.82)',
              lineHeight: 1.7, fontStyle: 'italic',
            }}>
              "{match.explanation}"
            </p>
          </div>
        )}

        {/* ── Knowledge Exchange Matrix ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            marginBottom: '0.75rem',
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
              Knowledge Exchange Matrix
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* They teach you */}
            <ExchangeColumn
              title="They Can Teach You"
              emoji="📖"
              topics={match.theyCanTeachYou}
              color="#818cf8"
              bg="rgba(99,102,241,0.1)"
              border="rgba(99,102,241,0.25)"
              headerColor="rgba(99,102,241,0.18)"
              empty="No direct overlap"
            />
            {/* You teach them */}
            <ExchangeColumn
              title="You Can Teach Them"
              emoji="💡"
              topics={match.youCanTeachThem}
              color="#34d399"
              bg="rgba(52,211,153,0.1)"
              border="rgba(52,211,153,0.25)"
              headerColor="rgba(52,211,153,0.12)"
              empty="No direct overlap"
            />
          </div>
        </div>

        {/* ── Connect button ── */}
        {/* ── Connect button / contact reveal ── */}
        {!showContact ? (
          <button
            type="button"
            className="gm-btn-connect gm-connect-glow"
            onClick={() => setShowContact(true)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              fontSize: '0.9375rem', fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
              border: 'none', borderRadius: '0.75rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              letterSpacing: '0.01em',
            }}
          >
            <Icon.Link />
            Connect with {match.student.name.split(' ')[0]}
          </button>
        ) : (
          <div style={{
            borderRadius: '0.875rem',
            border: '1px solid rgba(99,102,241,0.45)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(124,58,237,0.08) 100%)',
            boxShadow: '0 0 24px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            padding: '1rem 1.125rem',
            animation: 'fade-up 0.25s ease both',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.9rem' }}>📬</span>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#a78bfa',
              }}>
                Contact {match.student.name.split(' ')[0]}
              </span>
            </div>

            {/* Email display */}
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              padding: '0.625rem 0.875rem',
              marginBottom: '0.75rem',
              wordBreak: 'break-all',
              fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
              fontSize: '0.875rem',
              color: '#e2e8f0',
              letterSpacing: '0.01em',
            }}>
              {match.student.email}
            </div>

            {/* ── Suggested Icebreaker ── */}
            {(() => {
              const theirStrength = match.theyCanTeachYou[0];
              const myGap = match.youCanTeachThem[0];
              if (!theirStrength && !myGap) return null;
              const firstName = match.student.name.split(' ')[0];
              const icebreaker = theirStrength && myGap
                ? `Hey ${firstName}! I noticed you know ${theirStrength} — would love to swap study tips on ${myGap}!`
                : theirStrength
                  ? `Hey ${firstName}! I saw you're strong in ${theirStrength} — I'd love to learn from you!`
                  : `Hey ${firstName}! I can help you with ${myGap} — want to set up a study session?`;

              return (
                <div style={{
                  marginBottom: '0.75rem',
                  borderRadius: '0.625rem',
                  border: '1px solid rgba(251,191,36,0.2)',
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, rgba(245,158,11,0.04) 100%)',
                  overflow: 'hidden',
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '0.5rem 0.875rem',
                    borderBottom: '1px solid rgba(251,191,36,0.15)',
                    background: 'rgba(251,191,36,0.07)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: '0.8rem' }}>💬</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#fbbf24',
                    }}>
                      Suggested Icebreaker
                    </span>
                  </div>

                  {/* Message body */}
                  <div style={{ padding: '0.625rem 0.875rem 0.5rem' }}>
                    <p style={{
                      fontSize: '0.8125rem', color: 'rgba(253,230,138,0.85)',
                      lineHeight: 1.6, fontStyle: 'italic', marginBottom: '0.5rem',
                    }}>
                      "{icebreaker}"
                    </p>

                    {/* Copy message button */}
                    <button
                      type="button"
                      onClick={() => {
                        const write = navigator.clipboard?.writeText(icebreaker);
                        const finish = () => {
                          setCopiedMsg(true);
                          setTimeout(() => setCopiedMsg(false), 2000);
                        };
                        write ? write.then(finish).catch(finish) : finish();
                      }}
                      className="gm-add-btn"
                      style={{
                        padding: '3px 12px',
                        fontSize: '0.75rem', fontWeight: 700,
                        borderRadius: 6,
                        border: '1px solid rgba(251,191,36,0.3)',
                        color: copiedMsg ? '#6ee7b7' : '#fbbf24',
                        background: copiedMsg ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      {copiedMsg ? '✓ Copied!' : '📋 Copy Message'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Actions row */}
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Copy button */}
              <button
                type="button"
                className="gm-btn-connect"
                onClick={() => {
                  const write = navigator.clipboard?.writeText(match.student.email);
                  const finish = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
                  write ? write.then(finish).catch(finish) : finish();
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.875rem',
                  fontSize: '0.875rem', fontWeight: 700,
                  color: copied ? '#6ee7b7' : '#fff',
                  background: copied
                    ? 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.15))'
                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  border: copied ? '1px solid rgba(52,211,153,0.4)' : 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: copied ? '0 0 12px rgba(52,211,153,0.25)' : '0 2px 12px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ Copied!' : <><Icon.Link /> Copy Email</>}
              </button>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => { setShowContact(false); setCopied(false); setCopiedMsg(false); }}
                className="gm-btn-secondary"
                style={{
                  padding: '0.55rem 0.875rem',
                  fontSize: '0.8125rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ExchangeColumn({
  title, emoji, topics, color, bg, border, headerColor, empty,
}: {
  title: string; emoji: string; topics: string[];
  color: string; bg: string; border: string; headerColor: string; empty: string;
}) {
  return (
    <div style={{
      borderRadius: '0.75rem',
      border: `1px solid ${border}`,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        background: headerColor,
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <span style={{ fontSize: '0.8rem' }}>{emoji}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.07em',
          textTransform: 'uppercase', color }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0.625rem 0.75rem' }}>
        {topics.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {topics.map((t, i) => (
              <span
                key={i}
                className="gm-pill"
                style={{
                  display: 'inline-block',
                  padding: '3px 9px',
                  borderRadius: 9999,
                  border: `1px solid ${border}`,
                  background: bg,
                  color,
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'default',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}>{empty}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type PageState = 'form' | 'submitting' | 'fetching' | 'results' | 'no-matches' | 'error';

export default function Home() {
  const [form, setForm] = useState<FormData>({
    name: '', email: '', course: '',
    confidentTopics: [], strugglingTopics: [],
  });
  const [pageState, setPageState] = useState<PageState>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [submittedName, setSubmittedName] = useState('');
  const [formError, setFormError] = useState('');
  // Track indices of newly added pills for pop animation
  const [newConfident, setNewConfident] = useState<number[]>([]);
  const [newStruggling, setNewStruggling] = useState<number[]>([]);
  // Toast state
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleConnect = useCallback((email: string, name: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(email).catch(() => {
      // Fallback for browsers that block clipboard without HTTPS
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });

    // Clear any existing toast timer
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    const id = Date.now();
    setToast({ id, email, name });

    // Auto-dismiss after 3.5s
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  function field(key: keyof Pick<FormData, 'name' | 'email' | 'course'>) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function addTopic(key: 'confidentTopics' | 'strugglingTopics') {
    return (t: string) => {
      setForm((p) => {
        if (p[key].includes(t)) return p;
        const next = [...p[key], t];
        const newIdx = next.length - 1;
        if (key === 'confidentTopics') {
          setNewConfident((prev) => [...prev, newIdx]);
          setTimeout(() => setNewConfident((prev) => prev.filter((i) => i !== newIdx)), 400);
        } else {
          setNewStruggling((prev) => [...prev, newIdx]);
          setTimeout(() => setNewStruggling((prev) => prev.filter((i) => i !== newIdx)), 400);
        }
        return { ...p, [key]: next };
      });
    };
  }

  function removeTopic(key: 'confidentTopics' | 'strugglingTopics') {
    return (i: number) =>
      setForm((p) => ({ ...p, [key]: p[key].filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.email.trim() || !form.course.trim()) {
      setFormError('Name, email, and course are all required.'); return;
    }
    if (!form.confidentTopics.length || !form.strugglingTopics.length) {
      setFormError('Add at least one topic to each column.'); return;
    }
    setPageState('submitting');
    try {
      const saveRes = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!saveRes.ok) {
        const d = await saveRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Server error ${saveRes.status}`);
      }
      const { email, name } = form;
      setPageState('fetching');
      const matchRes = await fetch(`/api/matches?email=${encodeURIComponent(email)}`);
      if (!matchRes.ok) {
        const d = await matchRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Server error ${matchRes.status}`);
      }
      const { matches: fetched } = await matchRes.json();
      setSubmittedName(name);
      setMatches(fetched ?? []);
      setPageState((fetched ?? []).length > 0 ? 'results' : 'no-matches');
      setForm({ name: '', email: '', course: '', confidentTopics: [], strugglingTopics: [] });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setPageState('error');
    }
  }

  function reset() {
    setPageState('form'); setMatches([]);
    setErrorMsg(''); setFormError(''); setSubmittedName('');
  }

  // ── Shared glass card wrapper ───────────────────────────────────────────────

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: '100vh', padding: '0 1rem 5rem' }}>

      {/* ══════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════ */}
      <header style={{ textAlign: 'center', padding: '3.25rem 1rem 2rem' }}>

        {/* Academic badge tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#fde68a',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 9999, padding: '5px 16px',
          marginBottom: '1.5rem',
          animation: 'float-badge 3s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(251,191,36,0.15)',
        }}>
          <Icon.Zap />
          AI Knowledge Matchmaker
        </div>

        {/* Glowing title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 30%, #c084fc 55%, #f472b6 85%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.875rem',
          filter: 'drop-shadow(0 0 30px rgba(167,139,250,0.25))',
        }}>
          GapMatch
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(0.975rem, 2.5vw, 1.1875rem)',
          color: 'rgba(226,232,240,0.6)',
          maxWidth: 520, margin: '0 auto 1.75rem',
          lineHeight: 1.65, fontWeight: 400,
        }}>
          Discover study partners whose knowledge perfectly complements yours —
          powered by semantic AI embeddings.
        </p>

        {/* Stats banner */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '1.5rem',
          flexWrap: 'wrap', justifyContent: 'center',
          padding: '0.75rem 1.75rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="gm-stat-shimmer" style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
          }} aria-hidden="true" />
          {[
            { icon: '🎯', val: '100%', label: 'Complementary Coverage' },
            { icon: '🧠', val: 'AI', label: 'Semantic Matching' },
            { icon: '⚡', val: 'Live', label: 'Instant Results' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#e2e8f0' }}>{stat.val}</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Loading */}
        {(pageState === 'submitting' || pageState === 'fetching') && (
          <LoadingScreen stage={pageState} />
        )}

        {/* ── Results ── */}
        {pageState === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Results banner */}
            <div style={{
              ...glass, borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Synergy Report
                </p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Hey {submittedName} 👋 — found {matches.length} study partner{matches.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <button className="gm-btn-secondary" onClick={reset} style={{
                padding: '0.55rem 1.125rem',
                fontSize: '0.875rem', fontWeight: 600,
                color: '#818cf8',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                ← Update profile
              </button>
            </div>
            {matches.map((m, i) => (
              <SynergyCard key={m.student.id} match={m} rank={i + 1} />
            ))}
          </div>
        )}

        {/* ── No matches ── */}
        {pageState === 'no-matches' && (
          <div style={{ ...glass, borderRadius: '1.25rem', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔭</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.625rem' }}>
              No matches yet
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.25rem', maxWidth: 380, margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
              You're the first student in this course. Share GapMatch with classmates — your perfect study partner is one registration away.
            </p>
            <button
              className="gm-btn-primary"
              onClick={reset}
              style={{
                padding: '0.8rem 2rem', fontSize: '0.9375rem', fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none', borderRadius: '0.75rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              ← Back to form
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {pageState === 'error' && (
          <div style={{ ...glass, borderRadius: '1.25rem', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f87171', marginBottom: '0.625rem' }}>
              Something went wrong
            </h2>
            <p style={{
              color: 'rgba(248,113,113,0.8)', fontSize: '0.9rem',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '0.625rem', padding: '0.75rem 1.25rem',
              maxWidth: 420, margin: '0 auto 2.25rem', lineHeight: 1.6,
            }}>
              {errorMsg}
            </p>
            <button
              className="gm-btn-primary"
              onClick={reset}
              style={{
                padding: '0.8rem 2rem', fontSize: '0.9375rem', fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none', borderRadius: '0.75rem', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              ← Try again
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════
            REGISTRATION FORM
        ══════════════════════════════════════ */}
        {pageState === 'form' && (
          <div style={{ ...glass, borderRadius: '1.5rem', overflow: 'hidden' }}>

            {/* Form header */}
            <div style={{
              padding: '1.75rem 2rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(124,58,237,0.05) 100%)',
            }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 5 }}>
                Build Your Knowledge Profile
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                Tell us what you know and what you're still learning — our AI will find your ideal study partners.
              </p>
            </div>

            <div style={{ padding: '1.75rem 2rem' }}>
              <form onSubmit={handleSubmit} noValidate>

                {/* ── Identity fields ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: 'rgba(241,245,249,0.65)', marginBottom: 7,
                    }}>
                      <span style={{ color: '#818cf8' }}><Icon.User /></span>
                      Full Name
                    </label>
                    <input
                      id="name" type="text" value={form.name}
                      onChange={field('name')}
                      placeholder="e.g. Alex Johnson"
                      className="gm-input"
                      style={{
                        width: '100%', padding: '0.7rem 0.875rem',
                        fontSize: '0.9375rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.625rem', color: '#f1f5f9',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: '0.8125rem', fontWeight: 600,
                      color: 'rgba(241,245,249,0.65)', marginBottom: 7,
                    }}>
                      <span style={{ color: '#818cf8' }}><Icon.Mail /></span>
                      Email Address
                    </label>
                    <input
                      id="email" type="email" value={form.email}
                      onChange={field('email')}
                      placeholder="e.g. alex@university.edu"
                      className="gm-input"
                      style={{
                        width: '100%', padding: '0.7rem 0.875rem',
                        fontSize: '0.9375rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.625rem', color: '#f1f5f9',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Course */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label htmlFor="course" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: 'rgba(241,245,249,0.65)', marginBottom: 7,
                  }}>
                    <span style={{ color: '#818cf8' }}><Icon.Cap /></span>
                    Course Name
                  </label>
                  <input
                    id="course" type="text" value={form.course}
                    onChange={field('course')}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="gm-input"
                    style={{
                      width: '100%', padding: '0.7rem 0.875rem',
                      fontSize: '0.9375rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.625rem', color: '#f1f5f9',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* ── Split canvas: 2-column topic panels ── */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                    <span style={{ color: '#818cf8', display: 'flex' }}><Icon.Book /></span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(241,245,249,0.75)' }}>
                      Knowledge Profile
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                      Fill both columns
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {/* Left — Strengths (emerald) */}
                    <TopicPanel
                      id="confident"
                      title="What You Can Teach"
                      subtitle="Topics you're confident explaining to others"
                      hint="Be specific — 'Big O Notation' beats 'algorithms'"
                      icon={<Icon.Star />}
                      headerGradient="linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.06) 100%)"
                      headerBorder="rgba(52,211,153,0.25)"
                      panelClass="gm-topic-panel-green"
                      topics={form.confidentTopics}
                      onAdd={addTopic('confidentTopics')}
                      onRemove={removeTopic('confidentTopics')}
                      placeholder="e.g. Binary Trees, Recursion…"
                      pillColor="#6ee7b7"
                      pillBg="rgba(52,211,153,0.12)"
                      pillBorder="rgba(52,211,153,0.35)"
                      addBtnColor="#34d399"
                      inputFocusClass="gm-input"
                      newPillIndices={newConfident}
                    />

                    {/* Right — Gaps (amber/rose) */}
                    <TopicPanel
                      id="struggling"
                      title="Where You Need Help"
                      subtitle="Topics you're actively trying to improve"
                      hint="The more specific, the better your matches"
                      icon={<Icon.Help />}
                      headerGradient="linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,113,133,0.07) 100%)"
                      headerBorder="rgba(251,191,36,0.25)"
                      panelClass="gm-topic-panel-amber"
                      topics={form.strugglingTopics}
                      onAdd={addTopic('strugglingTopics')}
                      onRemove={removeTopic('strugglingTopics')}
                      placeholder="e.g. Dynamic Programming, Big-O…"
                      pillColor="#fde68a"
                      pillBg="rgba(251,191,36,0.1)"
                      pillBorder="rgba(251,191,36,0.3)"
                      addBtnColor="#fbbf24"
                      inputFocusClass="gm-input"
                      newPillIndices={newStruggling}
                    />
                  </div>
                </div>

                {/* Validation error */}
                {formError && (
                  <div role="alert" style={{
                    marginBottom: '1.25rem', padding: '0.75rem 1rem',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: '0.625rem', color: '#fca5a5', fontSize: '0.875rem',
                  }}>
                    {formError}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={pageState === 'submitting' || pageState === 'fetching'}
                  className="gm-btn-primary"
                  style={{
                    width: '100%', padding: '0.9rem',
                    fontSize: '1rem', fontWeight: 800,
                    color: '#fff',
                    background: (pageState === 'submitting' || pageState === 'fetching')
                      ? 'linear-gradient(135deg, #3730a3 0%, #5b21b6 50%, #7e22ce 100%)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                    border: 'none', borderRadius: '0.875rem',
                    cursor: (pageState === 'submitting' || pageState === 'fetching') ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.01em',
                    boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                    opacity: (pageState === 'submitting' || pageState === 'fetching') ? 0.75 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {(pageState === 'submitting' || pageState === 'fetching') ? (
                    <>
                      {/* Inline mini spinner */}
                      <span style={{
                        width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
                        border: '2.5px solid rgba(255,255,255,0.25)',
                        borderTopColor: '#fff',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block',
                      }} aria-hidden="true" />
                      {pageState === 'submitting' ? 'Saving profile…' : 'Analyzing Knowledge Gaps…'}
                    </>
                  ) : (
                    <>
                      <Icon.Zap />
                      Find My Study Partners
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
