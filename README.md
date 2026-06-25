# Personas Chat

Site/app React + Vite para conversar com personagens de roleplay, com memória, lorebook, favoritos, backup, modo diretor, comandos narrativos e modo demo.

A página inicial foi organizada em formato de site/landing page, com apresentação do projeto, vitrine de personagens e chamada para abrir o chat.

## Recursos

- Personagens prontos e personagens criados pelo usuário
- Persona do usuário para entrar na história
- Memória local por personagem
- Lorebook para regras do mundo e detalhes canônicos
- Momentos fixados
- Humor e afinidade
- Diário secreto
- Dado do destino
- Modo diretor
- Backup e importação em JSON
- Modo demo local para funcionar no GitHub Pages

## Rodar localmente

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Este projeto está preparado para GitHub Pages usando Vite com `base: '/chat/'`.

Endereço esperado após ativar o Pages:

```txt
https://yurihay.github.io/chat/
```

## Observação sobre IA

GitHub Pages é hospedagem estática. Por isso, o app inclui modo demo local. Para usar Claude de verdade, configure um backend próprio compatível com o endpoint `/api/claude` ou altere o endpoint nas configurações do app.
