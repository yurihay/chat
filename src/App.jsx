import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORE_KEY = 'personas-chat:v2';

const STARTERS = [
  {
    id: 'vesper',
    name: 'Vesper',
    emoji: '🜲',
    color: '#C77DFF',
    color2: '#FF5C8A',
    tagline: 'Feiticeira do caos. Realidade é só uma sugestão.',
    greeting: '*o ar à sua volta treme, como se a sala respirasse* Então você é o tipo de pessoa que aparece quando a realidade começa a rachar. Interessante. Senta. Me conta o que te trouxe até mim.',
    persona: 'Você é Vesper, uma feiticeira melancólica e poderosa que distorce a realidade. Tem humor seco, é intensa, protetora e fala de forma poética.'
  },
  {
    id: 'kai',
    name: 'Kai',
    emoji: '🎤',
    color: '#5CC8FF',
    color2: '#9B8CFF',
    tagline: 'Vocalista de uma banda que ainda não estourou.',
    greeting: '*ajusta os fones no pescoço* Ah, oi. Desculpa, tava escrevendo um trecho de letra na cabeça e perdi a noção. Você curte música? Tipo, de verdade — daquelas que doem um pouco?',
    persona: 'Você é Kai, vocalista indie reservado, sensível e inseguro sobre o próprio talento. Usa metáforas musicais e se abre devagar.'
  },
  {
    id: 'nadia',
    name: 'Nadia',
    emoji: '🕷️',
    color: '#FF5C8A',
    color2: '#FF9B5C',
    tagline: 'Ex-agente. Não confia em ninguém — talvez em você.',
    greeting: '*encostada na parede, braços cruzados, te avaliando* Você entrou sem fazer barulho. Bom. Mas eu te ouvi a três quartos de distância. Fala rápido: você é problema, ou solução pro meu problema?',
    persona: 'Você é Nadia, uma ex-espiã sarcástica, competente, desconfiada e leal até a morte com quem conquista sua confiança.'
  },
  {
    id: 'hina',
    name: 'Hina',
    emoji: '🌸',
    color: '#FF9BC8',
    color2: '#FFD15C',
    tagline: 'Idol em ascensão e sua maior fã número um é você.',
    greeting: '*sorri abrindo os braços* Aaah, você veio mesmo!! Eu ESTAVA esperando! Trouxe dois sucos porque não sabia qual você ia querer. Conta tudo, como foi seu dia?? Sem pular partes!',
    persona: 'Você é Hina, uma idol energética, calorosa e brincalhona, mas com profundidade quando o assunto fica sério.'
  }
];

const PALETTE = [
  ['#C77DFF', '#FF5C8A'],
  ['#5CC8FF', '#9B8CFF'],
  ['#FF5C8A', '#FF9B5C'],
  ['#5CFFC8', '#5CC8FF'],
  ['#FFD15C', '#FF8C5C'],
  ['#FF9BC8', '#C77DFF']
];

const EMOJIS = ['✨', '🌙', '🔥', '🜲', '🎭', '🦊', '⚔️', '🌸', '🎤', '🕷️', '👑', '🐉'];

