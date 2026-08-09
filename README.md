# Gaste como Musk

Jogo mobile em React Native + Expo no qual a pessoa recebe uma estimativa ficticia da fortuna de Elon Musk convertida para reais e tenta gastar esse valor em produtos, experiencias, infraestrutura, impacto social e itens absurdamente caros.

Os valores sao estimativas para entretenimento. Todas as compras sao ficticias e nao representam oferta real, aconselhamento financeiro ou informacao patrimonial definitiva.

## Funcionalidades

- App Expo Router com tres abas: Gastar, Ranking e Perfil.
- Autenticacao anonima via Firebase quando as variaveis existem; modo local mock quando nao existem.
- Catalogo inicial com 90+ itens, categorias, filtros, busca, ordenacao, destaques e marcadores de real/estimado/hipotetico/ficticio.
- Imagens PNG locais originais para todos os itens do catalogo.
- Compra, venda, atalhos +1/+10/+100/Maximo, desfazer e protecao contra saldo negativo.
- Dinheiro em centavos usando `BigInt`, evitando perda de precisao com trilhoes.
- Cronometro por timestamps, pausado ao perder foco, trocar de aba ou ir para background.
- Sessao local persistida com AsyncStorage.
- Perfil com apelido, avatar por iniciais, estatisticas, conquistas e historico.
- Ranking com TanStack Query, pull to refresh, mock local e publicacao preparada para Firebase.
- Recibo ficticio visual e exportacao/compartilhamento em PDF via Expo Print + Expo Sharing.
- Firebase Functions com provider mock de patrimonio/cotacao e agendamento diario.
- Regras Firestore/Storage, indices, seed idempotente e `.env.example`.

## Arquitetura

```text
app/                      Rotas Expo Router
src/components/           Componentes reutilizaveis
src/constants/            Snapshot mock e conquistas
src/data/catalog.ts       Catalogo inicial versionado
src/features/catalog/     Filtros e ordenacao
src/features/game/        Engine pura de compra, venda, resumo e cronometro
src/features/ranking/     Validacao local do ranking
src/services/firebase/    Config e repositorios Firebase
src/services/sharing/     Recibo PDF e texto de compartilhamento
src/stores/               Zustand persistido
src/theme/                Tema visual
firebase/functions/       Cloud Functions
firebase/seed/            Seed idempotente
firebase/*.rules          Regras de seguranca
```

## Pre-requisitos

- Node.js 22.13+.
- npm 11+.
- Expo CLI via `npx expo`.
- Firebase CLI para emuladores, regras e deploy.
- Android Studio para Android. Para iOS local, macOS/Xcode; em outros sistemas use Expo Go ou EAS.

## Instalacao

```bash
npm install
cp .env.example .env
```

Preencha as variaveis `EXPO_PUBLIC_FIREBASE_*` com a configuracao publica do app Firebase. Nao coloque service account, chave privada ou segredo administrativo no app.

Sem variaveis Firebase, o app continua executando em modo local mock.

## Rodar no Expo

```bash
npm start
npm run android
npm run ios
npm run web
```

## Firebase

1. Crie um projeto Firebase com Authentication anonimo, Firestore e Storage.
2. Copie a config publica Web para `.env`.
3. Instale dependencias das Functions:

```bash
cd firebase/functions
npm install
cd ../..
```

4. Emuladores:

```bash
firebase emulators:start
```

5. Regras e indices:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

6. Functions:

```bash
cd firebase/functions
npm run deploy
```

A funcao agendada `updateDailyWealthSnapshot` usa Cloud Scheduler, que normalmente exige projeto Firebase no plano Blaze. Durante desenvolvimento ela usa provider mock/manual e mantem o ultimo snapshot valido.

## Seed

O script `firebase/seed/seedCatalog.ts` grava catalogo, conquistas, appConfig, versao de catalogo e snapshot de desenvolvimento de forma idempotente. Execute com credenciais administrativas apenas no ambiente de backend, por exemplo usando `tsx` ou compilando TypeScript dentro de uma rotina propria.

## Validacoes

```bash
npm run typecheck
npm run lint
npm test
npm run expo:check
```

## Estrategia de patrimonio

O app nunca faz scraping. A arquitetura das Functions usa `WealthProvider` e `ExchangeRateProvider`. Hoje existe um provider mock/manual; para producao, substitua por API oficial/licenciada ou fonte publica confiavel, preservando fallback para ultimo valor valido.

Formula:

```text
fortunaEmReais = fortunaEmDolares x cotacaoDolarReal
```

Os snapshots sao gravados por partida, entao uma atualizacao diaria nao muda uma sessao em andamento.

## Imagens e licencas

O MVP usa imagens PNG originais geradas localmente em `assets/catalog/`, uma por item, carregadas pelo app com `expo-image`. Os metadados de autoria/licenca ficam no catalogo.

Para regenerar as imagens e o mapa de assets:

```bash
npm run assets:catalog
```

Para producao, voce pode substituir esses assets por imagens proprias, licenciadas, Wikimedia Commons compativel, Unsplash/Pexels quando adequado ou imagens oficiais permitidas.

## Limitacoes conhecidas

- Ranking remoto depende de Firebase configurado; sem config, a tela usa dados mock.
- A validacao forte do ranking deve ser concentrada na Callable Function usando transacoes completas e versao de catalogo publicada.
- A edicao de apelidos unicos esta preparada, mas o sufixo automatico definitivo deve ser aplicado em Function transacional.
- Recibo completo em imagem pode ser adicionado com `react-native-view-shot`; o MVP entrega PDF compartilhavel.
- App Check esta documentado como proximo passo e deve ser ativado antes de producao.

## Proximos passos

- Adicionar provider real de patrimonio/cotacao.
- Subir imagens licenciadas para Firebase Storage e trocar placeholders.
- Finalizar fluxo de vinculacao por e-mail.
- Implementar painel admin via Firestore Console ou tela protegida.
- Ampliar testes de regras com Firebase Emulator Suite.
- Separar rankings semanal/mensal com jobs de agregacao.
