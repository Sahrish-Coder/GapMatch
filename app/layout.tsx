export const metadata = {
  title: 'GapMatch — AI Knowledge Matchmaker',
  description: 'Match with study partners who fill your knowledge gaps using semantic AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: #060b18;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #f1f5f9;
            overflow-x: hidden;
          }

          /* ── Mesh gradient background ── */
          .gm-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background:
              radial-gradient(ellipse 100% 80% at 10% -10%,  rgba(79,70,229,0.22)  0%, transparent 55%),
              radial-gradient(ellipse 70%  60% at 90%  20%,  rgba(124,58,237,0.16) 0%, transparent 50%),
              radial-gradient(ellipse 80%  70% at 50% 100%,  rgba(6,182,212,0.10)  0%, transparent 55%),
              radial-gradient(ellipse 60%  50% at 80%  70%,  rgba(236,72,153,0.09) 0%, transparent 50%),
              #060b18;
            pointer-events: none;
          }

          /* ── Fine dot grid ── */
          .gm-grid {
            position: fixed;
            inset: 0;
            z-index: 0;
            background-image: radial-gradient(rgba(148,163,184,0.08) 1px, transparent 1px);
            background-size: 28px 28px;
            pointer-events: none;
          }

          /* ── Page content sits above bg ── */
          .gm-page { position: relative; z-index: 1; }

          /* ════════════════════════════════
             KEYFRAMES
          ════════════════════════════════ */
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0%, 100% { transform: scale(1);    opacity: 0.7; }
            50%       { transform: scale(1.12); opacity: 0.3; }
          }
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pop-in {
            0%   { opacity: 0; transform: scale(0.65); }
            70%  { transform: scale(1.08); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes shimmer-slide {
            from { background-position: -300% center; }
            to   { background-position:  300% center; }
          }
          @keyframes float-badge {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-4px); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 16px rgba(99,102,241,0.3), 0 4px 20px rgba(0,0,0,0.3); }
            50%       { box-shadow: 0 0 32px rgba(99,102,241,0.6), 0 4px 20px rgba(0,0,0,0.3); }
          }
          @keyframes border-glow {
            0%, 100% { border-color: rgba(99,102,241,0.3); }
            50%       { border-color: rgba(167,139,250,0.7); }
          }

          /* ════════════════════════════════
             INTERACTIVE STATES
          ════════════════════════════════ */

          /* Input focus */
          .gm-input:focus {
            outline: none;
            border-color: rgba(99,102,241,0.8) !important;
            box-shadow:
              0 0 0 3px rgba(99,102,241,0.18),
              0 0 20px rgba(99,102,241,0.12),
              inset 0 1px 0 rgba(255,255,255,0.06) !important;
            background: rgba(99,102,241,0.08) !important;
          }

          /* Primary button */
          .gm-btn-primary {
            transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          }
          .gm-btn-primary:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 0 36px rgba(99,102,241,0.55), 0 8px 24px rgba(0,0,0,0.35) !important;
            filter: brightness(1.1);
          }
          .gm-btn-primary:active:not(:disabled) {
            transform: translateY(0) scale(0.99);
          }
          .gm-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

          /* Secondary button */
          .gm-btn-secondary {
            transition: all 0.18s ease;
          }
          .gm-btn-secondary:hover {
            background: rgba(99,102,241,0.18) !important;
            border-color: rgba(99,102,241,0.55) !important;
            transform: translateY(-1px);
            color: #c4b5fd !important;
          }

          /* Connect button */
          .gm-btn-connect {
            transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          }
          .gm-btn-connect:hover {
            transform: translateY(-2px) scale(1.02);
            filter: brightness(1.15);
          }
          .gm-btn-connect:active { transform: translateY(0) scale(0.98); }

          /* Match card */
          .gm-match-card {
            transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          }
          .gm-match-card:hover {
            transform: translateY(-4px);
            border-color: rgba(99,102,241,0.4) !important;
            box-shadow: 0 28px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.25),
                        inset 0 1px 0 rgba(255,255,255,0.1) !important;
          }

          /* Skill pill */
          .gm-pill {
            transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1),
                        box-shadow 0.15s ease;
          }
          .gm-pill:hover {
            transform: scale(1.08) translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          }

          /* Add button */
          .gm-add-btn {
            transition: all 0.15s ease;
          }
          .gm-add-btn:hover:not(:disabled) {
            background: rgba(255,255,255,0.12) !important;
            transform: translateY(-1px);
          }
          .gm-add-btn:disabled { opacity: 0.3; cursor: not-allowed; }

          /* New pill pop animation */
          .gm-pill-new { animation: pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

          /* Staggered card entrance */
          .gm-fade-up { animation: fade-up 0.45s ease both; }
          .gm-fade-up:nth-child(1) { animation-delay: 0.04s; }
          .gm-fade-up:nth-child(2) { animation-delay: 0.13s; }
          .gm-fade-up:nth-child(3) { animation-delay: 0.22s; }
          .gm-fade-up:nth-child(4) { animation-delay: 0.31s; }
          .gm-fade-up:nth-child(5) { animation-delay: 0.40s; }

          /* Stats banner shimmer */
          .gm-stat-shimmer {
            background: linear-gradient(
              90deg,
              rgba(255,255,255,0.0) 0%,
              rgba(255,255,255,0.06) 40%,
              rgba(255,255,255,0.0) 80%
            );
            background-size: 300% 100%;
            animation: shimmer-slide 3s ease-in-out infinite;
          }

          /* Connect button glow pulse */
          .gm-connect-glow {
            animation: glow-pulse 2.5s ease-in-out infinite;
          }

          /* Topic panel hover tint */
          .gm-topic-panel {
            transition: border-color 0.2s ease, background 0.2s ease;
          }
          .gm-topic-panel-green:hover {
            border-color: rgba(52,211,153,0.4) !important;
            background: rgba(52,211,153,0.07) !important;
          }
          .gm-topic-panel-amber:hover {
            border-color: rgba(251,191,36,0.4) !important;
            background: rgba(251,191,36,0.07) !important;
          }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
          ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.35); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.6); }
        `}</style>
      </head>
      <body>
        <div className="gm-bg" aria-hidden="true" />
        <div className="gm-grid" aria-hidden="true" />
        <div className="gm-page">
          {children}
        </div>
      </body>
    </html>
  )
}
