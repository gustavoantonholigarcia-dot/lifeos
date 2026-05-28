// TaskRow.jsx — list row used in Home, Módulo, Treinos.

function TaskRow({ task, onToggle }) {
  const mod = MODULES[task.module];
  const prio = task.priority ? PRIORITY[task.priority] : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: `1px solid ${C.line}`,
    }}>
      <Check done={task.done} color={mod ? mod.color : C.sage} onClick={() => onToggle && onToggle(task)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: 15, lineHeight: '20px',
          color: task.done ? C.textDim : C.text,
          textDecoration: task.done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_MONO, fontSize: 10, color: C.textMute, letterSpacing: '0.04em' }}>
          {mod && <><ModDot color={mod.color} size={5} /><span>{mod.name}</span></>}
          {task.time && <><span style={{ opacity: 0.6 }}>·</span><span>{task.time}</span></>}
          {task.tag && <><span style={{ opacity: 0.6 }}>·</span><span>#{task.tag}</span></>}
        </div>
      </div>
      {prio && <Tag color={prio.color}>{prio.label}</Tag>}
    </div>
  );
}

function TaskList({ tasks, onToggle }) {
  return (
    <div style={{
      background: C.elev1, borderRadius: 22, overflow: 'hidden',
      margin: '0 16px',
    }}>
      {tasks.map((t, i) => (
        <div key={t.id} style={i === tasks.length - 1 ? { } : {}}>
          <TaskRow task={t} onToggle={onToggle} />
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { TaskRow, TaskList });
