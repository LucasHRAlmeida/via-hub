export const APP_VERSION = "1.0.0";
export const DOMAINS = [
  { key: "sono", title: "Sono", question: "Como tem sido o seu descanso?", note: "Sua percepção é suficiente. Não é preciso medir nem justificar.", options: ["Tenho me sentido bem", "Tem variado de um dia para outro", "Não tem sido reparador", "Prefiro não responder"] },
  { key: "movimento", title: "Movimento", question: "O movimento encontrou espaço nos seus dias?", note: "Vale o que faz sentido na sua rotina, sem comparação com a de ninguém.", options: ["Tem feito parte dos meus dias", "Aconteceu de vez em quando", "Quase não encontrou espaço", "Prefiro não responder"] },
  { key: "alimentacao", title: "Alimentação", question: "Como você percebe sua relação com a alimentação?", note: "Não há resposta certa. Aqui não se contam calorias nem se atribuem notas.", options: ["Tenho me sentido bem", "Tenho vivido dias variados", "Tem sido uma dificuldade", "Prefiro não responder"] },
  { key: "emocional", title: "Bem-estar emocional", question: "Como tem sido estar com você?", note: "Você decide o que deseja compartilhar, inclusive quando prefere não dizer.", options: ["Tenho me sentido bem", "Tenho vivido dias variados", "Os dias têm sido difíceis", "Prefiro não responder"] },
  { key: "contexto", title: "Contexto de vida", question: "Há algo do seu contexto que gostaria de levar à conversa?", note: "Trabalho, vínculos e território também fazem parte da vida. Nenhum detalhe pessoal é solicitado.", options: ["Sim, gostaria de conversar", "Talvez, mais adiante", "Não neste momento", "Prefiro não responder"] },
];
export const INTENTIONS = {
  pausa: { label: "Fazer uma pausa", title: "Não é preciso começar por uma tarefa.", description: "Uma escuta, uma leitura ou apenas um intervalo. Você escolhe o ritmo.", playlist: "3bH51KAKMfv9hibkmvYIoP", playlistName: "Relaxamento", links: ["parar", "musica", "revista"] },
  clareza: { label: "Organizar uma ideia", title: "Dar forma também é uma maneira de cuidar.", description: "Uma percepção pode virar conversa. Uma narrativa pode ganhar estrutura, sem perder a origem.", playlist: "6v8PijpdMXcUwQ0aTalRF7", playlistName: "Foco suave", links: ["evidencia", "evam", "hub"] },
  mundo: { label: "Olhar ao redor", title: "Ninguém chega sem um mundo em volta.", description: "O território muda, a informação envelhece e as perguntas precisam acompanhar a vida.", playlist: "6o1gQY8sOOCKhg93XALRCt", playlistName: "Energia calma", links: ["revista", "regulacao", "youtube"] },
};
export const LINKS = {
  parar: { label: "Parar.", tag: "Leitura · Revista VIA", text: "Um ensaio para fazer companhia ao intervalo.", url: "https://iniciativa-via.com/via-hub/revista/especial-2026-10-04.html" },
  musica: { label: "Cinco intenções de escuta", tag: "Música · Sala VIA", text: "Relaxamento, foco, energia calma, transição e sono.", url: "https://iniciativa-via.com/playlists/" },
  revista: { label: "Saúde na Última Semana", tag: "Revista · VIA", text: "Acompanhar o que muda, com contexto editorial.", url: "https://iniciativa-via.com/via-hub/revista/" },
  evidencia: { label: "Quanto saber antes de agir?", tag: "Instrumento · Evidência", text: "Explorar a Escala Móvel de Evidência e seus limites.", url: "https://iniciativa-via.com/via-hub/escala-movel-evidencia/" },
  evam: { label: "Da narrativa à estrutura", tag: "Conversor · EVAM", text: "Abrir o conversor canônico, com revisão humana.", url: "https://iniciativa-via.com/via-hub/regulacao-federal-ia/evam/" },
  hub: { label: "A mesa de trabalho da VIA", tag: "Projetos · Hub", text: "Método, ferramentas e conhecimento versionado.", url: "https://iniciativa-via.com/via-hub/" },
  regulacao: { label: "Necessidade, capacidade e tempo", tag: "Sistemas · Regulação", text: "Uma investigação sobre a arquitetura da decisão.", url: "https://iniciativa-via.com/via-hub/regulacao-federal-ia/" },
  youtube: { label: "A VIA em voz e imagem", tag: "Vídeo · YouTube", text: "Conversas e percursos no canal de Lucas HR.", url: "https://www.youtube.com/@drlucashr" },
};
export const STATES = { AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins" };
export const normalize = value => String(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
export function perceptionEnvelope(answers, id, now = new Date().toISOString()) {
  return {
    resourceType: "VIASelfReportDemo", version: APP_VERSION, synthetic: true, id, recorded: now,
    status: "SELF_REPORT_NOT_CLINICALLY_INTERPRETED",
    fields: Object.fromEntries(DOMAINS.map(d => [d.key, { value: answers[d.key]?.value ?? null, origin: "autorrelato demonstrativo", recorded: answers[d.key]?.recorded ?? now, interpretation: null }])),
    governance: { diagnosis: false, riskScore: false, clinicalRecommendation: false, clinicalValidation: false, storage: "memória da sessão", externalTransmission: false },
  };
}
