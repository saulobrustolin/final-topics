As tecnologias utilizadas foram: Node.JS com Express (core) e TypeORM no backend e React Router no frontend. Além disso, foi utilizado o Playwright para realizar os teste E2E.

Instalação e executação:

* Antes de qualquer coisa será necessário instalar o Node.JS (recomendado a versão LTS mais recente), o Docker (recomendado a versão mais recente) e também o FFmpeg. Após isso, podemos seguir com o passo a passo.

1. ``git clone https://github.com/saulobrustolin/final-topics``
2. ```cd ./final-topics``
3. ``cd ./frontend && npm i && cd ..``
4. ``cd ./backend && npm i && cd ..``
5. ``docker compose up -d``
6. Pronto, projeto rodando em http://localhost:80

Execução de testes:
1. Acesse o ```/frontend``
2. Execute o ``npx playwright install chromium`` no terminal
3. Execute no terminal ``npm run test:e2e``