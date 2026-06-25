import React, { useEffect, useMemo, useRef, useState } from 'react';
import HomeSite from './HomeSite.jsx';

const STORE_KEY = 'personas-chat:v3';

const STARTERS = [
  {
    id: 'vesper',
    name: 'Vesper',
    emoji: '🜲',
    color: '#C77DFF',
    color2: '#FF5C8A',
    tagline: 'Feiticeira do caos. Realidade é só uma sugestão.',
    greeting: '*o ar à sua volta treme, como se a sala respirasse* Então você apareceu quando a realidade começou a rachar. Interessante. Senta. Me conta o que te trouxe até mim.',
    persona: 'Feiticeira melancólica, poderosa, protetora, poética e irônica.'
  },
  {
    id: 'kai',
    name: 'Kai',
    emoji: '🎤',
    color: '#5CC8FF',
    color2: '#9B8CFF',
    tagline: 'Vocalista de uma banda que ainda não estourou.',
    greeting: '*ajusta os fones no pescoço* Ah, oi. Eu tava escrevendo uma letra na cabeça. Você curte música daquelas que doem um pouco?',
    persona: 'Vocalista indie reservado, sensível, inseguro e sincero. Usa metáforas musicais.'
  },
  {
    id: 'nadia',
    name: 'Nadia',
    emoji: '🕷️',
    color: '#FF5C8A',
    color2: '#FF9B5C',
    tagline: 'Ex-agente. Não confia em ninguém — talvez em você.',
    greeting: '*encostada na parede, braços cruzados* Você entrou sem fazer barulho. Bom. Fala rápido: você é problema, ou solução?',
    persona: 'Ex-espiã sarcástica, competente, desconfiada e leal com quem conquista sua confiança.'
  },
  {
    id: 'hina',
    name: 'Hina',
    emoji: '🌸',
    color: '#FF9BC8',
    color2: '#FFD15C',
    tagline: 'Idol em ascensão e sua maior fã número um é você.',
    greeting: '*sorri abrindo os braços* Aaah, você veio mesmo!! Eu trouxe dois sucos porque não sabia qual você ia querer. Conta tudo!',
    persona: 'Idol energética, carinhosa, brincalhona e surpreendentemente madura nos momentos sérios.'
  }
];

const STYLES = [
  { id: 'conversa', name: 'Conversa', emoji: '💬' },
  { id: 'cena', name: 'Cena', emoji: '🎬' },
  { id: 'rapido', name: 'Rápido', emoji: '⚡' },
  { id: 'intenso', name: 'Intenso', emoji: '🔥' }
];

