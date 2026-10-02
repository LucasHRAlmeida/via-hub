#!/usr/bin/env python3
"""Gera grok/bot/opcoes-grok-bot.pdf — opções de hospedagem, impacto e custo de um Grok Bot.

Fonte canônica do PDF. Todos os custos são recalculados aqui a partir das tabelas de preço
abaixo; para atualizar o documento, edite as constantes e rode:

    python3 grok/bot/gerar_pdf_opcoes.py
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

AQUI = Path(__file__).resolve().parent
SAIDA = AQUI / "opcoes-grok-bot.pdf"
DATA_REFERENCIA = "outubro de 2026"
DATA_REVISAO = "02/10/2026"  # data da coleta de preços

# Paleta institucional VIA (styles.css, :root)
NAVY_950 = colors.HexColor("#062a47")
NAVY_900 = colors.HexColor("#0c3e67")
NAVY_700 = colors.HexColor("#196793")
TEAL_500 = colors.HexColor("#19a6c9")
TEAL_100 = colors.HexColor("#dff5fa")
GREEN_500 = colors.HexColor("#2eaf53")
GREEN_100 = colors.HexColor("#e6f6ea")
INK = colors.HexColor("#122331")
MUTED = colors.HexColor("#526879")
LINE = colors.HexColor("#d7e1e8")
WASH = colors.HexColor("#f3f7f9")

# ---------------------------------------------------------------------------
# Premissas de preço (USD). Fontes listadas na seção final do PDF.
# ---------------------------------------------------------------------------
TAXA_BRL = 5.50  # premissa de conversão US$ 1 = R$ 5,50 (não é cotação oficial)

# xAI, por 1 milhão de tokens, prompts < 200k tokens
XAI = {
    "grok-4.6": {"entrada": 2.00, "cache": 0.50, "saida": 6.00, "contexto": "500k"},
    "grok-4.5": {"entrada": 2.00, "cache": 0.30, "saida": 6.00, "contexto": "—"},
    "grok-4.3": {"entrada": 1.25, "cache": 0.20, "saida": 2.50, "contexto": "1M"},
    "grok-4.20": {"entrada": 1.25, "cache": 0.20, "saida": 2.50, "contexto": "1M"},
    "grok-build-0.1": {"entrada": 1.00, "cache": 0.20, "saida": 2.00, "contexto": "—"},
}
XAI_46_LONGO = {"entrada": 4.00, "cache": 1.00, "saida": 12.00}  # prompts >= 200k
FERRAMENTA_WEB_SEARCH = 5.00 / 1000  # web_search / x_search / code_execution, por chamada
FERRAMENTA_ATTACHMENT = 10.00 / 1000
FERRAMENTA_COLLECTIONS = 2.50 / 1000

# Mensagem típica
TOK_ENTRADA = 2000
TOK_SAIDA = 500
TOK_CACHE = 1500  # parte da entrada servida do cache (prompt de sistema + histórico estável)
VOLUMES = [1_000, 10_000, 100_000]

# Hospedagem (mensal)
WORKERS_PAID = 5.00
VERCEL_PRO = 20.00  # por assento, inclui US$ 20 de crédito de uso
VERCEL_CPU_H_GRU = 0.221
VERCEL_INVOC_M = 0.60
WORKERS_REQ_M = 0.30
WORKERS_CPU_M = 0.02
CPU_MS_WORKER = 5  # premissa: CPU efetiva por requisição no proxy (espera de rede não conta)
CPU_MS_VERCEL = 50  # premissa: CPU ativa por invocação na Vercel

# WhatsApp Business Platform (Brasil), mensagem de serviço a partir de 01/10/2026
WA_GRATIS_SERVICO = 1000  # por número comercial, por mês (fonte oficial Meta)
WA_SERVICO_USD = 0.0068  # R$ 0,035 em conta BRL — valor de fontes secundárias (ver texto)

# GitHub App: revisão de PR
GH_EVENTOS = 300
GH_TOK_ENTRADA = 20_000
GH_TOK_SAIDA = 2_000


def custo_tokens(modelo, entrada=TOK_ENTRADA, saida=TOK_SAIDA, cache=0):
    p = XAI[modelo]
    nao_cache = entrada - cache
    return (nao_cache * p["entrada"] + cache * p["cache"] + saida * p["saida"]) / 1e6


def custo_workers(n):
    req = max(0.0, n - 10_000_000) / 1e6 * WORKERS_REQ_M
    cpu = max(0.0, n * CPU_MS_WORKER - 30_000_000) / 1e6 * WORKERS_CPU_M
    return WORKERS_PAID + req + cpu


def uso_vercel(n):
    return n / 1e6 * VERCEL_INVOC_M + n * CPU_MS_VERCEL / 1000 / 3600 * VERCEL_CPU_H_GRU


def custo_vercel(n):
    return VERCEL_PRO + max(0.0, uso_vercel(n) - VERCEL_PRO)


def custo_whatsapp(n):
    return max(0, n - WA_GRATIS_SERVICO) * WA_SERVICO_USD


# ---------------------------------------------------------------------------
# Formatação pt-BR
# ---------------------------------------------------------------------------
def _num(v, casas):
    s = f"{v:,.{casas}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def usd(v, casas=2):
    return f"US$\u00a0{_num(v, casas)}"


def brl(v, casas=2):
    return f"R$\u00a0{_num(v * TAXA_BRL, casas)}"


def inteiro(v):
    return _num(v, 0)


# ---------------------------------------------------------------------------
# Fontes e estilos
# ---------------------------------------------------------------------------
def registrar_fontes():
    base = Path("/usr/share/fonts/truetype/dejavu")
    pares = {
        "VIA": "DejaVuSans.ttf",
        "VIA-Bold": "DejaVuSans-Bold.ttf",
        "VIA-Serif-Bold": "DejaVuSerif-Bold.ttf",
    }
    for nome, arquivo in pares.items():
        caminho = base / arquivo
        if not caminho.exists():
            raise SystemExit(f"Fonte ausente: {caminho}. Instale fonts-dejavu-core.")
        pdfmetrics.registerFont(TTFont(nome, str(caminho)))
    pdfmetrics.registerFontFamily("VIA", normal="VIA", bold="VIA-Bold", italic="VIA", boldItalic="VIA-Bold")


registrar_fontes()

E = {
    "corpo": ParagraphStyle("corpo", fontName="VIA", fontSize=9.4, leading=13.4, textColor=INK, alignment=TA_LEFT, spaceAfter=5),
    "pequeno": ParagraphStyle("pequeno", fontName="VIA", fontSize=7.8, leading=10.6, textColor=MUTED, spaceAfter=3),
    "celula": ParagraphStyle("celula", fontName="VIA", fontSize=8, leading=10.4, textColor=INK),
    "celula_b": ParagraphStyle("celula_b", fontName="VIA-Bold", fontSize=8, leading=10.4, textColor=INK),
    "cab": ParagraphStyle("cab", fontName="VIA-Bold", fontSize=8, leading=10.4, textColor=colors.white),
    "h1": ParagraphStyle("h1", fontName="VIA-Serif-Bold", fontSize=15, leading=19, textColor=NAVY_950, spaceBefore=6, spaceAfter=7),
    "h2": ParagraphStyle("h2", fontName="VIA-Bold", fontSize=11, leading=14.5, textColor=NAVY_900, spaceBefore=8, spaceAfter=4),
    "kicker": ParagraphStyle("kicker", fontName="VIA-Bold", fontSize=8, leading=10, textColor=TEAL_500, spaceAfter=4),
    "titulo": ParagraphStyle("titulo", fontName="VIA-Serif-Bold", fontSize=24, leading=29, textColor=NAVY_950, spaceAfter=8),
    "subtitulo": ParagraphStyle("subtitulo", fontName="VIA", fontSize=11.5, leading=16, textColor=MUTED, spaceAfter=12),
    "bullet": ParagraphStyle("bullet", fontName="VIA", fontSize=9.4, leading=13.2, textColor=INK, leftIndent=11, bulletIndent=1, spaceAfter=2.5),
    "destaque": ParagraphStyle("destaque", fontName="VIA", fontSize=9.6, leading=13.8, textColor=NAVY_950),
}


def p(texto, estilo="corpo"):
    return Paragraph(texto, E[estilo])


def bullets(itens):
    return [Paragraph(t, E["bullet"], bulletText="•") for t in itens]


def tabela(linhas, larguras, cab_cor=NAVY_900, zebra=True, negrito_primeira_col=False):
    dados = []
    for i, linha in enumerate(linhas):
        if i == 0:
            dados.append([Paragraph(c, E["cab"]) for c in linha])
        else:
            dados.append([
                Paragraph(c, E["celula_b"] if (negrito_primeira_col and j == 0) else E["celula"])
                for j, c in enumerate(linha)
            ])
    t = Table(dados, colWidths=larguras, repeatRows=1)
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), cab_cor),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]
    if zebra:
        for i in range(1, len(dados)):
            if i % 2 == 0:
                estilo.append(("BACKGROUND", (0, i), (-1, i), WASH))
    t.setStyle(TableStyle(estilo))
    return t


def caixa(conteudo, fundo=TEAL_100, borda=TEAL_500, largura=170 * mm):
    if isinstance(conteudo, str):
        conteudo = [p(conteudo, "destaque")]
    t = Table([[conteudo]], colWidths=[largura])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fundo),
        ("LINEBEFORE", (0, 0), (0, -1), 3, borda),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


def rodape(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(NAVY_950)
    canvas.rect(0, h - 6 * mm, w, 6 * mm, stroke=0, fill=1)
    canvas.setFillColor(TEAL_500)
    canvas.rect(0, h - 7 * mm, w, 1 * mm, stroke=0, fill=1)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 14 * mm, w - 20 * mm, 14 * mm)
    canvas.setFont("VIA", 7.2)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 9.5 * mm, f"Iniciativa VIA · Grok Bot — opções, impacto e custos · referência: {DATA_REFERENCIA}")
    canvas.drawRightString(w - 20 * mm, 9.5 * mm, f"página {doc.page}")
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Conteúdo
# ---------------------------------------------------------------------------
def capa_e_resumo():
    c46 = custo_tokens("grok-4.6")
    c43 = custo_tokens("grok-4.3")
    rec_10k = 10_000 * c46 + custo_workers(10_000)
    out = [
        Spacer(1, 10 * mm),
        p("INICIATIVA VIA · DOCUMENTO DE DECISÃO", "kicker"),
        p("Grok Bot: onde rodar, para que serve e quanto custa", "titulo"),
        p("Comparativo de seis caminhos para um bot baseado na API da xAI (Grok), com escala de impacto, "
          f"preços oficiais por token e cenários mensais. Valores de {DATA_REFERENCIA}.", "subtitulo"),
        p("Resumo executivo", "h1"),
        caixa([
            p("<b>Recomendação.</b> Construir o bot como um módulo dentro do via-hub, no domínio próprio "
              "iniciativa-via.com, com um proxy em <b>Cloudflare Workers</b> que guarda a chave da xAI e passa pelo "
              "<b>AI Gateway</b> (registros, limite de requisições e controle de gasto). É o caminho de menor custo fixo "
              f"(US$ 0 a US$ {_num(WORKERS_PAID, 0)}/mês de hospedagem), sem cobrança de tráfego, e reaproveitável depois "
              "para Telegram, WhatsApp ou um GitHub App sem refazer o núcleo.", "destaque"),
            Spacer(1, 4),
            p(f"<b>Ordem de grandeza.</b> Com o modelo recomendado (grok-4.6), uma mensagem típica custa cerca de "
              f"{usd(c46, 5)} ({brl(c46, 4)}); com grok-4.3, {usd(c43, 5)}. Dez mil mensagens por mês com grok-4.6 e "
              f"Workers pago somam aproximadamente {usd(rec_10k)} ({brl(rec_10k)}).", "destaque"),
        ]),
        Spacer(1, 6),
        p("O que este documento responde", "h2"),
        *bullets([
            "Onde o bot pode ser exibido e executado (seis opções) e para que cada uma é ideal.",
            "Força do impacto e ganho potencial de qualidade, em escala de 1 a 5, com justificativa.",
            "Preço por token dos modelos Grok e das plataformas de hospedagem, com fontes oficiais.",
            "Custo mensal estimado em 1.000, 10.000 e 100.000 mensagens, com e sem busca na web.",
            "Riscos de conformidade (LGPD, dados de saúde, termos do WhatsApp) e próximos passos.",
        ]),
        Spacer(1, 6),
        p("Ponto técnico crítico: a chave nunca vai para o site", "h2"),
        p("O via-hub é servido pelo GitHub Pages, que entrega apenas arquivos estáticos. Qualquer chave colocada no "
          "HTML ou no JavaScript fica visível para qualquer visitante, que poderia usá-la e gerar cobrança. Por isso, "
          "<b>toda opção web exige um intermediário no servidor</b> (um Worker da Cloudflare ou uma Function da Vercel) "
          "que guarda a <font face='VIA-Bold'>XAI_API_KEY</font> como segredo, recebe a pergunta do navegador, aplica "
          "limites e só então chama a xAI."),
        caixa(p("Navegador (via-hub, iniciativa-via.com)  →  proxy no servidor (Worker/Function, guarda a chave, "
                "aplica limites)  →  AI Gateway (registros, cache, teto de gasto)  →  API da xAI (Grok)", "destaque"),
              fundo=WASH, borda=NAVY_700),
        Spacer(1, 4),
        p("Os termos do GitHub Pages também proíbem uso primariamente comercial ou como serviço (SaaS) e transações "
          "sensíveis. Um bot institucional e informativo, com o processamento fora do Pages, é compatível; cobrança de "
          "usuários ou coleta de dados sensíveis pelo site não é.", "pequeno"),
    ]
    return out


OPCOES = [
    # nome, onde renderiza, ideal para, impacto, complexidade, justificativa
    ("A. Módulo no via-hub", "Página ou widget de chat no próprio site (GitHub Pages, domínio iniciativa-via.com); requer proxy.",
     "Presença pública da VIA, letramento digital, perguntas sobre o manifesto, o pipeline e os projetos.", 4, 2,
     "Alcança quem já visita o site, sob a marca e o domínio da VIA, com conteúdo curado. Não chega a quem não visita o site."),
    ("B. GitHub App", "Bot que comenta em issues e pull requests do repositório; servidor recebe webhooks.",
     "Triagem de issues, revisão de PRs, checagem de textos e de consistência do site.", 3, 3,
     "Ganho de qualidade técnica real, mas interno e parcialmente sobreposto a Codex e Copilot, já usados no repositório."),
    ("C. Cloudflare Workers + AI Gateway", "Não é uma interface: é o servidor que guarda a chave e atende A, B, E e F.",
     "Proxy seguro, limites de uso, registros e teto de gasto com o menor custo fixo.", 5, 2,
     "É a peça que viabiliza com segurança todas as outras opções; sem cobrança de tráfego e com plano gratuito generoso."),
    ("D. Vercel (Functions + AI SDK / AI Gateway)", "Servidor alternativo; pode também hospedar uma interface Next.js própria.",
     "Interface de chat mais rica (streaming, histórico) com o AI SDK; equipe já habituada a Next.js.", 3, 3,
     "Mesmo resultado funcional do Workers, com custo fixo maior (Pro US$ 20/assento); Hobby não admite uso comercial."),
    ("E. WhatsApp Business", "Conversa no WhatsApp, no número institucional +55 16 99618-0196 (via Cloud API da Meta ou Twilio).",
     "Atendimento institucional a quem não navega em sites: dúvidas frequentes, agenda, encaminhamento a humano.", 5, 4,
     "Maior alcance no Brasil, mas com custo por mensagem, aprovação da Meta e restrição a assistentes de uso geral."),
    ("F. Telegram", "Conversa em bot do Telegram, criado via @BotFather; webhook no Worker.",
     "Protótipo rápido e gratuito, grupos de estudo, testes internos antes do WhatsApp.", 2, 1,
     "API gratuita e simples, porém com alcance bem menor que o WhatsApp no público brasileiro."),
]


def opcoes():
    linhas = [["Opção", "Onde é renderizado", "Ideal para", "Impacto", "Complexidade"]]
    for nome, onde, ideal, imp, cx, _ in OPCOES:
        linhas.append([nome, onde, ideal, f"{imp}/5", f"{cx}/5"])
    out = [
        PageBreak(),
        p("1. Opções de onde e como o bot é renderizado", "h1"),
        p("As opções não são excludentes. A arquitetura recomendada separa a <b>interface</b> (site, WhatsApp, Telegram, "
          "GitHub) do <b>núcleo</b> (proxy com a chave, instruções do bot e limites), de modo que um mesmo núcleo atenda "
          "vários canais."),
        tabela(linhas, [33 * mm, 46 * mm, 55 * mm, 16 * mm, 20 * mm], negrito_primeira_col=True),
        Spacer(1, 6),
        p("Escala de impacto (ganho potencial de qualidade e alcance)", "h2"),
        tabela([
            ["Nota", "Significado"],
            ["1", "Ganho marginal; útil apenas para teste ou para um grupo muito restrito."],
            ["2", "Ganho localizado; alcance pequeno ou público já atendido por outros meios."],
            ["3", "Ganho claro em uma frente (técnica ou de comunicação), com alcance moderado."],
            ["4", "Ganho relevante e visível para o público da VIA, sob marca própria."],
            ["5", "Ganho estrutural: viabiliza outras frentes ou alcança o maior público possível."],
        ], [16 * mm, 154 * mm], cab_cor=NAVY_700),
        p("Complexidade segue a mesma escala (1 = configuração simples; 5 = integração com aprovação de terceiros, "
          "políticas e operação contínua). A execução técnica fica a cargo do agente; a nota indica esforço e risco, "
          "não tarefa para o mantenedor.", "pequeno"),
        Spacer(1, 4),
        p("Justificativa das notas", "h2"),
    ]
    for nome, _, _, imp, _, just in OPCOES:
        out.append(p(f"<b>{nome} — {imp}/5.</b> {just}"))
    return out


def detalhes_plataformas():
    out = [
        Spacer(1, 4),
        p("2. Detalhes por plataforma", "h1"),
        p("GitHub Pages (interface da opção A)", "h2"),
        *bullets([
            "Suporta domínio próprio com HTTPS — o via-hub já usa iniciativa-via.com/via-hub/.",
            "Limites: site de até 1 GB e cerca de 100 GB/mês de banda (limite flexível). Um widget de chat é leve.",
            "Não executa código no servidor: não guarda segredos e não chama a xAI diretamente.",
            "Não se destina a SaaS, comércio eletrônico ou transações sensíveis.",
        ]),
        p("GitHub App (opção B)", "h2"),
        *bullets([
            "Permissões finas por repositório, tokens de curta duração e identidade de bot que não ocupa assento pago.",
            "Recebe eventos <i>issues</i>, <i>pull_request</i> e <i>issue_comment</i> por webhook; precisa de um servidor "
            "para recebê-los (o mesmo Worker ou Function).",
            "Conforme AGENTS.md, comentários do bot não contam como revisão independente nem autorizam merge.",
        ]),
        p("Cloudflare Workers + AI Gateway (opção C)", "h2"),
        *bullets([
            "Free: 100 mil requisições/dia e 10 ms de CPU por requisição. A espera pela resposta da xAI não conta como CPU.",
            f"Paid: US$ {_num(WORKERS_PAID, 0)}/mês com 10 milhões de requisições e 30 milhões de CPU-ms incluídos; "
            f"excedente de US$ {_num(WORKERS_REQ_M, 2)} por milhão de requisições e US$ {_num(WORKERS_CPU_M, 2)} por "
            "milhão de CPU-ms. <b>Sem cobrança de tráfego de saída (egress).</b>",
            "AI Gateway: análise de uso, cache e limitação de requisições gratuitos; registros de 100 mil (Free) ou "
            "10 milhões por gateway (Paid). Unified Billing cobra 5% sobre créditos comprados, sem acréscimo por token; "
            "com chave própria da xAI, essa taxa não se aplica.",
        ]),
        p("Vercel (opção D)", "h2"),
        *bullets([
            "Hobby: gratuito, apenas uso pessoal e não comercial; 1 milhão de invocações, 4 h de CPU e 360 GB-h; ao "
            "exceder, o projeto é pausado.",
            f"Pro: US$ {_num(VERCEL_PRO, 0)}/mês por assento, com US$ 20 de crédito de uso. Invocações a "
            f"US$ {_num(VERCEL_INVOC_M, 2)}/milhão; CPU ativa ≈ US$ 0,128/h (iad1, EUA) e ≈ "
            f"US$ {_num(VERCEL_CPU_H_GRU, 3)}/h (gru1, São Paulo).",
            "AI Gateway da Vercel: sem acréscimo sobre tokens, inclusive com chave própria (BYOK, que exige créditos "
            "comprados); crédito mensal gratuito no plano free; orçamentos por projeto.",
        ]),
        p("WhatsApp Business (opção E)", "h2"),
        *bullets([
            "Desde 01/10/2026 a Meta cobra por <b>mensagem de serviço</b> (resposta dentro da janela de 24 h aberta pelo "
            f"usuário), com <b>{inteiro(WA_GRATIS_SERVICO)} mensagens de serviço gratuitas por mês por número</b> "
            "(fonte oficial Meta). Templates de utilidade dentro da janela também passam a ser cobrados.",
            f"Valor de lista no Brasil: R$ 0,035 por mensagem de serviço em conta faturada em reais (≈ "
            f"{usd(WA_SERVICO_USD, 4)} em conta em dólar). <b>Este valor foi confirmado apenas em fontes secundárias</b>; "
            "a tabela oficial (rate card) da Meta é um arquivo para download e deve ser conferida antes da decisão.",
            "Via Twilio há taxa adicional por mensagem, <b>não verificada</b> nesta revisão. A Cloud API direta da Meta "
            "não tem essa taxa intermediária.",
            "Termos da Meta (desde 15/01/2026) proíbem provedores de IA de oferecer assistente de <b>uso geral</b> como "
            "função principal no WhatsApp Business; uso empresarial com escopo definido continua permitido. Há exceção "
            "atual para números do Brasil e do EEE, sujeita a mudança.",
        ]),
        p("Telegram (opção F)", "h2"),
        *bullets([
            "Bot API gratuita; o bot é criado no @BotFather e ligado ao Worker por webhook (HTTPS, portas 443/80/88/8443).",
            "Limites de envio: cerca de 1 mensagem/s por conversa, 20/min em grupos e 30/s em difusão. Difusão paga "
            "(Telegram Stars) só se aplica a bots com mais de 100 mil usuários ativos mensais.",
        ]),
    ]
    return out


def precos_xai():
    linhas = [["Modelo", "Entrada", "Entrada em cache", "Saída", "Contexto", "Observação"]]
    obs = {
        "grok-4.6": "Recomendado pela xAI para tudo, exceto mídia",
        "grok-4.5": "Geração anterior",
        "grok-4.3": "Mais barato; contexto maior",
        "grok-4.20": "Variantes com e sem raciocínio",
        "grok-build-0.1": "Voltado a código",
    }
    for m, v in XAI.items():
        linhas.append([m, usd(v["entrada"]), usd(v["cache"]), usd(v["saida"]), v["contexto"], obs[m]])
    out = [
        Spacer(1, 4),
        p("3. Quanto custa: preço por token", "h1"),
        p("Preços da xAI em dólares por <b>1 milhão de tokens</b>, para prompts abaixo de 200 mil tokens. Um token "
          "equivale, em média, a cerca de três quartos de uma palavra em inglês; em português, a proporção é um pouco "
          "menor."),
        tabela(linhas, [26 * mm, 22 * mm, 26 * mm, 22 * mm, 18 * mm, 56 * mm], negrito_primeira_col=True),
        p(f"grok-4.6 com prompts a partir de 200 mil tokens: {usd(XAI_46_LONGO['entrada'])} entrada, "
          f"{usd(XAI_46_LONGO['cache'])} cache, {usd(XAI_46_LONGO['saida'])} saída. A Batch API (processamento não "
          "imediato) tem desconto.", "pequeno"),
        Spacer(1, 4),
        p("Ferramentas executadas no servidor da xAI", "h2"),
        tabela([
            ["Ferramenta", "Preço", "Por chamada", "Uso típico no bot"],
            ["web_search, x_search, code_execution", "US$ 5,00 / 1.000", usd(FERRAMENTA_WEB_SEARCH, 4), "Buscar informação atual na web ou no X"],
            ["attachment_search", "US$ 10,00 / 1.000", usd(FERRAMENTA_ATTACHMENT, 4), "Buscar dentro de arquivos anexados"],
            ["collections_search (RAG)", "US$ 2,50 / 1.000", usd(FERRAMENTA_COLLECTIONS, 4), "Responder com base nos documentos da VIA"],
        ], [52 * mm, 30 * mm, 26 * mm, 62 * mm], cab_cor=NAVY_700),
        Spacer(1, 6),
        p("Controle de custo na prática", "h2"),
        *bullets([
            "Cada resposta da xAI informa o custo real da requisição no campo <font face='VIA-Bold'>usage.cost_in_usd_ticks</font>; "
            "o proxy pode somar esse valor e bloquear novas chamadas ao atingir um teto diário ou mensal.",
            "Usar <font face='VIA-Bold'>prompt_cache_key</font> para que o prompt de sistema e o histórico estável sejam "
            f"cobrados como entrada em cache ({usd(XAI['grok-4.6']['cache'])} em vez de {usd(XAI['grok-4.6']['entrada'])} "
            "por milhão no grok-4.6).",
            "Limitar o tamanho das respostas e o número de chamadas de ferramenta por mensagem.",
        ]),
    ]
    return out


def cenarios():
    c46 = custo_tokens("grok-4.6")
    c46c = custo_tokens("grok-4.6", cache=TOK_CACHE)
    c43 = custo_tokens("grok-4.3")
    ws = FERRAMENTA_WEB_SEARCH
    linhas_modelo = [
        ("grok-4.6", c46),
        ("grok-4.6 + web search", c46 + ws),
        (f"grok-4.6 com cache ({inteiro(TOK_CACHE)} tokens)", c46c),
        ("grok-4.3", c43),
        ("grok-4.3 + web search", c43 + ws),
    ]
    cab = ["Modelo e ferramentas", "Por mensagem"] + [f"{inteiro(v)} msg/mês" for v in VOLUMES]
    t1 = [cab]
    for nome, unit in linhas_modelo:
        t1.append([nome, usd(unit, 5)] + [f"{usd(unit * v)}<br/>{brl(unit * v)}" for v in VOLUMES])

    hosp = [["Hospedagem e canal (somar ao custo de tokens)"] + [f"{inteiro(v)} msg/mês" for v in VOLUMES]]
    hosp.append(["Cloudflare Workers Free (até 100 mil req/dia)"] + [usd(0) for _ in VOLUMES])
    hosp.append(["Cloudflare Workers Paid (recomendado)"] + [usd(custo_workers(v)) for v in VOLUMES])
    hosp.append(["Vercel Pro, 1 assento"] + [usd(custo_vercel(v)) for v in VOLUMES])
    hosp.append(["Telegram Bot API"] + [usd(0) for _ in VOLUMES])
    hosp.append(["WhatsApp, mensagens de serviço*"] + [usd(custo_whatsapp(v)) for v in VOLUMES])
    hosp.append(["GitHub Pages (interface)"] + [usd(0) for _ in VOLUMES])

    tot = [["Total mensal estimado"] + [f"{inteiro(v)} msg/mês" for v in VOLUMES]]
    combos = [
        ("Site + Workers Paid + grok-4.6", lambda v: v * c46 + custo_workers(v)),
        ("Site + Workers Paid + grok-4.6 + web search", lambda v: v * (c46 + ws) + custo_workers(v)),
        ("Site + Workers Paid + grok-4.3", lambda v: v * c43 + custo_workers(v)),
        ("Site + Vercel Pro + grok-4.6", lambda v: v * c46 + custo_vercel(v)),
        ("WhatsApp + Workers Paid + grok-4.6*", lambda v: v * c46 + custo_workers(v) + custo_whatsapp(v)),
        ("Telegram + Workers Paid + grok-4.6", lambda v: v * c46 + custo_workers(v)),
    ]
    for nome, f in combos:
        tot.append([nome] + [f"<b>{usd(f(v))}</b><br/>{brl(f(v))}" for v in VOLUMES])

    gh_unit = custo_tokens("grok-4.6", GH_TOK_ENTRADA, GH_TOK_SAIDA)

    out = [
        PageBreak(),
        p("4. Quanto custa: cenários mensais", "h1"),
        caixa([
            p("<b>Premissas.</b> Mensagem típica com "
              f"{inteiro(TOK_ENTRADA)} tokens de entrada (instruções do bot, histórico e pergunta) e "
              f"{inteiro(TOK_SAIDA)} tokens de saída. Web search: 1 chamada por mensagem ({usd(ws, 3)}). "
              f"Linha com cache: {inteiro(TOK_CACHE)} dos {inteiro(TOK_ENTRADA)} tokens de entrada cobrados como cache. "
              f"Conversão: <b>US$\u00a01 = R$\u00a0{_num(TAXA_BRL, 2)}</b> (premissa arredondada, não cotação oficial; impostos "
              "sobre serviços digitais e IOF do cartão não incluídos). Workers: "
              f"{CPU_MS_WORKER} ms de CPU por requisição; Vercel: {CPU_MS_VERCEL} ms de CPU ativa em gru1.", "destaque"),
        ], fundo=WASH, borda=NAVY_700),
        Spacer(1, 6),
        p("Custo de tokens (xAI)", "h2"),
        tabela(t1, [46 * mm, 22 * mm, 34 * mm, 34 * mm, 34 * mm], negrito_primeira_col=True),
        Spacer(1, 6),
        p("Custo de hospedagem e canal", "h2"),
        tabela(hosp, [68 * mm, 34 * mm, 34 * mm, 34 * mm], cab_cor=NAVY_700, negrito_primeira_col=True),
        p(f"* WhatsApp: {inteiro(WA_GRATIS_SERVICO)} mensagens de serviço grátis por mês e {usd(WA_SERVICO_USD, 4)} por "
          "mensagem excedente (valor de fontes secundárias; não inclui taxa de Twilio ou outro intermediário, não "
          "verificada). Considera uma resposta do bot por mensagem do usuário. Na Vercel, o uso estimado "
          f"({usd(uso_vercel(100_000))} em 100 mil mensagens) fica dentro do crédito de US$ 20 do plano Pro.", "pequeno"),
        Spacer(1, 4),
        KeepTogether([
            p("Total mensal (tokens + hospedagem + canal)", "h2"),
            tabela(tot, [68 * mm, 34 * mm, 34 * mm, 34 * mm], cab_cor=GREEN_500, negrito_primeira_col=True),
        ]),
        Spacer(1, 6),
        p("GitHub App (opção B): referência separada", "h2"),
        p(f"Revisões de pull request usam contexto maior. Premissa: {inteiro(GH_EVENTOS)} eventos/mês, "
          f"{inteiro(GH_TOK_ENTRADA)} tokens de entrada e {inteiro(GH_TOK_SAIDA)} de saída cada, com grok-4.6: "
          f"{usd(gh_unit, 3)} por evento, cerca de <b>{usd(gh_unit * GH_EVENTOS)}/mês</b> "
          f"({brl(gh_unit * GH_EVENTOS)}), mais a hospedagem do webhook (Workers Free ou Paid)."),
    ]
    return out


def riscos():
    return [
        Spacer(1, 4),
        p("5. Riscos e conformidade", "h1"),
        p("Dados de saúde e LGPD", "h2"),
        *bullets([
            "Dados de saúde são <b>dados pessoais sensíveis</b> (LGPD, art. 5º, II, e art. 11). O bot <b>não deve receber "
            "nem enviar à xAI dados identificáveis de pacientes</b>: nome, CPF, prontuário, datas, telefone, imagens ou "
            "relatos que permitam identificar alguém.",
            "Avisar na interface, antes do primeiro uso, que o bot é informativo, não faz diagnóstico nem substitui "
            "consulta, e que não se deve digitar dados de pacientes.",
            "O proxy pode aplicar filtro simples (CPF, telefone, e-mail) e recusar a mensagem antes do envio à xAI.",
            "Publicar política de privacidade do bot: o que é registrado, por quanto tempo, e que o processamento ocorre "
            "fora do Brasil (transferência internacional, LGPD art. 33). Configurar retenção curta de registros no AI Gateway.",
            "A conduta ética médica (CFM) também se aplica à comunicação pública de um médico: o bot não deve prometer "
            "resultados nem fazer orientação clínica individual.",
        ]),
        p("HUMAN_GATE", "h2"),
        *bullets([
            "Respostas sobre condutas clínicas, casos individuais ou temas jurídicos devem encaminhar a um humano em vez "
            "de responder.",
            "No GitHub App, o bot comenta e sugere; merge e publicação continuam sendo decisão do mantenedor (AGENTS.md).",
            "Mudanças nas instruções do bot (prompt de sistema) passam por PR revisado, como o restante do site.",
        ]),
        p("Gasto e abuso", "h2"),
        *bullets([
            "Teto de gasto em três camadas: limite de crédito na conta xAI, limitação de requisições no AI Gateway e "
            "contador de <font face='VIA-Bold'>cost_in_usd_ticks</font> no proxy que bloqueia ao atingir o teto.",
            "Limite por visitante (por exemplo, 20 mensagens/hora) e Cloudflare Turnstile contra robôs.",
            "A chave da xAI existe apenas como segredo do servidor; nunca no repositório, que é público.",
        ]),
        p("Plataformas", "h2"),
        *bullets([
            "GitHub Pages: uso institucional e informativo; nada de cobrança ou SaaS hospedado no Pages.",
            "Vercel Hobby: vedado para uso comercial; se a VIA tiver caráter comercial, usar Pro.",
            "WhatsApp: manter o bot com escopo institucional definido (não um assistente de uso geral), cumprir opt-out e "
            "política de mensagens; risco de suspensão do número se os termos forem violados. Recomenda-se um número "
            "dedicado ao bot para não arriscar o número principal.",
        ]),
    ]


def proximos_passos():
    return [
        p("6. Próximos passos", "h1"),
        p("O que depende do mantenedor", "h2"),
        tabela([
            ["#", "Decisão ou ação", "Por que só o mantenedor pode fazer"],
            ["1", "Criar conta na xAI (console.x.ai), cadastrar forma de pagamento, definir limite de crédito e gerar a "
                  "XAI_API_KEY.", "Conta, pagamento e aceite de termos são pessoais."],
            ["2", "Adicionar a chave como segredo: Cursor Dashboard → Cloud Agents → Secrets (nome XAI_API_KEY). O agente "
                  "a transfere para o segredo do Worker sem expô-la.", "Envolve credencial e cobrança."],
            ["3", "Escolher o canal inicial: site (recomendado), Telegram, WhatsApp ou GitHub App.", "Decisão substantiva de produto."],
            ["4", "Definir o teto de gasto mensal (por exemplo, US$ 20) e o escopo do bot (o que responde e o que encaminha).",
             "Decisão de orçamento e de conteúdo."],
            ["5", "Se escolher Cloudflare: criar conta ou autorizar acesso do agente; se WhatsApp: conta Meta Business "
                  "verificada e número dedicado.", "Contas de terceiros e infraestrutura externa (HUMAN_GATE)."],
        ], [8 * mm, 98 * mm, 64 * mm], negrito_primeira_col=True),
        Spacer(1, 6),
        p("O que o agente executa depois das decisões", "h2"),
        *bullets([
            "Worker proxy com a chave como segredo, AI Gateway, limites, filtro de dados pessoais e teto por "
            "<font face='VIA-Bold'>cost_in_usd_ticks</font>.",
            "Módulo de chat no via-hub com aviso de uso, seguindo a identidade visual do site, em PR draft para revisão.",
            "Prompt de sistema com o conteúdo da VIA e regras de encaminhamento humano, versionado no repositório.",
            "Testes com volume pequeno e relatório de custo real antes de abrir ao público.",
            "Expansão para Telegram, WhatsApp ou GitHub App reaproveitando o mesmo núcleo, conforme decisão.",
        ]),
    ]


def fontes():
    itens = [
        "xAI — Models and Pricing: docs.x.ai/developers/pricing (preços por token, ferramentas, cost_in_usd_ticks, cache).",
        "Cloudflare Workers — Pricing: developers.cloudflare.com/workers/platform/pricing.",
        "Cloudflare AI Gateway — Pricing: developers.cloudflare.com/ai-gateway/reference/pricing.",
        "Vercel — Pricing e Fair use: vercel.com/pricing; vercel.com/docs/limits/fair-use-guidelines.",
        "Vercel AI Gateway — Pricing: vercel.com/docs/ai-gateway/pricing.",
        "GitHub Pages — Limits e uso: docs.github.com/pages/getting-started-with-github-pages/github-pages-limits.",
        "GitHub Apps — About creating GitHub Apps: docs.github.com/apps/creating-github-apps.",
        "Meta — Pricing on the WhatsApp Business Platform: developers.facebook.com/documentation/business-messaging/"
        "whatsapp/pricing (cobrança de mensagens de serviço e franquia de 1.000/mês a partir de 01/10/2026).",
        "WhatsApp Business Solution Terms, seção AI Providers: whatsapp.com/legal/business-solution-terms.",
        "Valor R$ 0,035 / US$ 0,0068 por mensagem de serviço no Brasil: fontes secundárias (wizebot.com.br, "
        "clickmassa.com.br) que reproduzem o rate card oficial de 01/10/2026 — conferir no rate card da Meta.",
        "Telegram — Bots FAQ: core.telegram.org/bots/faq (API gratuita, limites de envio).",
        "LGPD — Lei nº 13.709/2018, arts. 5º, 11 e 33.",
    ]
    return [
        Spacer(1, 6),
        p("Fontes consultadas", "h2"),
        *[Paragraph(t, E["pequeno"], bulletText="•") for t in itens],
        Spacer(1, 4),
        p("<b>Não verificado nesta revisão:</b> taxa por mensagem da Twilio para WhatsApp; rate card oficial da Meta em "
          "arquivo (valor em reais obtido de fontes secundárias); cotação do dólar (usada como premissa). Preços mudam; "
          f"revalidar antes de contratar. Preços coletados em {DATA_REVISAO} por agente de IA a partir "
          "de grok/bot/gerar_pdf_opcoes.py.", "pequeno"),
    ]


def main():
    doc = SimpleDocTemplate(
        str(SAIDA),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=16 * mm,
        bottomMargin=20 * mm,
        title="Grok Bot — opções, impacto e custos",
        author="Iniciativa VIA",
        subject="Opções de hospedagem e custo de um bot baseado na API da xAI",
        lang="pt-BR",
    )
    historia = []
    for parte in (capa_e_resumo, opcoes, detalhes_plataformas, precos_xai, cenarios, riscos, proximos_passos, fontes):
        historia.extend(parte())
    doc.build(historia, onFirstPage=rodape, onLaterPages=rodape)
    print(f"PDF gerado: {SAIDA}")


if __name__ == "__main__":
    main()
