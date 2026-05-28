// Screens.jsx — the LifeOS screens. Home / Modulo / Treinos / Diario / Me.
// Plus the NovaTarefa sheet.

// ─────────────────────────────────────────────────────────────
// HOME · "Hoje"
// ─────────────────────────────────────────────────────────────
function HomeScreen({ tasks, onToggle, onModule, filter, setFilter }) {
  const filters = ['todos', 'tawa', 'utfpr', 'treinos', 'ruah'];
  const filtered = filter === 'todos' ? tasks : tasks.filter(t => t.module === filter);
  const open = filtered.filter(t => !t.done);
  const done = filtered.filter(t => t.done);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 140, paddingTop: 28 }}>
      <div>
        <SubMeta>qui · 28 mai · 21:14</SubMeta>
        <div style={{ height: 4 }} />
        <Greeting>Boa noite, Gustavo.</Greeting>
        <div style={{ padding: '8px 20px 0', fontFamily: FONT_BODY, fontSize: 14, color: C.textMute, lineHeight: '20px' }}>
          3 tarefas pra amanhã. Treino de jiu-jitsu às 19h.
        </div>
      </div>

      {/* Reflexão da noite — Stoic-inspired bookend card, warm not gamified */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: C.elev1, borderRadius: 28, padding: '22px 22px 18px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(140% 90% at 10% 100%, rgba(232,180,160,0.10) 0%, transparent 55%), radial-gradient(120% 80% at 100% 0%, rgba(184,159,217,0.08) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMute, whiteSpace: 'nowrap' }}>
              Reflexão · noite
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              4 / 7 dias
            </span>
          </div>
          <div style={{ position: 'relative', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 24, lineHeight: 1.25, letterSpacing: '-0.02em', color: C.text }}>
            "Cada dia é uma vida em miniatura."
          </div>
          <div style={{ position: 'relative', fontFamily: FONT_BODY, fontSize: 13, color: C.textMute, lineHeight: 1.5 }}>
            O que ficou de hoje?
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 8, marginTop: 4 }}>
            <button style={{
              flex: 1, padding: '12px 16px', borderRadius: 16,
              background: C.text, color: C.bg, border: 'none', cursor: 'pointer',
              fontFamily: FONT_BODY, fontWeight: 500, fontSize: 14,
            }}>Escrever</button>
            <button style={{
              padding: '12px 16px', borderRadius: 16,
              background: 'transparent', color: C.textMute, border: 'none', cursor: 'pointer',
              fontFamily: FONT_BODY, fontSize: 14,
            }}>Mais tarde</button>
          </div>
        </div>
      </div>

      {/* filter pills */}
      <div style={{ overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: 8, padding: '0 20px', width: 'max-content' }}>
          {filters.map(f => {
            const m = MODULES[f];
            return (
              <Pill key={f} on={filter === f} color={m ? m.color : C.peach} onClick={() => setFilter(f)}>
                {f === 'todos' ? 'Todos' : m.name}
              </Pill>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHead n={1} label="Hoje" right={
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.04em' }}>{open.length}</span>
        } />
        <TaskList tasks={open} onToggle={onToggle} />
      </div>

      {done.length > 0 && (
        <div>
          <SectionHead n={2} label="Feitas" />
          <TaskList tasks={done} onToggle={onToggle} />
        </div>
      )}

      <div style={{ padding: '0 20px' }}>
        <SectionHead n={3} label="Módulos ativos" />
        <ModuleGrid items={[
          { id: 'tawa', open: 7, done: 3 },
          { id: 'utfpr', open: 4, done: 2 },
          { id: 'treinos', open: 3, done: 12 },
          { id: 'ruah', open: 1, done: 1 },
        ]} onPick={onModule} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MÓDULO · detail view (TAWA / UTFPR / etc.)
// ─────────────────────────────────────────────────────────────
function ModuleScreen({ moduleId, tasks, onToggle, onBack, onSubView }) {
  const m = MODULES[moduleId];
  const mTasks = tasks.filter(t => t.module === moduleId);
  const open = mTasks.filter(t => !t.done);
  const done = mTasks.filter(t => t.done);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 140, paddingTop: 24 }}>
      {/* Back / menu nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 14px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, padding: 4, display: 'flex', alignItems: 'center' }}>
          <Icon name="chevronL" size={22} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4 }}>
          <Icon name="more" size={20} />
        </button>
      </div>

      {/* Identity card — halação */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 28, background: C.elev1,
          padding: 22, minHeight: 132,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(110% 80% at 100% 0%, ${m.color} 22%, transparent 65%)`,
            pointerEvents: 'none',
          }} />
          {/* Big logo watermark */}
          {m.logoBig && (
            <img src={m.logoBig} alt="" style={{
              position: 'absolute',
              right: -28, top: -22,
              width: 220, height: 220,
              objectFit: 'contain',
              opacity: 0.38,
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ModDot color={m.color} size={12} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute }}>
                Módulo
              </span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: C.text }}>
              {m.full}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute }}>
              {m.blurb}
            </div>
            <div style={{ display: 'flex', gap: 14, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.04em', color: C.textMute, marginTop: 4 }}>
              <span><span style={{ color: m.color, fontWeight: 500 }}>{open.length}</span> abertas</span>
              <span><span style={{ color: C.text }}>{done.length}</span> feitas</span>
              <span><span style={{ color: C.text }}>3</span> esta semana</span>
            </div>
          </div>
        </div>
      </div>

      {open.length > 0 ? <>
        <SectionHead n={1} label="Abertas" />
        <TaskList tasks={open} onToggle={onToggle} />
      </> : (
        <EmptyBlock title="Tudo limpo." sub="Nenhuma tarefa pendente em " accent={m.color} accentLabel={m.full} />
      )}

      {/* UTFPR-specific sub-view link */}
      {moduleId === 'utfpr' && (
        <div style={{ padding: '18px 16px 0' }}>
          <button onClick={() => onSubView && onSubView('utfpr-subjects')} style={{
            width: '100%', background: C.elev1, border: 'none',
            borderRadius: 22, padding: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
            color: C.text,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(60% 100% at 0% 50%, ${m.color} 12%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.color }}>sub-view</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, letterSpacing: '-0.02em', color: C.text }}>Matérias</span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute }}>6 ativas · média 8.2 · semestre 2026/1</span>
            </div>
            <div style={{ position: 'relative', marginLeft: 'auto' }}>
              <Icon name="chevronR" size={20} color={C.textMute} />
            </div>
          </button>
        </div>
      )}

      {done.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <SectionHead n={2} label="Feitas" />
          <TaskList tasks={done} onToggle={onToggle} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY BLOCK
// ─────────────────────────────────────────────────────────────
function EmptyBlock({ title, sub, accent, accentLabel }) {
  return (
    <div style={{
      margin: '0 16px', padding: 24, minHeight: 140,
      background: C.elev1, borderRadius: 22,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, letterSpacing: '-0.02em', color: C.text }}>{title}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute }}>
        {sub}
        {accentLabel && <span style={{ color: accent }}>{accentLabel}</span>}
        {accent ? '. Toca no + pra criar.' : ''}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TREINOS
// ─────────────────────────────────────────────────────────────
function TreinosScreen() {
  const week = [
    { dia: 'seg', label: 'Academia', tag: 'push',     hora: '07:00', done: true },
    { dia: 'ter', label: 'Jiu-Jitsu', tag: 'guarda',  hora: '19:00', done: true },
    { dia: 'qua', label: 'Tênis',     tag: 'saque',   hora: '17:30', done: false },
    { dia: 'qui', label: 'Judô',      tag: 'newaza',  hora: '20:00', done: false },
    { dia: 'sex', label: 'Academia',  tag: 'pull',    hora: '07:00', done: false },
    { dia: 'sáb', label: 'Tênis',     tag: 'jogo',    hora: '09:00', done: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 140, paddingTop: 28 }}>
      <div>
        <SubMeta>03 · ESTA SEMANA</SubMeta>
        <div style={{ height: 4 }} />
        <Greeting>3 treinos esta semana.</Greeting>
        <div style={{ padding: '8px 20px 0', fontFamily: FONT_BODY, fontSize: 14, color: C.textMute }}>
          Judô amanhã, tênis no sábado. Descanso domingo.
        </div>
      </div>

      {/* Streak card — warm, calm. No flames. */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: C.elev1, borderRadius: 22, padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(120% 90% at 0% 100%, ${MODULES.treinos.color} 12%, transparent 55%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 38, lineHeight: 0.95, letterSpacing: '-0.03em', color: C.text }}>5</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.textMute, lineHeight: 1.3 }}>dias seguidos.<br/>Continua.</span>
          </div>
          {/* Week dots */}
          <div style={{ position: 'relative', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
            {[
              { d: 'seg', done: true,  today: false },
              { d: 'ter', done: true,  today: false },
              { d: 'qua', done: true,  today: false },
              { d: 'qui', done: true,  today: false },
              { d: 'sex', done: true,  today: true  },
              { d: 'sáb', done: false, today: false },
              { d: 'dom', done: false, today: false, rest: true },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: d.done ? MODULES.treinos.color : (d.rest ? 'transparent' : 'rgba(245,241,237,0.06)'),
                  border: d.today ? `1.5px solid ${C.peach}` : (d.rest ? '1px dashed rgba(245,241,237,0.20)' : '1px solid transparent'),
                }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: d.today ? C.peach : C.textMute }}>{d.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ background: C.elev1, borderRadius: 22, overflow: 'hidden' }}>
          {week.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              borderBottom: i === week.length - 1 ? 'none' : `1px solid ${C.line}`,
              opacity: d.done ? 0.55 : 1,
            }}>
              <div style={{
                width: 36, textAlign: 'center',
                fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: d.done ? C.textDim : C.textMute,
              }}>{d.dia}</div>
              <ModDot color={MODULES.treinos.color} size={6} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 15, color: C.text, textDecoration: d.done ? 'line-through' : 'none' }}>
                  {d.label}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textMute, letterSpacing: '0.04em' }}>
                  #{d.tag}
                </div>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: d.done ? C.textDim : C.text }}>{d.hora}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <SectionHead n={2} label="Modalidades" />
        <div style={{ display: 'flex', gap: 8, padding: '0 4px', flexWrap: 'wrap' }}>
          {['Judô', 'Jiu-Jitsu', 'Tênis', 'Academia'].map(s => (
            <Pill key={s} on color={MODULES.treinos.color} small>{s}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DIÁRIO
// ─────────────────────────────────────────────────────────────
function DiarioScreen() {
  // Day One-inspired editorial layout: oversized date numerals, journal entries flow.
  const entries = [
    {
      key: 'hoje', day: 28, dow: 'qui', month: 'maio', when: 'hoje · noite',
      title: 'Reunião com o cliente do bombeiro.',
      body: 'Fechamos os ajustes do compartimento traseiro. Próximo passo: orçamento de pintura e cromados. Levei o caderno e tomei nota — a UTFPR não está atrapalhando, ainda.',
      tags: [['#tawa', MODULES.tawa.color], ['#cliente', C.honey], ['#utfpr', MODULES.utfpr.color]],
      featured: true,
    },
    {
      key: 'ontem', day: 27, dow: 'qua', month: 'maio', when: 'ontem',
      title: 'Primeira aula de espanhol B1.',
      body: 'Subjuntivo presente. Custou. Vou refazer os exercícios no fim de semana.',
      tags: [['#estudos', MODULES.estudos.color], ['#espanhol', C.peach]],
    },
    {
      key: 'dom', day: 25, dow: 'dom', month: 'maio', when: 'domingo',
      title: 'João 3 · "nascer de novo".',
      body: 'Conversei com o Mateus depois do culto. Anotei a referência pra revisar.',
      tags: [['#ruah', MODULES.ruah.color]],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 140, paddingTop: 24 }}>
      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute }}>
            Maio · 2026
          </span>
          <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', color: C.text, lineHeight: 1.1 }}>
            Diário.
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, padding: 4 }}>
          <Icon name="layers" size={20} />
        </button>
      </div>

      {/* Featured entry — oversized */}
      {entries.filter(e => e.featured).map(e => (
        <div key={e.key} style={{ padding: '0 16px 22px' }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: C.elev1, borderRadius: 28, padding: '24px 22px 22px',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(120% 90% at 0% 0%, rgba(232,180,160,0.10) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 16 }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500,
                fontSize: 88, lineHeight: 0.85, letterSpacing: '-0.04em',
                color: C.text,
              }}>{e.day}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMute }}>{e.dow} · {e.month}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.04em' }}>{e.when}</span>
              </div>
            </div>
            <div style={{ position: 'relative', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 22, letterSpacing: '-0.02em', color: C.text, lineHeight: 1.3, marginBottom: 10 }}>
              {e.title}
            </div>
            <div style={{ position: 'relative', fontFamily: FONT_BODY, fontSize: 14, color: C.textMute, lineHeight: 1.6, marginBottom: 14 }}>
              {e.body}
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {e.tags.map(([t, c]) => <Tag key={t} color={c}>{t}</Tag>)}
            </div>
          </div>
        </div>
      ))}

      {/* Older entries — masthead layout: big day number + body */}
      <div style={{ padding: '0 20px 12px' }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textDim }}>
          Anteriores
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {entries.filter(e => !e.featured).map((e, i, a) => (
          <div key={e.key} style={{
            display: 'flex', gap: 18, padding: '18px 20px',
            borderTop: `1px solid ${C.line}`,
            borderBottom: i === a.length-1 ? `1px solid ${C.line}` : 'none',
            alignItems: 'flex-start',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 48, flexShrink: 0 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 38, lineHeight: 0.9, letterSpacing: '-0.03em', color: C.text }}>{e.day}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMute }}>{e.dow}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500, fontSize: 17, letterSpacing: '-0.02em', color: C.text, lineHeight: 1.25 }}>
                {e.title}
              </span>
              <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.textMute, lineHeight: 1.55 }}>
                {e.body}
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {e.tags.map(([t, c]) => <Tag key={t} color={c}>{t}</Tag>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NOVA TAREFA — modal sheet
// ─────────────────────────────────────────────────────────────
function NovaTarefaSheet({ open, onClose, defaultModule, onCreate }) {
  const [title, setTitle] = React.useState('');
  const [mod,   setMod  ] = React.useState(defaultModule || 'tawa');
  const [prio,  setPrio ] = React.useState('media');

  React.useEffect(() => {
    if (open) { setTitle(''); setMod(defaultModule || 'tawa'); setPrio('media'); }
  }, [open, defaultModule]);

  if (!open) return null;
  const m = MODULES[mod];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(28,25,23,0.72)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.elev1,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 0 32px',
        display: 'flex', flexDirection: 'column', gap: 18,
        boxShadow: '0 -12px 40px -16px rgba(0,0,0,0.55)',
      }}>
        {/* grabber */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(245,241,237,0.22)', margin: '0 auto' }} />

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMute, fontFamily: FONT_BODY, fontSize: 15 }}>Cancelar</button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMute, whiteSpace: 'nowrap' }}>Nova tarefa</span>
          <button
            onClick={() => { if (title.trim()) { onCreate({ title, module: mod, priority: prio }); onClose(); } }}
            style={{
              background: title.trim() ? m.color : 'transparent',
              border: 'none', cursor: title.trim() ? 'pointer' : 'default',
              color: title.trim() ? C.bg : C.textDim,
              fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14,
              padding: '6px 14px', borderRadius: 999,
            }}>
            Salvar
          </button>
        </div>

        {/* title input */}
        <div style={{ padding: '0 20px' }}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'transparent', border: 'none', outline: 'none',
              color: C.text,
              fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontWeight: 500,
              fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.2,
            }}
          />
        </div>

        {/* module picker */}
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMute, padding: '0 20px 8px' }}>
            Módulo
          </div>
          <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ display: 'flex', gap: 8, padding: '0 20px', width: 'max-content' }}>
              {Object.keys(MODULES).map(k => (
                <Pill key={k} on={mod === k} color={MODULES[k].color} onClick={() => setMod(k)}>
                  {MODULES[k].name}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/* priority */}
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMute, padding: '0 20px 8px' }}>
            Prioridade
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '0 20px' }}>
            {Object.keys(PRIORITY).map(k => (
              <Pill key={k} on={prio === k} color={PRIORITY[k].color} onClick={() => setPrio(k)}>
                {PRIORITY[k].label}
              </Pill>
            ))}
          </div>
        </div>

        {/* hint */}
        <div style={{ padding: '0 20px', fontFamily: FONT_MONO, fontSize: 10, color: C.textDim, letterSpacing: '0.04em' }}>
          enter pra salvar · esc pra cancelar
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ModuleScreen, TreinosScreen, DiarioScreen, NovaTarefaSheet, EmptyBlock });
