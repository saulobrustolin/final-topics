As tecnologias utilizadas foram: Node.JS com Express (core) e TypeORM no backend e React Router no frontend. Além disso, foi utilizado o Playwright para realizar os teste E2E.

Instalação e executação:

* Antes de qualquer coisa será necessário instalar o Node.JS (recomendado a versão LTS mais recente), o Docker (recomendado a versão mais recente) e também o FFmpeg. Após isso, podemos seguir com o passo a passo.

1. ``git clone https://github.com/saulobrustolin/final-topics``
2. ```cd ./final-topics``
3. ``cd ./frontend && npm i && cd ..``
4. ``cd ./backend && npm i && cd ..``
5. ``docker compose up -d``
6. Faça uma copia do ``.env.example`` na mesma camada da estrutura de pastas e renomeie para ``.env``
7. Caso a porta 5433 esteja ocupada, será necessário alterar em ``docker-compose.yaml`` e também no ``.env`` do projeto, para assim conseguir criar o container em uma porta livre e sincronizar com o pg driver (utilizado para conectar no banco de dados).
8. Para buildar ambas a camadas será necessário acessar a pasta do ``/backend`` e ``/frontend`` e executar  ``npm run build``. Lembre-se que deve acessar e executar em ambas as pastas do projeto.
9. Para executar deverá dar ``npm run start`` nas pastas ``/backend`` e ``/frontend``. Uma executação para cada terminal.
* Para que a etapa 9 funcione, a etapa 8 precisa ser concluída.
* Lembre-se que é necessário instalar o FFmpeg para funcionar.

Execução de testes:
1. Acesse o ```/frontend``
2. Execute o ``npx playwright install chromium`` no terminal
3. Execute no terminal ``npm run test:e2e``