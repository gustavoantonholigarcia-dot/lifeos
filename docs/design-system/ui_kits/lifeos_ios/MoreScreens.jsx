// MoreScreens.jsx — Onboarding, Settings, UTFPR · Matérias sub-view.
// Uses atoms from Atoms.jsx and tokens from tokens.js (window globals).

// ─────────────────────────────────────────────────────────────
// ONBOARDING — 3 passos · nome / módulos / pronto
// ─────────────────────────────────────────────────────────────
function OnboardingScreen({ onFinish }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('Gustavo');
  const [picked, setPicked] = React.useState(['tawa', 'utfpr', 'treinos', 'ruah']);

  const togglePick = (id) => {
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const dots = (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: i === step ? 18 : 6, height: 6, borderRadius: 99,
          background: i === step ? C.peach : 'rgba(245,241,237,0.20)',
          transition: 'all 240ms cubic-bezier(.2,.8,.2,1)',
        }} />
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      padding: '60px 0 110px', overflowY: 'auto',
    }}>
      {/* Skip / back */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' }}>
        <button onClick={() => step > 0 && setStep(step - 1)} style={{
          background: 'none', border: 'none', padding: 4, cursor: 'pointer',
          color: step === 0 ? 'transparent' : C.textMute,
          visibility: step === 0 ? 'hidden' : 'visible',
        }}>
          <Icon name="chevronL" size={22} />
        </button>
        {dots}
        <button onClick={onFinish} style={{
          background: 'none', border: 'none', padding: 4, cursor: 'pointer',
          color: C.textDim, fontFamily: FONT_BODY, fontSize: 13,
        }}>Pular</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 28px 24px', gap: 28 }}>
        {step === 0 && (
          <>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute }}>
              01 · Apresentação
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1.1, color: C.text }}>
              Como você quer ser chamado?
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.textMute, lineHeight: 1.5 }}>
              É assim que o LifeOS vai te cumprimentar — "Boa noite, ___."
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              autoFocus
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                borderBottom: `1px solid ${C.lineStrong}`,
                padding: '10px 0', color: C.text,
                fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500,
                fontSize: 28, letterSpacing: '-0.02em',
                width: '100%', boxSizing: 'border-box',
                transition: 'border-color 180ms cubic-bezier(.2,.8,.2,1)',
              }}
              onFocus={e => e.target.style.borderBottomColor = C.peach}
              onBlur={e => e.target.style.borderBottomColor = C.lineStrong}
            />
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute }}>
              02 · Áreas da sua vida
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.15, color: C.text }}>
              O que você quer organizar aqui?
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute, lineHeight: 1.5 }}>
              Cada área vira um módulo com cor própria. Pode mudar depois.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(MODULES).map(([id, m]) => {
                const on = picked.includes(id);
                return (
                  <button key={id} onClick={() => togglePick(id)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    background: on ? `color-mix(in oklab, ${m.color} 14%, ${C.elev1})` : C.elev1,
                    border: on ? `1px solid ${m.color}` : '1px solid transparent',
                    borderRadius: 16, cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(.2,.8,.2,1)',
                  }}>
                    <ModDot color={m.color} size={10} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 14, color: C.text }}>{m.full}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textMute, letterSpacing: '0.04em' }}>{m.blurb}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: on ? `1.5px solid ${m.color}` : `1.5px solid rgba(245,241,237,0.20)`,
                      background: on ? m.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {on && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1.5 4.5L4 7L9.5 1.5" stroke="#1C1917" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute }}>
              03 · Pronto
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.08, color: C.text }}>
              Boa noite, {name}.
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.textMute, lineHeight: 1.55 }}>
              {picked.length} módulos prontos. Toca no <b style={{ color: C.peach }}>+</b> a qualquer momento pra criar a primeira tarefa — ou abre o diário pra escrever sobre o dia.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
              {picked.map(id => {
                const m = MODULES[id];
                return <Tag key={id} color={m.color}>{m.name}</Tag>;
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '0 20px' }}>
        <button onClick={() => step === 2 ? onFinish() : setStep(step + 1)} style={{
          width: '100%', padding: '16px 20px',
          background: C.text, color: C.bg,
          border: 'none', borderRadius: 16, cursor: 'pointer',
          fontFamily: FONT_BODY, fontWeight: 600, fontSize: 15,
        }}>
          {step === 0 && 'Continuar'}
          {step === 1 && `Continuar · ${picked.length} módulos`}
          {step === 2 && 'Começar'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS · com seções
// ─────────────────────────────────────────────────────────────
function SettingsScreen() {
  const SectionLabel = ({ children }) => (
    <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute, padding: '0 24px 8px' }}>
      {children}
    </div>
  );
  const Row = ({ label, value, last, onClick, accent }) => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: last ? 'none' : `1px solid ${C.line}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 15, color: accent || C.text }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textMute, fontFamily: FONT_BODY, fontSize: 14 }}>
        {value && <span>{value}</span>}
        <Icon name="chevronR" size={16} color="currentColor" />
      </div>
    </div>
  );
  const Card = ({ children }) => (
    <div style={{ margin: '0 16px', background: C.elev1, borderRadius: 22, overflow: 'hidden' }}>{children}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 140, paddingTop: 28 }}>
      <div>
        <SubMeta>perfil</SubMeta>
        <div style={{ height: 4 }} />
        <Greeting>Ajustes.</Greeting>
      </div>

      {/* User card */}
      <Card>
        <div style={{ display: 'flex', gap: 14, padding: '18px', alignItems: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999,
            background: 'linear-gradient(135deg, #E8B4A0, #D4A574)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: C.bg,
          }}>G</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: C.text, letterSpacing: '-0.02em' }}>Gustavo</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.06em', color: C.textMute }}>gustavo@tawa.com.br</div>
          </div>
          <Icon name="chevronR" size={18} color={C.textDim} />
        </div>
      </Card>

      <SectionLabel>01 · Aparência</SectionLabel>
      <Card>
        <Row label="Tema" value="Escuro · warm" />
        <Row label="Tamanho do texto" value="Padrão" />
        <Row label="Saudações editoriais" value="Ativadas" last />
      </Card>

      <SectionLabel>02 · Módulos</SectionLabel>
      <Card>
        {[
          ['tawa', '7 abertas'],
          ['utfpr', '4 abertas'],
          ['treinos', '3 esta semana'],
          ['ruah', '1 aberta'],
          ['estudos', '—'],
        ].map(([id, sub], i, a) => {
          const m = MODULES[id];
          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 18px', borderBottom: i === a.length-1 ? 'none' : `1px solid ${C.line}`,
            }}>
              <ModDot color={m.color} size={9} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.text }}>{m.full}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textMute, letterSpacing: '0.04em' }}>{sub}</div>
              </div>
              <Icon name="chevronR" size={16} color={C.textDim} />
            </div>
          );
        })}
      </Card>

      <SectionLabel>03 · Sincronização</SectionLabel>
      <Card>
        <Row label="Supabase" value="Sincronizado · 21:09" />
        <Row label="Backup automático" value="Diário" />
        <Row label="Exportar diário" last />
      </Card>

      <SectionLabel>04 · Sobre</SectionLabel>
      <Card>
        <Row label="Versão" value="0.4.1 · alpha" />
        <Row label="Atalhos" />
        <Row label="Termos" last />
      </Card>

      <Card>
        <Row label="Sair" accent={C.terracotta} last />
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UTFPR · MATÉRIAS sub-view
// ─────────────────────────────────────────────────────────────
function UtfprSubjectsScreen({ onBack }) {
  const m = MODULES.utfpr;

  const subjects = [
    { sigla: 'CAL3', nome: 'Cálculo 3',           prof: 'Profa. Helena',  status: 'em curso', media: 7.4, peso: 0.4, alerta: 'prova qui · 30 mai' },
    { sigla: 'EST',  nome: 'Estatística',         prof: 'Prof. Marcelo',  status: 'em curso', media: 8.6, peso: 0.6, alerta: null },
    { sigla: 'PCP',  nome: 'Planejamento da Prod.', prof: 'Profa. Lúcia', status: 'em curso', media: 8.0, peso: 0.5, alerta: 'relatório sex' },
    { sigla: 'ERG',  nome: 'Ergonomia',           prof: 'Prof. Almeida',  status: 'em curso', media: 9.1, peso: 0.7, alerta: null },
    { sigla: 'IPE',  nome: 'Inglês p/ Eng.',      prof: 'Prof. Davies',   status: 'em curso', media: 9.5, peso: 0.8, alerta: null },
    { sigla: 'CTI',  nome: 'Custos Industriais',  prof: 'Prof. Salles',   status: 'em curso', media: 6.8, peso: 0.3, alerta: null },
  ];

  const inAlert = subjects.filter(s => s.alerta);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 140, paddingTop: 24 }}>
      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 14px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, padding: 4, display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_BODY, fontSize: 14 }}>
          <Icon name="chevronL" size={20} /> UTFPR
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4 }}>
          <Icon name="search" size={18} />
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute, paddingBottom: 6 }}>
          02 · Semestre 2026/1
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 30, letterSpacing: '-0.02em', color: C.text, lineHeight: 1.1 }}>
          Matérias.
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute, paddingTop: 6 }}>
          {subjects.length} ativas · média geral <b style={{ color: m.color, fontWeight: 500 }}>8.2</b>
        </div>
      </div>

      {/* Alerta block */}
      {inAlert.length > 0 && (
        <div style={{ padding: '0 16px 14px' }}>
          <SectionHead n={1} label="Próximas entregas" />
          <div style={{ background: C.elev1, borderRadius: 22, overflow: 'hidden' }}>
            {inAlert.map((s, i) => (
              <div key={s.sigla} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px',
                borderBottom: i === inAlert.length-1 ? 'none' : `1px solid ${C.line}`,
              }}>
                <div style={{
                  width: 6, height: 36, borderRadius: 4,
                  background: `linear-gradient(180deg, ${C.terracotta}, ${C.honey})`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 14, color: C.text }}>{s.nome}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textMute, letterSpacing: '0.04em' }}>{s.alerta}</div>
                </div>
                <Icon name="chevronR" size={16} color={C.textDim} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All subjects grid */}
      <SectionHead n={2} label="Todas" right={
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.04em' }}>{subjects.length}</span>
      } />
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {subjects.map(s => (
          <div key={s.sigla} style={{
            position: 'relative', overflow: 'hidden',
            background: C.elev1, borderRadius: 18,
            padding: 14, minHeight: 122,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(120% 80% at 100% 0%, ${m.color} 10%, transparent 60%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', color: m.color }}>{s.sigla}</span>
              <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 13, color: C.text, lineHeight: 1.25 }}>{s.nome}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.textMute, letterSpacing: '0.04em' }}>{s.prof}</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: s.media >= 7 ? C.text : C.honey, letterSpacing: '-0.02em' }}>{s.media.toFixed(1)}</span>
              {/* progress arc */}
              <div style={{ width: 36, height: 6, borderRadius: 4, background: 'rgba(245,241,237,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${s.peso*100}%`, height: '100%', background: m.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, SettingsScreen, UtfprSubjectsScreen });