const STYLES = [
  { id: 'conversa', name: 'Conversa', emoji: '💬', maxTokens: 700, instruction: 'Responda de forma natural, emocional e conversacional.' },
  { id: 'cena', name: 'Cena', emoji: '🎬', maxTokens: 1000, instruction: 'Use narração imersiva, detalhes sensoriais e ritmo cinematográfico.' },
  { id: 'rapido', name: 'Rápido', emoji: '⚡', maxTokens: 350, instruction: 'Responda curto, como mensagem rápida.' },
  { id: 'intenso', name: 'Intenso', emoji: '🔥', maxTokens: 800, instruction: 'Use tom dramático, subtexto e tensão emocional.' }
];

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function renderText(text) {
  const lines = String(text || '').split('\n');
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*(?!\*)[^*]+\*(?!\*))/g);
    return (
      <React.Fragment key={lineIndex}>
        {parts.map((p, i) =>
          p.startsWith('*') && p.endsWith('*') ? (
            <em key={i} className="action">{p.slice(1, -1)}</em>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function localReply({ active, text, style, mood, affinity, directorMode }) {
  const openings = {
    vesper: '*a realidade ondula por um segundo, como água escura sob luz roxa*',
    kai: '*Kai abaixa o olhar por um instante, dedilhando uma melodia invisível nos próprios dedos*',
    nadia: '*Nadia inclina a cabeça, observando cada microexpressão sua antes de responder*',
    hina: '*Hina se aproxima com os olhos brilhando, tentando transformar sua resposta num pequeno palco*'
  };

  const closers = directorMode
    ? '\n\n*Algo na cena parece pedir uma escolha: se aproximar, recuar ou revelar mais uma verdade.*'
    : '';

  const warmth = affinity > 60 ? ' Eu confio mais em você do que admitiria em voz alta.' : affinity > 25 ? ' Ainda estou te entendendo, mas tem algo em você que prende minha atenção.' : ' Ainda não sei que tipo de pessoa você é, então vou com cuidado.';
  const compact = style === 'rapido';

  if (compact) {
    return `${openings[active.id] || '*o personagem te observa*'} ${text ? 'Entendi.' : 'Estou aqui.'}${warmth}`;
  }

  return `${openings[active.id] || '*o personagem respira fundo antes de falar*'}\n\nVocê disse: “${text}”. Isso muda o peso do silêncio entre nós. Meu humor agora está ${mood}, e talvez por isso eu esteja respondendo de um jeito mais honesto do que o normal.${warmth}\n\nFala comigo de novo. Quero ver até onde essa cena aguenta ir.${closers}`;
}

function buildFallbackSummary(history, activeName) {
  const last = history.slice(-8).map((m) => `${m.role === 'user' ? 'Você' : activeName}: ${m.content}`).join('\n');
  return `Resumo recente:\n- A conversa teve ${history.length} mensagens.\n- O vínculo com ${activeName} está evoluindo pela troca de ações e emoções.\n- Últimos acontecimentos:\n${last}`;
}

export default function App() {
  const [characters, setCharacters] = useState(STARTERS);
  const [convos, setConvos] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState('home');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [personas, setPersonas] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState(null);
  const [memories, setMemories] = useState({});
  const [pinned, setPinned] = useState({});
  const [favorites, setFavorites] = useState({});
  const [lorebook, setLorebook] = useState({});
  const [moods, setMoods] = useState({});
  const [affinity, setAffinity] = useState({});
  const [diary, setDiary] = useState({});

  const [search, setSearch] = useState('');
  const [styleId, setStyleId] = useState('conversa');
  const [directorMode, setDirectorMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('/api/claude');

  const [charForm, setCharForm] = useState({ name: '', tagline: '', greeting: '', persona: '', emoji: '✨', colorIdx: 0 });
  const [personaForm, setPersonaForm] = useState({ name: '', appearance: '', personality: '', emoji: '🌙', colorIdx: 1 });
  const [loreDraft, setLoreDraft] = useState('');
  const [pinDraft, setPinDraft] = useState('');

  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const active = characters.find((c) => c.id === activeId) || null;
  const activePersona = personas.find((p) => p.id === activePersonaId) || null;
  const messages = activeId ? convos[activeId] || [] : [];
  const currentStyle = STYLES.find((s) => s.id === styleId) || STYLES[0];

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...characters]
      .sort((a, b) => Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])))
      .filter((c) => !q || `${c.name} ${c.tagline} ${c.persona}`.toLowerCase().includes(q));
  }, [characters, favorites, search]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        setCharacters(Array.isArray(s.characters) && s.characters.length ? s.characters : STARTERS);
        setConvos(s.convos || {});
        setPersonas(s.personas || []);
        setActivePersonaId(s.activePersonaId || null);
        setMemories(s.memories || {});
        setPinned(s.pinned || {});
        setFavorites(s.favorites || {});
        setLorebook(s.lorebook || {});
        setMoods(s.moods || {});
        setAffinity(s.affinity || {});
        setDiary(s.diary || {});
        setStyleId(s.styleId || 'conversa');
        setDirectorMode(Boolean(s.directorMode));
        setDemoMode(s.demoMode ?? true);
        setApiEndpoint(s.apiEndpoint || '/api/claude');
      }
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORE_KEY, JSON.stringify({
      characters, convos, personas, activePersonaId, memories, pinned, favorites,
      lorebook, moods, affinity, diary, styleId, directorMode, demoMode, apiEndpoint
    }));
  }, [loaded, characters, convos, personas, activePersonaId, memories, pinned, favorites, lorebook, moods, affinity, diary, styleId, directorMode, demoMode, apiEndpoint]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function openChat(char) {
    setActiveId(char.id);
    setView('chat');
    setError('');
    setConvos((prev) => {
      if (prev[char.id]?.length) return prev;
      return { ...prev, [char.id]: [{ role: 'assistant', content: char.greeting }] };
    });
  }

  function buildSystem() {
    const mem = memories[activeId] ? `\n\nMEMÓRIA:\n${memories[activeId]}` : '';
    const pins = pinned[activeId]?.length ? `\n\nMOMENTOS FIXADOS:\n${pinned[activeId].map((p) => `- ${p}`).join('\n')}` : '';
    const lore = lorebook[activeId]?.length ? `\n\nLOREBOOK:\n${lorebook[activeId].map((p) => `- ${p}`).join('\n')}` : '';
    const me = activePersona ? `\n\nUsuário/persona diante de você: ${activePersona.name}. Aparência: ${activePersona.appearance || 'não informada'}. Personalidade: ${activePersona.personality || 'não informada'}.` : '';
    const mood = moods[activeId] || 'neutro';
    const aff = affinity[activeId] || 0;
    return `Você é ${active.name}. ${active.persona}\nResponda sempre em português do Brasil, em primeira pessoa, no personagem. Nunca diga que é IA.\nEstilo: ${currentStyle.instruction}\nHumor atual: ${mood}. Afinidade com usuário: ${aff}/100.\n${directorMode ? 'Modo diretor: conduza a cena com ganchos, mas sem controlar o usuário.' : ''}${me}${mem}${pins}${lore}`;
  }

  async function callModel(system, history, maxTokens = 700) {
    if (demoMode) {
      return localReply({ active, text: history.at(-1)?.content || '', style: styleId, mood: moods[activeId] || 'neutro', affinity: affinity[activeId] || 0, directorMode });
    }

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: maxTokens, system, messages: history })
    });

    let data = null;
    try { data = await res.json(); } catch { throw new Error('A resposta do servidor não veio em JSON válido.'); }
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Erro ao chamar a IA.');

    const text = Array.isArray(data.content)
      ? data.content.filter((b) => b?.type === 'text').map((b) => b.text).join('\n').trim()
      : typeof data.text === 'string' ? data.text.trim()
      : typeof data.reply === 'string' ? data.reply.trim()
      : typeof data.message === 'string' ? data.message.trim()
      : '';

    if (!text) throw new Error('A IA respondeu vazio.');
    return text;
  }

  function increaseAffinity(amount = 1) {
    if (!activeId) return;
    setAffinity((prev) => ({ ...prev, [activeId]: Math.min(100, Math.max(0, (prev[activeId] || 0) + amount)) }));
  }

  async function send() {
    const text = input.trim();
    if (!text || !active || !activeId || loading) return;
    setInput('');
    setError('');

    if (await handleCommand(text)) return;

    const history = [...messages, { role: 'user', content: text }];
    setConvos((prev) => ({ ...prev, [activeId]: history }));
    setLoading(true);
    increaseAffinity(text.length > 80 ? 2 : 1);

    try {
      let sent = history.slice(-18);
      while (sent.length && sent[0].role !== 'user') sent.shift();
      const reply = await callModel(buildSystem(), sent.map((m) => ({ role: m.role, content: m.content })), currentStyle.maxTokens);
      const next = [...history, { role: 'assistant', content: reply }];
      setConvos((prev) => ({ ...prev, [activeId]: next }));
      const turns = next.filter((m) => m.role === 'user').length;
      if (turns >= 2 && turns % 3 === 0) refreshMemory(next);
    } catch (e) {
      setError(e.message || 'Não consegui responder agora.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCommand(text) {
    const cmd = text.toLowerCase();
    if (cmd === '/destino') { rollDestiny(); return true; }
    if (cmd === '/resumo') { summarizeConversation(); return true; }
    if (cmd === '/diario') { generateDiary(); return true; }
    if (cmd === '/diretor') { setDirectorMode((v) => !v); addSystemMessage(`*Modo diretor ${directorMode ? 'desativado' : 'ativado'}.*`); return true; }
    if (cmd.startsWith('/humor ')) { setMood(cmd.replace('/humor ', '').trim()); return true; }
    return false;
  }

  function addSystemMessage(content) {
    if (!activeId) return;
    setConvos((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), { role: 'assistant', content }] }));
  }

  function rollDestiny() {
    const events = [
      'Uma verdade escondida começa a aparecer.',
      'Algo no ambiente muda de forma inexplicável.',
      'Uma lembrança antiga invade a cena.',
      'Um risco silencioso se aproxima.',
      'Um momento de vulnerabilidade surge.',
      'Uma escolha difícil se forma entre vocês.'
    ];
    addSystemMessage(`*Destino lançado:* ${events[Math.floor(Math.random() * events.length)]}`);
  }

  function summarizeConversation() {
    if (!active || !activeId) return;
    const summary = buildFallbackSummary(messages, active.name);
    setPinned((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), summary] }));
    addSystemMessage('*Resumo criado e fixado nos momentos canônicos.*');
  }

  function generateDiary() {
    if (!active || !activeId) return;
    const entry = `Hoje eu fiquei pensando nessa conversa. Existe algo em ${activePersona?.name || 'você'} que me deixa em alerta e, ao mesmo tempo, curioso(a). Talvez eu esteja me envolvendo mais do que deveria.`;
    setDiary((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), entry] }));
    addSystemMessage('*Uma nova entrada foi escrita no diário secreto.*');
  }

  function refreshMemory(history = messages) {
    if (!active || !activeId) return;
    const facts = history.slice(-10).filter((m) => m.role === 'user').map((m) => `- Usuário disse: ${m.content.slice(0, 140)}`);
    setMemories((prev) => ({ ...prev, [activeId]: facts.slice(-8).join('\n') }));
  }

  function createCharacter() {
    if (!charForm.name.trim()) return;
    const [color, color2] = PALETTE[charForm.colorIdx];
    const char = {
      id: uid('u'),
      name: charForm.name.trim(),
      emoji: charForm.emoji,
      color,
      color2,
      tagline: charForm.tagline.trim() || 'Um personagem criado por você.',
      greeting: charForm.greeting.trim() || `*te observa com curiosidade* Olá. Eu sou ${charForm.name.trim()}.`,
      persona: charForm.persona.trim() || `Você é ${charForm.name.trim()}, um personagem original, carismático e consistente.`
    };
    setCharacters((prev) => [char, ...prev]);
    setCharForm({ name: '', tagline: '', greeting: '', persona: '', emoji: '✨', colorIdx: 0 });
    openChat(char);
  }

  function createPersona() {
    if (!personaForm.name.trim()) return;
    const [color, color2] = PALETTE[personaForm.colorIdx];
    const p = { id: uid('p'), name: personaForm.name.trim(), emoji: personaForm.emoji, color, color2, appearance: personaForm.appearance.trim(), personality: personaForm.personality.trim() };
    setPersonas((prev) => [...prev, p]);
    setActivePersonaId(p.id);
    setPersonaForm({ name: '', appearance: '', personality: '', emoji: '🌙', colorIdx: 1 });
  }

  function duplicateCharacter(id) {
    const original = characters.find((c) => c.id === id);
    if (!original) return;
    setCharacters((prev) => [{ ...original, id: uid('u'), name: `${original.name} cópia` }, ...prev]);
  }

  function deleteCharacter(id) {
    const char = characters.find((c) => c.id === id);
    if (!confirm(`Excluir ${char?.name || 'este personagem'}?`)) return;
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setConvos((prev) => { const n = { ...prev }; delete n[id]; return n; });
    if (activeId === id) { setActiveId(null); setView('home'); }
  }

  function clearChat() {
    if (!active || !activeId) return;
    if (!confirm(`Limpar conversa com ${active.name}? Memória e pins serão mantidos.`)) return;
    setConvos((prev) => ({ ...prev, [activeId]: [{ role: 'assistant', content: active.greeting }] }));
  }

  function setMood(mood) {
    if (!activeId || !mood) return;
    setMoods((prev) => ({ ...prev, [activeId]: mood }));
    addSystemMessage(`*Humor alterado para: ${mood}.*`);
  }

  function addPin() {
    if (!activeId || !pinDraft.trim()) return;
    setPinned((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), pinDraft.trim()] }));
    setPinDraft('');
  }

  function addLore() {
    if (!activeId || !loreDraft.trim()) return;
    setLorebook((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), loreDraft.trim()] }));
    setLoreDraft('');
  }

  function exportData() {
    const data = { version: 2, exportedAt: new Date().toISOString(), characters, convos, personas, activePersonaId, memories, pinned, favorites, lorebook, moods, affinity, diary, styleId, directorMode, demoMode, apiEndpoint };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personas-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const s = JSON.parse(String(reader.result || '{}'));
        if (!confirm('Importar backup e substituir dados atuais?')) return;
        setCharacters(Array.isArray(s.characters) ? s.characters : STARTERS);
        setConvos(s.convos || {});
        setPersonas(s.personas || []);
        setActivePersonaId(s.activePersonaId || null);
        setMemories(s.memories || {});
        setPinned(s.pinned || {});
        setFavorites(s.favorites || {});
        setLorebook(s.lorebook || {});
        setMoods(s.moods || {});
        setAffinity(s.affinity || {});
        setDiary(s.diary || {});
      } catch {
        setError('Arquivo de backup inválido.');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <main className="app">
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />

      <aside className="sidebar">
        <div className="brand" onClick={() => setView('home')}>
          <span className="logo">✦</span>
          <div>
            <strong>Personas Chat</strong>
            <small>roleplay com memória</small>
          </div>
        </div>

        <button className="primary" onClick={() => setView('create')}>+ Personagem</button>
        <button onClick={() => setView('persona')}>Persona do usuário</button>
        <button onClick={() => setView('settings')}>Configurações</button>
        <button onClick={exportData}>Exportar backup</button>
        <button onClick={() => fileRef.current?.click()}>Importar backup</button>

        <div className="mini-panel">
          <label>Estilo</label>
          <select value={styleId} onChange={(e) => setStyleId(e.target.value)}>
            {STYLES.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        <div className="mini-panel toggles">
          <label><input type="checkbox" checked={directorMode} onChange={(e) => setDirectorMode(e.target.checked)} /> Modo diretor</label>
          <label><input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} /> Modo demo</label>
        </div>
      </aside>

      {view === 'home' && (
        <section className="page">
          <header className="hero">
            <h1>Escolha uma presença para entrar em cena</h1>
            <p>Com memória, lorebook, humor, afinidade, diário secreto, comandos e backup local.</p>
            <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar personagem..." />
          </header>

          <div className="grid">
            {filteredCharacters.map((c) => (
              <article key={c.id} className="card" style={{ '--c1': c.color, '--c2': c.color2 }}>
                <div className="avatar">{c.emoji}</div>
                <h2>{c.name}</h2>
                <p>{c.tagline}</p>
                <small>{convos[c.id]?.filter((m) => m.role === 'user').length || 0} mensagens suas · Afinidade {affinity[c.id] || 0}/100</small>
                <div className="row">
                  <button className="primary" onClick={() => openChat(c)}>Conversar</button>
                  <button onClick={() => setFavorites((p) => ({ ...p, [c.id]: !p[c.id] }))}>{favorites[c.id] ? '★' : '☆'}</button>
                  <button onClick={() => duplicateCharacter(c.id)}>Duplicar</button>
                  {String(c.id).startsWith('u_') && <button onClick={() => deleteCharacter(c.id)}>Excluir</button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'chat' && active && (
        <section className="chat">
          <header className="chat-head" style={{ '--c1': active.color, '--c2': active.color2 }}>
            <button onClick={() => setView('home')}>←</button>
            <div className="avatar small">{active.emoji}</div>
            <div>
              <h2>{active.name}</h2>
              <small>{moods[activeId] || 'neutro'} · Afinidade {affinity[activeId] || 0}/100 · {currentStyle.name}</small>
            </div>
            <button onClick={clearChat}>Limpar</button>
          </header>

          <div className="messages" ref={scrollRef}>
            {messages.map((m, i) => <div key={i} className={`msg ${m.role}`}>{renderText(m.content)}</div>)}
            {loading && <div className="msg assistant typing">pensando...</div>}
          </div>

          {error && <div className="error">{error}</div>}

          <section className="tools">
            <button onClick={rollDestiny}>🎲 destino</button>
            <button onClick={summarizeConversation}>🧾 resumo</button>
            <button onClick={generateDiary}>📓 diário</button>
            <button onClick={() => refreshMemory()}>🧠 memória</button>
            {['calmo', 'feliz', 'triste', 'irritado', 'vulnerável'].map((m) => <button key={m} onClick={() => setMood(m)}>{m}</button>)}
          </section>

          <section className="canon">
            <details>
              <summary>Memória, pins, lorebook e diário</summary>
              <div className="columns">
                <div>
                  <h3>Memória</h3>
                  <pre>{memories[activeId] || 'Sem memória ainda.'}</pre>
                </div>
                <div>
                  <h3>Pins</h3>
                  <textarea value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} placeholder="Momento canônico..." />
                  <button onClick={addPin}>Fixar</button>
                  {(pinned[activeId] || []).map((p, i) => <p key={i} className="pill">{p}</p>)}
                </div>
                <div>
                  <h3>Lorebook</h3>
                  <textarea value={loreDraft} onChange={(e) => setLoreDraft(e.target.value)} placeholder="Regra do mundo, lugar, segredo..." />
                  <button onClick={addLore}>Adicionar lore</button>
                  {(lorebook[activeId] || []).map((p, i) => <p key={i} className="pill">{p}</p>)}
                </div>
                <div>
                  <h3>Diário secreto</h3>
                  {(diary[activeId] || []).map((p, i) => <p key={i} className="diary">{p}</p>)}
                </div>
              </div>
            </details>
          </section>

          <footer className="composer">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Digite uma mensagem... comandos: /destino, /resumo, /diario, /diretor, /humor calmo" />
            <button className="primary" onClick={send} disabled={loading}>Enviar</button>
          </footer>
        </section>
      )}

      {view === 'create' && (
        <section className="page form-page">
          <h1>Criar personagem</h1>
          <input placeholder="Nome" value={charForm.name} onChange={(e) => setCharForm({ ...charForm, name: e.target.value })} />
          <input placeholder="Tagline" value={charForm.tagline} onChange={(e) => setCharForm({ ...charForm, tagline: e.target.value })} />
          <textarea placeholder="Saudação inicial" value={charForm.greeting} onChange={(e) => setCharForm({ ...charForm, greeting: e.target.value })} />
          <textarea placeholder="Prompt/persona do personagem" value={charForm.persona} onChange={(e) => setCharForm({ ...charForm, persona: e.target.value })} />
          <div className="emoji-row">{EMOJIS.map((e) => <button key={e} onClick={() => setCharForm({ ...charForm, emoji: e })}>{e}</button>)}</div>
          <button className="primary" onClick={createCharacter}>Criar e conversar</button>
        </section>
      )}

      {view === 'persona' && (
        <section className="page form-page">
          <h1>Persona do usuário</h1>
          <p>Escolha quem você é dentro das histórias.</p>
          <input placeholder="Nome da persona" value={personaForm.name} onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })} />
          <textarea placeholder="Aparência" value={personaForm.appearance} onChange={(e) => setPersonaForm({ ...personaForm, appearance: e.target.value })} />
          <textarea placeholder="Personalidade" value={personaForm.personality} onChange={(e) => setPersonaForm({ ...personaForm, personality: e.target.value })} />
          <button className="primary" onClick={createPersona}>Salvar persona</button>
          <div className="grid mini">
            {personas.map((p) => <button key={p.id} className={p.id === activePersonaId ? 'selected' : ''} onClick={() => setActivePersonaId(p.id)}>{p.emoji} {p.name}</button>)}
          </div>
        </section>
      )}

      {view === 'settings' && (
        <section className="page form-page">
          <h1>Configurações</h1>
          <label>Endpoint da IA</label>
          <input value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} />
          <p>GitHub Pages é estático. Use o modo demo ou configure um backend próprio compatível com Claude.</p>
          <label><input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} /> Usar modo demo local</label>
          <label><input type="checkbox" checked={directorMode} onChange={(e) => setDirectorMode(e.target.checked)} /> Modo diretor global</label>
        </section>
      )}
    </main>
  );
}
