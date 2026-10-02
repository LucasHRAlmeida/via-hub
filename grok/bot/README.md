# Grok Bot — documento de opções

`opcoes-grok-bot.pdf` compara onde hospedar um bot baseado na API da xAI (Grok), para que serve cada opção, o impacto esperado (escala de 1 a 5) e o custo por token e por cenário mensal.

A fonte canônica é `gerar_pdf_opcoes.py`. Preços, premissas (tokens por mensagem, taxa de câmbio, volumes) e textos ficam nas constantes e funções do script; o PDF não deve ser editado à mão.

## Regenerar

```bash
python3 -m pip install --user reportlab
python3 grok/bot/gerar_pdf_opcoes.py
```

Requer as fontes DejaVu (`/usr/share/fonts/truetype/dejavu`, pacote `fonts-dejavu-core`) para a acentuação.

Os preços foram coletados em 02/10/2026 e devem ser revalidados antes de qualquer contratação.
