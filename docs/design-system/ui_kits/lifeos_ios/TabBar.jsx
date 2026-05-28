// TabBar.jsx — bottom tab bar. 5 tabs, active in peach.

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home',     label: 'Hoje',    icon: 'home' },
    { id: 'week',     label: 'Semana',  icon: 'calendar' },
    { id: 'modules',  label: 'Módulos', icon: 'layers' },
    { id: 'diary',    label: 'Diário',  icon: 'notebook' },
    { id: 'me',       label: 'Eu',      icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 26, paddingTop: 10,
      background: 'rgba(28,25,23,0.92)',
      borderTop: `1px solid ${C.line}`,
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      zIndex: 15,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: isActive ? C.peach : C.textDim,
            fontFamily: FONT_BODY, fontSize: 10,
            transition: 'color 180ms cubic-bezier(.2,.8,.2,1)',
          }}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { TabBar });