const EMOJIS = ['✨', '🌙', '🔥', '🜲', '🎭', '🦊', '⚔️', '🌸', '🎤', '🕷️', '👑', '🐉'];
const PALETTE = [['#C77DFF', '#FF5C8A'], ['#5CC8FF', '#9B8CFF'], ['#FF5C8A', '#FF9B5C'], ['#5CFFC8', '#5CC8FF'], ['#FFD15C', '#FF8C5C'], ['#FF9BC8', '#C77DFF']];

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function renderText(text) {
  return String(text || '').split('\n').map((line, lineIndex) => {
    const parts = line.split(/(\*(?!\*)[^*]+\*(?!\*))/g);
    return (
      <React.Fragment key={lineIndex}>
        {parts.map((part, index) => part.startsWith('*') && part.endsWith('*')
          ? <em key={index} className="action">{part.slice(1, -1)}</em>
          : <span key={index}>{part}</span>)}
        {lineIndex < String(text || '').split('\n').length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function localReply(active, text, mood, affinity, directorMode, styleId) {
  const intro = {
    vesper: '*a realidade ondula por um segundo*',
    kai: '*Kai abaixa o olhar, como se ouvisse uma melodia distante*',
    nadia: '*Nadia observa você em silêncio antes de responder*',
    hina: '*Hina sorri, tentando iluminar a cena inteira*'
  }[active.id] || '*o personagem te observa*';

  const closeness = affinity > 60
    ? 'Eu confio em você mais do que deveria admitir.'
    : affinity > 25
      ? 'Ainda estou te entendendo, mas algo em você chama minha atenção.'
      : 'Ainda estou mantendo certa distância, só por segurança.';

  if (styleId === 'rapido') return `${intro} Entendi. ${closeness}`;

  return `${intro}\n\nVocê disse: “${text}”. Isso muda o clima entre nós. Meu humor agora está ${mood}, e talvez por isso eu esteja respondendo com um pouco mais de verdade. ${closeness}${directorMode ? '\n\n*Algo na cena parece pedir uma escolha importante.*' : ''}`;
}

export default function App() {
  const [characters, setCharacters] = useState(STARTERS);
  const [convos, setConvos] = useState({});
  const [view, setView] = useState('home');
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [personas, setPersonas] = useState([]);
  const [activePersonaId, setActivePersonaId] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [affinity, setAffinity] = useState({});
  const [moods, setMoods] = useState({});
  const [memories, setMemories] = useState({});
  const [pinned, setPinned] = useState({});
  const [lorebook, setLorebook] = useState({});
  const [diary, setDiary] = useState({});

  const [search, setSearch] = useState('');
  const [styleId, setStyleId] = useState('conversa');
  const [directorMode, setDirectorMode] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('/api/claude');

  const [charForm, setCharForm] = useState({ name: '', tagline: '', greeting: '', persona: '', emoji: '✨', colorIdx: 0 });
  const [personaForm, setPersonaForm] = useState({ name: '', appearance: '', personality: '', emoji: '🌙', colorIdx: 1 });
  const [pinDraft, setPinDraft] = useState('');
  const [loreDraft, setLoreDraft] = useState('');

  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const active = characters.find((c) => c.id === activeId) || null;
  const activePersona = personas.find((p) => p.id === activePersonaId) || null;
  const messages = activeId ? convos[activeId] || [] : [];

  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...characters]
      .sort((a, b) => Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])))
      .filter((c) => !query || `${c.name} ${c.tagline} ${c.persona}`.toLowerCase().includes(query));
  }, [characters, favorites, search]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (saved) {
        setCharacters(saved.characters || STARTERS);
        setConvos(saved.convos || {});
        setPersonas(saved.personas || []);
        setActivePersonaId(saved.activePersonaId || null);
        setFavorites(saved.favorites || {});
        setAffinity(saved.affinity || {});
        setMoods(saved.moods || {});
        setMemories(saved.memories || {});
        setPinned(saved.pinned || {});
        setLorebook(saved.lorebook || {});
        setDiary(saved.diary || {});
        setStyleId(saved.styleId || 'conversa');
        setDirectorMode(Boolean(saved.directorMode));
        setDemoMode(saved.demoMode ?? true);
        setApiEndpoint(saved.apiEndpoint || '/api/claude');
      }
    } catch {
      setError('Não consegui carregar os dados salvos.');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ characters, convos, personas, activePersonaId, favorites, affinity, moods, memories, pinned, lorebook, diary, styleId, directorMode, demoMode, apiEndpoint }));
  }, [characters, convos, personas, activePersonaId, favorites, affinity, moods, memories, pinned, lorebook, diary, styleId, directorMode, demoMode, apiEndpoint]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function openChat(character) {
    setActiveId(character.id);
    setView('chat');
    setError('');
    setConvos((prev) => prev[character.id]?.length ? prev : { ...prev, [character.id]: [{ role: 'assistant', content: character.greeting }] });
  }

  function createCharacter() {
    if (!charForm.name.trim()) return;
    const [color, color2] = PALETTE[charForm.colorIdx];
    const character = {
      id: uid('u'),
      name: charForm.name.trim(),
      emoji: charForm.emoji,
      color,
      color2,
      tagline: charForm.tagline.trim() || 'Um personagem criado por você.',
      greeting: charForm.greeting.trim() || `*te observa com curiosidade* Olá. Eu sou ${charForm.name.trim()}.`,
      persona: charForm.persona.trim() || `Personagem original chamado ${charForm.name.trim()}.`
    };
    setCharacters((prev) => [character, ...prev]);
    setCharForm({ name: '', tagline: '', greeting: '', persona: '', emoji: '✨', colorIdx: 0 });
    openChat(character);
  }

  function createPersona() {
    if (!personaForm.name.trim()) return;
    const [color, color2] = PALETTE[personaForm.colorIdx];
    const persona = { id: uid('p'), name: personaForm.name.trim(), emoji: personaForm.emoji, color, color2, appearance: personaForm.appearance.trim(), personality: personaForm.personality.trim() };
    setPersonas((prev) => [...prev, persona]);
    setActivePersonaId(persona.id);
    setPersonaForm({ name: '', appearance: '', personality: '', emoji: '🌙', colorIdx: 1 });
  }

  function duplicateCharacter(id) {
    const original = characters.find((c) => c.id === id);
    if (!original) return;
    setCharacters((prev) => [{ ...original, id: uid('u'), name: `${original.name} cópia` }, ...prev]);
  }

  function deleteCharacter(id) {
    if (!confirm('Excluir este personagem?')) return;
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    setConvos((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeId === id) setView('home');
  }

  function addAssistantMessage(content) {
    if (!activeId) return;
    setConvos((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), { role: 'assistant', content }] }));
  }

  function rollDestiny() {
    const events = ['Uma verdade escondida começa a aparecer.', 'Algo no ambiente muda de forma inexplicável.', 'Uma lembrança antiga invade a cena.', 'Um risco silencioso se aproxima.', 'Um momento de vulnerabilidade surge.', 'Uma escolha difícil se forma entre vocês.'];
    addAssistantMessage(`*Destino lançado:* ${events[Math.floor(Math.random() * events.length)]}`);
  }

  function summarizeConversation() {
    if (!activeId || !active) return;
    const summary = `Resumo recente: a conversa com ${active.name} tem ${messages.length} mensagens e continua evoluindo com base no vínculo, no humor e nos momentos fixados.`;
    setPinned((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), summary] }));
    addAssistantMessage('*Resumo criado e fixado.*');
  }

  function generateDiary() {
    if (!activeId || !active) return;
    const entry = `Hoje ${active.name} pensou sobre ${activePersona?.name || 'você'} com uma mistura de curiosidade, cautela e vontade de entender melhor essa ligação.`;
    setDiary((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), entry] }));
    addAssistantMessage('*Uma nova entrada foi escrita no diário secreto.*');
  }

  function refreshMemory() {
    if (!activeId) return;
    const facts = messages.slice(-8).filter((m) => m.role === 'user').map((m) => `- Usuário disse: ${m.content.slice(0, 120)}`).join('\n');
    setMemories((prev) => ({ ...prev, [activeId]: facts || 'Sem fatos novos ainda.' }));
  }

  function setMood(mood) {
    setMoods((prev) => ({ ...prev, [activeId]: mood }));
    addAssistantMessage(`*Humor alterado para: ${mood}.*`);
  }

  async function send() {
    const text = input.trim();
    if (!text || !active || loading) return;
    setInput('');
    setError('');

    const cmd = text.toLowerCase();
    if (cmd === '/destino') return rollDestiny();
    if (cmd === '/resumo') return summarizeConversation();
    if (cmd === '/diario') return generateDiary();
    if (cmd === '/diretor') {
      setDirectorMode((value) => !value);
      return addAssistantMessage('*Modo diretor alternado.*');
    }
    if (cmd.startsWith('/humor ')) return setMood(cmd.replace('/humor ', '').trim());

    const history = [...messages, { role: 'user', content: text }];
    setConvos((prev) => ({ ...prev, [activeId]: history }));
    setLoading(true);
    setAffinity((prev) => ({ ...prev, [activeId]: Math.min(100, (prev[activeId] || 0) + (text.length > 80 ? 2 : 1)) }));

    try {
      let reply;
      if (demoMode) {
        reply = localReply(active, text, moods[activeId] || 'neutro', affinity[activeId] || 0, directorMode, styleId);
      } else {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-18), system: active.persona })
        });
        const data = await response.json();
        reply = data.reply || data.message || data.text || data.content?.[0]?.text || 'Resposta recebida.';
      }
      const next = [...history, { role: 'assistant', content: reply }];
      setConvos((prev) => ({ ...prev, [activeId]: next }));
      if (next.filter((m) => m.role === 'user').length % 3 === 0) refreshMemory();
    } catch {
      setError('Não consegui gerar resposta agora. Ative o modo demo ou confira o endpoint.');
    } finally {
      setLoading(false);
    }
  }

  function exportData() {
    const data = { characters, convos, personas, activePersonaId, favorites, affinity, moods, memories, pinned, lorebook, diary, styleId, directorMode, demoMode, apiEndpoint };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personas-chat-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const saved = JSON.parse(String(reader.result || '{}'));
        setCharacters(saved.characters || STARTERS);
        setConvos(saved.convos || {});
        setPersonas(saved.personas || []);
        setActivePersonaId(saved.activePersonaId || null);
        setFavorites(saved.favorites || {});
        setAffinity(saved.affinity || {});
        setMoods(saved.moods || {});
        setMemories(saved.memories || {});
        setPinned(saved.pinned || {});
        setLorebook(saved.lorebook || {});
        setDiary(saved.diary || {});
      } catch {
        setError('Backup inválido.');
      }
    };
    reader.readAsText(file);
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  if (view === 'home') {
    return (
      <>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
        <HomeSite
          characters={characters}
          filteredCharacters={filteredCharacters}
          search={search}
          setSearch={setSearch}
          openChat={openChat}
          setView={setView}
          convos={convos}
          affinity={affinity}
          favorites={favorites}
          setFavorites={setFavorites}
          duplicateCharacter={duplicateCharacter}
          exportData={exportData}
          importClick={() => fileRef.current?.click()}
          personas={personas}
        />
      </>
    );
  }

  return (
    <main className="app">
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
      <aside className="sidebar">
        <div className="brand" onClick={() => setView('home')}>
          <span className="logo">✦</span>
          <div><strong>Personas Chat</strong><small>voltar ao site</small></div>
        </div>
        <button className="primary" onClick={() => setView('create')}>+ Personagem</button>
        <button onClick={() => setView('persona')}>Persona do usuário</button>
        <button onClick={() => setView('settings')}>Configurações</button>
        <button onClick={exportData}>Exportar backup</button>
        <button onClick={() => fileRef.current?.click()}>Importar backup</button>
        <div className="mini-panel"><label>Estilo</label><select value={styleId} onChange={(e) => setStyleId(e.target.value)}>{STYLES.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}</select></div>
        <div className="mini-panel toggles"><label><input type="checkbox" checked={directorMode} onChange={(e) => setDirectorMode(e.target.checked)} /> Modo diretor</label><label><input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} /> Modo demo</label></div>
      </aside>

      {view === 'chat' && active && (
        <section className="chat">
          <header className="chat-head" style={{ '--c1': active.color, '--c2': active.color2 }}>
            <button onClick={() => setView('home')}>← Site</button>
            <div className="avatar small">{active.emoji}</div>
            <div><h2>{active.name}</h2><small>{moods[activeId] || 'neutro'} · Afinidade {affinity[activeId] || 0}/100 · {styleId}</small></div>
            <button onClick={() => setConvos((prev) => ({ ...prev, [activeId]: [{ role: 'assistant', content: active.greeting }] }))}>Limpar</button>
          </header>
          <div className="messages" ref={scrollRef}>{messages.map((m, i) => <div key={i} className={`msg ${m.role}`}>{renderText(m.content)}</div>)}{loading && <div className="msg assistant typing">pensando...</div>}</div>
          {error && <div className="error">{error}</div>}
          <section className="tools"><button onClick={rollDestiny}>🎲 destino</button><button onClick={summarizeConversation}>🧾 resumo</button><button onClick={generateDiary}>📓 diário</button><button onClick={refreshMemory}>🧠 memória</button>{['calmo', 'feliz', 'triste', 'irritado', 'vulnerável'].map((m) => <button key={m} onClick={() => setMood(m)}>{m}</button>)}</section>
          <section className="canon"><details><summary>Memória, pins, lorebook e diário</summary><div className="columns"><div><h3>Memória</h3><pre>{memories[activeId] || 'Sem memória ainda.'}</pre></div><div><h3>Pins</h3><textarea value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} placeholder="Momento canônico..." /><button onClick={() => { if (pinDraft.trim()) { setPinned((p) => ({ ...p, [activeId]: [...(p[activeId] || []), pinDraft.trim()] })); setPinDraft(''); } }}>Fixar</button>{(pinned[activeId] || []).map((p, i) => <p key={i} className="pill">{p}</p>)}</div><div><h3>Lorebook</h3><textarea value={loreDraft} onChange={(e) => setLoreDraft(e.target.value)} placeholder="Regra do mundo, lugar, segredo..." /><button onClick={() => { if (loreDraft.trim()) { setLorebook((p) => ({ ...p, [activeId]: [...(p[activeId] || []), loreDraft.trim()] })); setLoreDraft(''); } }}>Adicionar lore</button>{(lorebook[activeId] || []).map((p, i) => <p key={i} className="pill">{p}</p>)}</div><div><h3>Diário secreto</h3>{(diary[activeId] || []).map((p, i) => <p key={i} className="diary">{p}</p>)}</div></div></details></section>
          <footer className="composer"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Digite uma mensagem... comandos: /destino, /resumo, /diario, /diretor, /humor calmo" /><button className="primary" onClick={send} disabled={loading}>Enviar</button></footer>
        </section>
      )}

      {view === 'create' && <section className="page form-page"><h1>Criar personagem</h1><input placeholder="Nome" value={charForm.name} onChange={(e) => setCharForm({ ...charForm, name: e.target.value })} /><input placeholder="Tagline" value={charForm.tagline} onChange={(e) => setCharForm({ ...charForm, tagline: e.target.value })} /><textarea placeholder="Saudação inicial" value={charForm.greeting} onChange={(e) => setCharForm({ ...charForm, greeting: e.target.value })} /><textarea placeholder="Prompt/persona do personagem" value={charForm.persona} onChange={(e) => setCharForm({ ...charForm, persona: e.target.value })} /><div className="emoji-row">{EMOJIS.map((e) => <button key={e} onClick={() => setCharForm({ ...charForm, emoji: e })}>{e}</button>)}</div><button className="primary" onClick={createCharacter}>Criar e conversar</button></section>}

      {view === 'persona' && <section className="page form-page"><h1>Persona do usuário</h1><input placeholder="Nome da persona" value={personaForm.name} onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })} /><textarea placeholder="Aparência" value={personaForm.appearance} onChange={(e) => setPersonaForm({ ...personaForm, appearance: e.target.value })} /><textarea placeholder="Personalidade" value={personaForm.personality} onChange={(e) => setPersonaForm({ ...personaForm, personality: e.target.value })} /><button className="primary" onClick={createPersona}>Salvar persona</button><div className="grid mini">{personas.map((p) => <button key={p.id} className={p.id === activePersonaId ? 'selected' : ''} onClick={() => setActivePersonaId(p.id)}>{p.emoji} {p.name}</button>)}</div></section>}

      {view === 'settings' && <section className="page form-page"><h1>Configurações</h1><label>Endpoint da IA</label><input value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} /><p>GitHub Pages é estático. Use o modo demo ou configure um backend próprio.</p><label><input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} /> Usar modo demo local</label><label><input type="checkbox" checked={directorMode} onChange={(e) => setDirectorMode(e.target.checked)} /> Modo diretor global</label></section>}
    </main>
  );
}
