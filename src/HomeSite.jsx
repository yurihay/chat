import React from 'react';

const FEATURES = [
  ['🧠', 'Memória viva', 'Personagens guardam fatos importantes, vínculos e acontecimentos da história.'],
  ['📚', 'Lorebook', 'Registre regras do mundo, lugares, poderes, segredos e detalhes canônicos.'],
  ['🎭', 'Persona do usuário', 'Entre na história com nome, aparência e personalidade próprios.'],
  ['🎲', 'Dado do destino', 'Gere reviravoltas narrativas rápidas para cenas mais imprevisíveis.'],
  ['🔥', 'Humor e afinidade', 'O tom muda conforme o estado emocional e a proximidade com cada personagem.'],
  ['📓', 'Diário secreto', 'Crie pensamentos internos do personagem para dar profundidade emocional.']
];

const COMMANDS = ['/destino', '/resumo', '/diario', '/diretor', '/humor calmo'];

export default function HomeSite({
  characters,
  filteredCharacters,
  search,
  setSearch,
  openChat,
  setView,
  convos,
  affinity,
  favorites,
  setFavorites,
  duplicateCharacter,
  exportData,
  importClick,
  personas
}) {
  const totalMessages = Object.values(convos || {}).flat().length;
  const firstCharacter = characters[0];

  return (
    <main className="site-shell">
      <nav className="site-nav">
        <button className="site-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span>✦</span>
          <strong>Personas Chat</strong>
        </button>
        <div className="site-links">
          <a href="#recursos">Recursos</a>
          <a href="#personagens">Personagens</a>
          <a href="#comandos">Comandos</a>
          <a href="#faq">FAQ</a>
        </div>
        {firstCharacter && <button className="primary" onClick={() => openChat(firstCharacter)}>Abrir chat</button>}
      </nav>

      <section className="site-hero">
        <div className="hero-copy">
          <span className="eyebrow">Roleplay · Memória · Lorebook · Modo demo</span>
          <h1>Crie personagens que lembram, sentem e evoluem com você.</h1>
          <p>
            Um site-app de conversas narrativas com personagens originais, afinidade, humor,
            diário secreto, comandos especiais e backup local. Feito para criar cenas, histórias
            e vínculos de um jeito mais pessoal.
          </p>
          <div className="hero-actions">
            {firstCharacter && <button className="primary big" onClick={() => openChat(firstCharacter)}>Começar agora</button>}
            <button className="ghost big" onClick={() => setView('create')}>Criar personagem</button>
          </div>
          <div className="hero-stats">
            <span><strong>{characters.length}</strong> personagens</span>
            <span><strong>{personas.length || 1}</strong> persona</span>
            <span><strong>{totalMessages}</strong> mensagens locais</span>
          </div>
        </div>

        <div className="hero-demo-card">
          <div className="demo-top">
            <span className="dot pink" />
            <span className="dot purple" />
            <span className="dot blue" />
            <small>prévia narrativa</small>
          </div>
          <div className="demo-character">🜲 Vesper</div>
          <p className="demo-bubble assistant">*a sala respira como se fosse feita de vidro rachado* Você trouxe uma pergunta... ou uma ferida?</p>
          <p className="demo-bubble user">Eu queria criar uma história diferente.</p>
          <p className="demo-bubble assistant">Então vamos fazer do jeito certo: com memória, consequência e um pouco de caos.</p>
        </div>
      </section>

      <section id="recursos" className="site-section">
        <div className="section-head">
          <span className="eyebrow">Recursos</span>
          <h2>Mais que um chat: um pequeno estúdio de histórias.</h2>
          <p>O foco é transformar cada conversa em uma cena contínua, com regras, vínculos e momentos importantes.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map(([icon, title, text]) => (
            <article key={title} className="feature-card">
              <span>{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section split-section">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>Entre em cena em três passos.</h2>
        </div>
        <div className="steps">
          <article><strong>01</strong><h3>Escolha ou crie</h3><p>Use personagens prontos ou monte seu próprio personagem com saudação e personalidade.</p></article>
          <article><strong>02</strong><h3>Defina o mundo</h3><p>Adicione lore, momentos fixados e uma persona para participar da história.</p></article>
          <article><strong>03</strong><h3>Converse e evolua</h3><p>A afinidade, o humor, a memória e o modo diretor ajudam a cena a ganhar continuidade.</p></article>
        </div>
      </section>

      <section id="personagens" className="site-section">
        <div className="section-head horizontal">
          <div>
            <span className="eyebrow">Vitrine</span>
            <h2>Personagens disponíveis</h2>
          </div>
          <input className="search site-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar personagem..." />
        </div>

        <div className="grid site-character-grid">
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
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="comandos" className="site-section command-section">
        <div>
          <span className="eyebrow">Comandos</span>
          <h2>Controle narrativo direto no chat.</h2>
          <p>Digite comandos começando com barra para mudar o ritmo da história sem abrir menus.</p>
        </div>
        <div className="command-list">
          {COMMANDS.map((cmd) => <code key={cmd}>{cmd}</code>)}
        </div>
      </section>

      <section id="faq" className="site-section faq-section">
        <span className="eyebrow">FAQ</span>
        <h2>Perguntas rápidas</h2>
        <details open><summary>O site funciona sem backend?</summary><p>Sim. Ele vem com modo demo local ativado por padrão, então dá para testar a experiência no GitHub Pages.</p></details>
        <details><summary>Ele usa IA real?</summary><p>Para usar IA real, desligue o modo demo e configure um backend compatível no endpoint definido nas configurações.</p></details>
        <details><summary>Onde ficam meus dados?</summary><p>Os dados ficam no armazenamento local do navegador e podem ser exportados ou importados em JSON.</p></details>
      </section>

      <footer className="site-footer">
        <div>
          <strong>Personas Chat</strong>
          <p>Um projeto React/Vite para histórias interativas e personagens persistentes.</p>
        </div>
        <div className="footer-actions">
          <button onClick={exportData}>Exportar backup</button>
          <button onClick={importClick}>Importar backup</button>
          {firstCharacter && <button className="primary" onClick={() => openChat(firstCharacter)}>Abrir app</button>}
        </div>
      </footer>
    </main>
  );
}
