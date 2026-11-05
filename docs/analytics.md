# Métricas de visitação (Umami Cloud)

O front mede visitas com a [Umami Cloud](https://cloud.umami.is), plano gratuito (cerca de 100 mil eventos/mês, 6 meses de histórico). Ela não usa cookies nem guarda dados pessoais, por isso não há banner de consentimento.

## Como funciona no código

| Arquivo | Papel |
|---|---|
| `src/components/app/Analytics.tsx` | Carrega o script da Umami no layout raiz. Sem `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, não carrega nada. |
| `src/lib/analytics.ts` | `track(nome, dados)` para eventos e o filtro que descarta `/admin` e `/login`. |

O script conta sozinho cada página vista, inclusive a navegação interna do Next, e lê os parâmetros `utm_*` da URL.

### Eventos personalizados

| Evento | Dados | Quando |
|---|---|---|
| `hidrossistema-selecionado` | `nome` | O visitante escolhe um hidrossistema (a seleção automática do primeiro não conta) |
| `simulacao-executada` | `hidrossistema`, `modo` (`unico` / `comparacao`) | Clique em simular, depois das validações |
| `download-simulacao` | `arquivo` (ex.: `simulacao_completa`) | Download de qualquer CSV da simulação |

O hidrossistema escolhido não aparece na URL. Por isso o evento `hidrossistema-selecionado` é a forma de saber quais foram mais vistos.

## Configuração (uma vez)

1. Criar uma conta em <https://cloud.umami.is> e adicionar um *website* com o domínio de produção.
2. Copiar o **Website ID** (UUID). Ele é público e vai no HTML.
3. Na hospedagem do front (Vercel → *Settings → Environment Variables*), só em **Production**:
   - `NEXT_PUBLIC_UMAMI_WEBSITE_ID` = o UUID
   - `NEXT_PUBLIC_UMAMI_DOMAINS` = o domínio de produção, sem `https://` (vários separados por vírgula)
4. Fazer um novo deploy. Variáveis `NEXT_PUBLIC_*` entram no build, então trocar a variável sem redeploy não tem efeito.

Não coloque o ID no `.env.local`. Se colocar, preencha também `NEXT_PUBLIC_UMAMI_DOMAINS`; com isso, o `localhost` fica fora das métricas.

## Antes do congresso

- **QR code:** aponte para a home com UTM, por exemplo
  `https://<domínio>/?utm_source=congresso&utm_medium=qrcode&utm_campaign=<nome-do-evento>`.
  No painel, filtre por *UTM source = congresso* para ver só quem veio pelo QR.
- **Tirar os próprios acessos:** no navegador de cada pessoa da equipe, abra o console do DevTools no site de produção e rode
  `localStorage.setItem("umami.disabled", 1)`.
- **Teste de fumaça:** abra o site pelo celular (dados móveis, sem o filtro acima), troque de hidrossistema e confira em *Realtime* no painel da Umami.
- **Mostrar ao público (opcional):** nas configurações do website, a opção *Share URL* da Umami gera um link público e somente leitura do painel.

## Limitações conhecidas

- Bloqueadores de anúncio podem barrar `cloud.umami.is`; parte das visitas não aparece.
  Não fizemos proxy pelo próprio domínio. Com proxy, a Umami recebe o IP do servidor no lugar do IP do visitante e passa a juntar visitantes diferentes num só.
- O plano gratuito tem limite mensal de eventos. O tráfego esperado de um congresso fica muito abaixo dele; o consumo aparece no painel da conta.
