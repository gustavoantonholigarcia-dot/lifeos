// ModuleCard.jsx — identity card for a module. Halação radial 12% from corner.

function ModuleCard({ id, openCount, doneCount, onClick, big }) {
  const m = MODULES[id];
  if (!m) return null;
  const size = big ? { padding: 18, height: 144 } : { padding: 14, height: 116 };
  return (
    <button onClick={onClick} style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 22, background: C.elev1,
      border: 'none', cursor: 'pointer', textAlign: 'left',
      color: C.text, width: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      ...size,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(120% 80% at 100% 0%, ${m.color} 14%, transparent 60%)`,
        pointerEvents: 'none',
      }} />
      {/* Logo watermark — small, top-right, behind text */}
      {m.logo && (
        <img src={m.logo} alt="" style={{
          position: 'absolute',
          right: -6, top: -4,
          width: big ? 90 : 72, height: big ? 90 : 72,
          objectFit: 'contain',
          opacity: 0.50,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ModDot color={m.color} size={10} />
        <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: big ? 22 : 18, letterSpacing: '-0.02em' }}>
          {m.full}
        </span>
      </div>
      <div style={{ position: 'relative', fontFamily: FONT_MONO, fontSize: 11, color: C.textMute, letterSpacing: '0.04em' }}>
        {openCount != null ? `${openCount} abertas` : ''}
        {doneCount != null ? ` · ${doneCount} feitas` : ''}
      </div>
    </button>
  );
}

function ModuleGrid({ items, onPick }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 10, padding: '0 16px',
    }}>
      {items.map(it => (
        <ModuleCard key={it.id} id={it.id} openCount={it.open} doneCount={it.done} onClick={() => onPick && onPick(it.id)} />
      ))}
    </div>
  );
}

Object.assign(window, { ModuleCard, ModuleGrid });
