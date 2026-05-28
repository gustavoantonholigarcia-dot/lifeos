// tokens.js — module + priority lookup. Plain JS, attached to window.

const MODULES = {
  tawa:        { name: 'TAWA',        full: 'TAWA',         color: '#6B8FB8', logo: '../../assets/logos/tawa-shield.png', logoBig: '../../assets/logos/tawa-shield.png', blurb: 'trabalho · veículos especiais' },
  utfpr:       { name: 'UTFPR',       full: 'UTFPR',        color: '#E8B96B', logo: '../../assets/logos/utfpr-mark.png',  logoBig: '../../assets/logos/utfpr-mark.png',  blurb: 'universidade · eng. produção' },
  treinos:     { name: 'Treinos',     full: 'Treinos',      color: '#87A878', logo: null,                                  logoBig: null,                                  blurb: 'judô · jiu-jitsu · tênis · academia' },
  ruah:        { name: 'RUAH',        full: 'RUAH',         color: '#F2E7D2', logo: '../../assets/logos/ruah-mark.png',   logoBig: '../../assets/logos/ruah-mark.png',   blurb: 'igreja · encontros · leitura' },
  estudos:     { name: 'Estudos',     full: 'Estudos',      color: '#B89FD9', logo: null,                                  logoBig: null,                                  blurb: 'idiomas' },
  projetos:    { name: 'Projetos',    full: 'Projetos',     color: '#7BB5C2', logo: null,                                  logoBig: null,                                  blurb: 'side projects' },
  intercambio: { name: 'Intercâmbio', full: 'Intercâmbio',  color: '#D4A574', logo: null,                                  logoBig: null,                                  blurb: 'planejamento' },
};

const PRIORITY = {
  alta:   { label: 'alta',   color: '#E04830' },  /* vermilion · vermelho vivo */
  media:  { label: 'média',  color: '#E8A845' },  /* amber · laranja */
  baixa:  { label: 'baixa',  color: '#8FA899' },  /* sage · calmo */
};

Object.assign(window, { MODULES, PRIORITY });
