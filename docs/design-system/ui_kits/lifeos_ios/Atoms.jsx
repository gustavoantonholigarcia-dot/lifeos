// Atoms.jsx — small reusable building blocks for LifeOS.
// Uses window.MODULES / window.PRIORITY from tokens.js.

const C = {
  bg:        '#1C1917',
  elev1:     '#292524',
  elev2:     '#3A332E',
  text:      '#F5F1ED',
  textMute:  'rgba(245,241,237,0.62)',
  textDim:   'rgba(245,241,237,0.40)',
  line:      'rgba(245,241,237,0.08)',
  lineStrong:'rgba(245,241,237,0.14)',
  peach:     '#E8B4A0',
  honey:     '#D4A574',
  sage:      '#A8B5A0',
  terracotta:'#C97064',
};

const FONT_DISPLAY = "'Spectral', Georgia, serif";
const FONT_BODY    = "'Inter', -apple-system, system-ui, sans-serif";
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace";

// ── Pill (filter chip)
function Pill({ children, on, color = C.peach, onClick, small }) {
  const bg   = on ? `color-mix(in oklab, ${color} 22%, transparent)` : C.elev1;
  const fg   = on ? color : C.textMute;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      borderRadius: 999, padding: small ? '6px 12px' : '8px 14px',
      fontFamily: FONT_BODY, fontWeight: 500, fontSize: small ? 12 : 13,
      background: bg, color: fg, border: 'none', cursor: 'pointer',
      transition: 'transform 180ms cubic-bezier(.2,.8,.2,1)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {on && <span style={{ width: 6, height: 6, borderRadius: 99, background: color }} />}
      {children}
    </button>
  );
}

// ── Tag (pastel fill, smaller)
function Tag({ children, color = C.peach, mono = true }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 10, padding: '3px 8px',
      fontFamily: mono ? FONT_MONO : FONT_BODY,
      fontSize: 10, letterSpacing: '0.02em',
      background: `color-mix(in oklab, ${color} 22%, transparent)`,
      color,
    }}>{children}</span>
  );
}

// ── Numeral (01 · 02 · 03)
function Numeral({ n }) {
  return <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textDim }}>{n.toString().padStart(2, '0')}</span>;
}

// ── Section header — "01 · ESTA SEMANA"
function SectionHead({ n, label, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        {n != null && <Numeral n={n} />}
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMute }}>{label}</span>
      </div>
      {right}
    </div>
  );
}

// ── Greeting (Spectral italic)
function Greeting({ children }) {
  return (
    <div style={{
      fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500,
      fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.02em',
      color: C.text, padding: '0 20px',
    }}>{children}</div>
  );
}

// ── Subhead (mono meta line under greeting)
function SubMeta({ children }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: C.textMute,
      padding: '6px 20px 0',
    }}>{children}</div>
  );
}

// ── Check (circle, optionally checked)
function Check({ done, color = C.sage, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      border: done ? `1.5px solid ${color}` : '1.5px solid rgba(245,241,237,0.30)',
      background: done ? color : 'transparent',
      cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 180ms cubic-bezier(.2,.8,.2,1)',
    }}>
      {done && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1.5 4.5L4 7L9.5 1.5" stroke="#1C1917" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ── FAB
function FAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 20, bottom: 92,
      width: 56, height: 56, borderRadius: 999,
      background: 'linear-gradient(135deg, #E8B4A0 0%, #D4A574 100%)',
      boxShadow: '0 8px 28px -8px rgba(232,180,160,0.55), 0 2px 6px rgba(0,0,0,0.35)',
      border: 'none', cursor: 'pointer', zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
  );
}

// ── Module dot
function ModDot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

// ── Icon (Lucide-style stroke · default 2)
function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 2 }) {
  const paths = {
    plus:     <path d="M12 5v14M5 12h14"/>,
    home:     <><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    notebook: <><path d="M4 19V5a2 2 0 0 1 2-2h11l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 11h8M8 15h6"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></>,
    chevronR: <path d="M9 18l6-6-6-6"/>,
    chevronL: <path d="M15 18l-6-6 6-6"/>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    more:     <><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
    flag:     <><path d="M4 21V4h12l-2 4 2 4H4"/></>,
    close:    <path d="M6 6l12 12M18 6L6 18"/>,
    layers:   <><path d="M12 2l10 6-10 6L2 8z"/><path d="M2 14l10 6 10-6"/></>,
    sun:      <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name] || <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}

// ── IconChip — colored chip with icon, the standard icon container
function IconChip({ name, color = C.peach, size = 38, iconSize = 20 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 10,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: `color-mix(in oklab, ${color} 22%, transparent)`,
      flexShrink: 0,
    }}>
      <Icon name={name} size={iconSize} color={color} strokeWidth={2} />
    </span>
  );
}

Object.assign(window, {
  Pill, Tag, Numeral, SectionHead, Greeting, SubMeta, Check, FAB, ModDot, Icon, IconChip,
  C, FONT_DISPLAY, FONT_BODY, FONT_MONO,
});
