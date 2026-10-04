# ELEIÇÃO.EXE

Central de acompanhamento eleitoral não-oficial™. Um painel para acompanhar entre amigos a apuração
presidencial de 2026 com dados oficiais do TSE, placar em formato de duelo, termômetro do grupo e narrador.

> Projeto independente, sem vínculo com o TSE. Não faz campanha, não torce e não prevê resultado.

## Rodando

Requer Node 20 ou mais novo.

```bash
npm install
npm run dev
```

Abra http://localhost:5173. O Vite serve o frontend e repassa `/api` para o servidor em `localhost:3001`.

Para testar sem esperar a eleição, ligue **Modo demonstração** no topo ou abra direto um cenário:

| URL | Cenário |
| --- | --- |
| `/?demo=virada` | Um lado abre na frente e perde a liderança no fim |
| `/?demo=apertada` | Diferença abaixo de 1 p.p. com várias trocas de liderança |
| `/?demo=folgada` | Vantagem grande do começo ao fim |
| `/?demo=finalizado` | 100% totalizado direto |
| `/?demo=erro` | A fonte falha de tempos em tempos (testa o "último dado conhecido") |
| `/?demo=sem-dados` | Fonte ainda sem números (testa a contagem regressiva) |
| `/?demo=comemoracao` | 100% totalizado com o 22 eleito (testa a tela de comemoração) |

No modo demonstração a apuração avança um passo a cada 4 segundos (cerca de 6 minutos de "relógio de
eleição"), segura o resultado final e recomeça. Os candidatos e partidos são inventados.

## Produção

```bash
npm run build   # checa tipos e gera dist/
npm start       # um único servidor Node entrega o site e a API
```

Use um servidor sempre ligado (Render, Railway, Fly.io ou VPS). Na etapa 2 o histórico da apuração fica
guardado no servidor, o que não funciona bem em hospedagem serverless sem um banco externo.

## Estrutura

```
shared/      Tipos e regras puras usadas pelo servidor e pelo navegador
  types.ts       ElectionSnapshot, CandidateResult, ElectionStatus, ElectionPayload...
  election.ts    Ordenação, duelo, status da apuração
  narrator.ts    Eventos do narrador (determinísticos, com limiares e intervalo anti-spam)
  thermometer.ts Termômetro do grupo
  format.ts      Formatação pt-BR (votos, %, p.p., horário de Brasília)
server/      API Node (Express)
  providers/     MockElectionProvider (demo) e TseResultsService (oficial)
  services/      Monta a resposta: status, histórico e eventos
src/         Frontend React
  components/    election/, layout/, states/, ui/ (shadcn)
  hooks/         useElection (polling), useDemoSettings, animações
  pages/         DashboardPage
  services/      Cliente da API
  utils/         Funções de apoio
```

O navegador nunca chama o TSE diretamente. Ele só fala com `/api/election`, e quem conversa com o TSE é o
servidor. Assim um único cliente consulta a fonte oficial, não importa quantos amigos estejam com o link aberto.

## Etapas

- [x] **1. Estrutura, layout, provider de demonstração e dashboard funcionando**
- [ ] **2. Integração real com o TSE:** `TseResultsService` lê `ele-c.json`, descobre o código da eleição
      presidencial, baixa `br-c0001-e{código}-u.json` a cada 15s e guarda um snapshot sempre que a totalização
      muda. Dá para validar com os arquivos do simulado publicados pelo TSE antes do dia da eleição.
- [ ] **3. IA de plantão:** comentários curtos gerados no servidor a partir dos números já calculados,
      só quando o narrador detecta algo relevante.
- [ ] **4. Refinamento visual e extras:** Hall da Glória dos palpites, tela de abertura.
