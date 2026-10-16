# Superprompt

Gerador de prompts curtos, estruturados e sem alucinação. App web (PWA): instala no celular/computador e funciona offline.

## Estrutura
```
index.html            página
style.css             visual
app.js                lógica
sw.js                 cache offline
manifest.webmanifest  dados de instalação
fonts/                Fredoka e Lilita One
icons/                ícones 32, 180, 192, 512 e maskable
```

## Publicar (GitHub Pages)
1. Suba **todos** os arquivos e pastas na raiz do repositório.
2. Settings → Pages → Branch `main` / `(root)` → Save.
3. Abra o link e use **Instalar** (ou "Adicionar à tela inicial").

## Recursos
- Tipos de pedido: analisar material, criar texto e criar imagem (com campos de cores, estilo, texto da arte e o que evitar)
- Técnica (direta, pensar antes, auto-verificação, formato estrito), estilo (tags/Markdown), tamanho (completo/compacto)
- Variáveis `{{nome}}` para modelos reutilizáveis
- Histórico, rascunho automático, link compartilhável (sem o material), exportar/importar modelos
- Abrir o prompt direto no Claude ou no ChatGPT
- Atalho: Ctrl/Cmd + Enter copia o prompt
