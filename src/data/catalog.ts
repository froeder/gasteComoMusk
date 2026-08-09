import type { CatalogCategory, CatalogImage, CatalogItem, EstimateType } from "@/src/types";

type ItemSeed = [
  id: string,
  name: string,
  category: CatalogCategory,
  priceCents: string,
  estimateType: EstimateType,
  featured?: boolean,
  maxQuantity?: number,
];

const categoryNotes: Record<CatalogCategory, string> = {
  Tecnologia: "Estimativa baseada em precos publicos de varejo, infraestrutura e projetos empresariais.",
  Carros: "Estimativa baseada em precos de mercado, configuracoes premium e colecoes hipoteticas.",
  Imoveis: "Estimativa baseada em valores de mercado e cenarios imobiliarios de alto padrao.",
  Viagens: "Estimativa hipotetica para experiencias premium, logistica e hospedagem.",
  Aviacao: "Estimativa baseada em faixas publicas de aeronaves e custos de operacao.",
  Embarcacoes: "Estimativa baseada em embarcacoes novas, personalizadas ou cenarios ficticios.",
  Luxo: "Estimativa baseada em itens raros, leiloes e bens de colecao.",
  "Arte e raridades": "Estimativa inspirada em leiloes historicos e itens nao necessariamente comercializaveis.",
  "Animais e conservacao": "Custo hipotetico de conservacao legal, resgate, manutencao e patrocinio.",
  "Impacto social": "Estimativa hipotetica de impacto, sem prometer custo factual definitivo.",
  Esportes: "Estimativa baseada em ativos esportivos, operacao e direitos de midia.",
  Espaco: "Estimativa baseada em missoes espaciais, infraestrutura e programas de longo prazo.",
  Infraestrutura: "Estimativa de projetos empresariais e obras de grande escala.",
  "Projetos extravagantes": "Cenario propositalmente absurdo ou ficticio para dar escala a fortuna.",
  Outros: "Estimativa ludica para comparacao de escala.",
};

const categoryColors: Record<CatalogCategory, string> = {
  Tecnologia: "#62f58b",
  Carros: "#f7c948",
  Imoveis: "#76e4f7",
  Viagens: "#ff9f6e",
  Aviacao: "#a78bfa",
  Embarcacoes: "#38bdf8",
  Luxo: "#f0abfc",
  "Arte e raridades": "#fb7185",
  "Animais e conservacao": "#86efac",
  "Impacto social": "#fef08a",
  Esportes: "#93c5fd",
  Espaco: "#c4b5fd",
  Infraestrutura: "#5eead4",
  "Projetos extravagantes": "#fda4af",
  Outros: "#d1d5db",
};

function imageFor(itemId: string, itemName: string): CatalogImage {
  return {
    uri: `asset://catalog/${itemId}.png`,
    author: "Equipe Gaste como Musk",
    source: "Imagem original local gerada no projeto",
    license: "Uso interno do projeto",
    alt: `Ilustracao original para ${itemName}`,
  };
}

const seeds: ItemSeed[] = [
  ["cafe-premium", "Cafe premium", "Outros", "1800", "real"],
  ["livro-negocios", "Livro de negocios", "Outros", "8900", "real"],
  ["fone-premium", "Fone premium", "Tecnologia", "249900", "real"],
  ["smartphone-premium", "Smartphone premium", "Tecnologia", "899900", "real", true],
  ["notebook-pro", "Notebook profissional", "Tecnologia", "2499900", "real"],
  ["tv-8k", "Televisao 8K gigante", "Tecnologia", "5999900", "estimado"],
  ["estacao-gamer", "Setup gamer absurdo", "Tecnologia", "12000000", "estimado"],
  ["robo-humanoide", "Robo humanoide", "Tecnologia", "65000000", "estimado", true],
  ["supercomputador", "Supercomputador academico", "Tecnologia", "35000000000", "estimado"],
  ["data-center", "Data center regional", "Tecnologia", "150000000000", "estimado"],
  ["fabrica-chips", "Fabrica de chips avancados", "Tecnologia", "8000000000000", "estimado", true],
  ["carro-eletrico", "Sedan eletrico premium", "Carros", "65000000", "real"],
  ["porsche-911", "Porsche 911", "Carros", "120000000", "real"],
  ["ferrari-sf90", "Ferrari SF90", "Carros", "550000000", "estimado"],
  ["lamborghini-revuelto", "Lamborghini Revuelto", "Carros", "800000000", "estimado"],
  ["rolls-royce", "Rolls-Royce sob medida", "Carros", "650000000", "estimado"],
  ["bugatti", "Bugatti de colecao", "Carros", "3000000000", "estimado", true],
  ["mclaren", "McLaren de pista", "Carros", "450000000", "estimado"],
  ["colecao-classicos", "Colecao de carros classicos", "Carros", "10000000000", "estimado"],
  ["equipe-f1", "Equipe completa de Formula 1", "Carros", "600000000000", "hipotetico", true],
  ["ap-sp", "Apartamento de luxo em Sao Paulo", "Imoveis", "2500000000", "estimado"],
  ["mansao-rio", "Mansao no Rio de Janeiro", "Imoveis", "8000000000", "estimado"],
  ["cobertura-bc", "Cobertura em Balneario Camboriu", "Imoveis", "6000000000", "estimado"],
  ["fazenda-br", "Fazenda brasileira gigante", "Imoveis", "12000000000", "estimado"],
  ["resort-particular", "Resort particular", "Imoveis", "90000000000", "hipotetico"],
  ["hotel-5-estrelas", "Hotel cinco estrelas", "Imoveis", "45000000000", "estimado"],
  ["arranha-ceu", "Arranha-ceu comercial", "Imoveis", "180000000000", "estimado", true],
  ["bairro-completo", "Bairro residencial completo", "Imoveis", "2500000000000", "hipotetico", true],
  ["maldivas", "Viagem para as Maldivas", "Viagens", "18000000", "estimado"],
  ["volta-mundo", "Volta ao mundo em classe executiva", "Viagens", "55000000", "estimado"],
  ["expedicao-antartida", "Expedicao a Antartida", "Viagens", "120000000", "estimado"],
  ["cruzeiro-mundial", "Cruzeiro mundial", "Viagens", "75000000", "estimado"],
  ["ferias-ano", "Ferias de luxo por um ano", "Viagens", "200000000", "hipotetico"],
  ["viagem-mil-pessoas", "Viagem para mil pessoas", "Viagens", "50000000000", "hipotetico", true],
  ["helicoptero", "Helicoptero executivo", "Aviacao", "5000000000", "estimado"],
  ["jato-executivo", "Jato executivo", "Aviacao", "30000000000", "estimado", true],
  ["boeing-787", "Boeing 787", "Aviacao", "150000000000", "estimado"],
  ["airbus-a380", "Airbus A380", "Aviacao", "220000000000", "estimado"],
  ["aeroporto-regional", "Aeroporto regional privado", "Aviacao", "900000000000", "hipotetico"],
  ["companhia-aerea", "Companhia aerea de nicho", "Aviacao", "4500000000000", "hipotetico", true],
  ["lancha", "Lancha esportiva", "Embarcacoes", "800000000", "estimado"],
  ["veleiro", "Veleiro oceanico", "Embarcacoes", "3500000000", "estimado"],
  ["superiate", "Superiate personalizado", "Embarcacoes", "250000000000", "estimado", true],
  ["navio-cruzeiro", "Navio de cruzeiro", "Embarcacoes", "500000000000", "estimado"],
  ["porta-avioes-expo", "Porta-avioes ficticio para exposicao", "Embarcacoes", "6500000000000", "ficticio", true, 1],
  ["relogio-raro", "Relogio raro", "Luxo", "1200000000", "estimado"],
  ["joia-historica", "Joia historica", "Luxo", "4000000000", "hipotetico"],
  ["diamante", "Diamante raro", "Luxo", "18000000000", "estimado"],
  ["vinho-colecao", "Adega de vinhos raros", "Luxo", "2500000000", "estimado"],
  ["jantar-chefs", "Jantar com cem chefs estrelados", "Luxo", "300000000", "hipotetico"],
  ["obra-famosa", "Obra de arte famosa", "Arte e raridades", "90000000000", "estimado", true, 1],
  ["colecao-arte", "Colecao de arte", "Arte e raridades", "500000000000", "estimado"],
  ["instrumento-historico", "Instrumento musical historico", "Arte e raridades", "7000000000", "estimado"],
  ["joias-coroa", "Joias da Coroa Britanica", "Arte e raridades", "2000000000000", "nao_comercializavel", true, 1],
  ["leao-conservacao", "Patrocinar conservacao de leoes", "Animais e conservacao", "250000000", "hipotetico"],
  ["tigre-resgate", "Resgate e conservacao de tigres", "Animais e conservacao", "400000000", "hipotetico"],
  ["elefante-santuario", "Santuario para elefantes", "Animais e conservacao", "2500000000", "hipotetico"],
  ["girafa-programa", "Programa de conservacao de girafas", "Animais e conservacao", "800000000", "hipotetico"],
  ["reserva-ecologica", "Reserva ecologica protegida", "Animais e conservacao", "40000000000", "hipotetico", true],
  ["distribuir-10k", "Distribuir R$ 10 mil para mil pessoas", "Impacto social", "1000000000", "hipotetico"],
  ["bolsas-estudo", "Financiar dez mil bolsas de estudo", "Impacto social", "120000000000", "hipotetico"],
  ["construir-escolas", "Construir cem escolas", "Impacto social", "250000000000", "hipotetico"],
  ["construir-hospitais", "Construir vinte hospitais", "Impacto social", "400000000000", "hipotetico", true],
  ["moradias-populares", "Financiar moradias populares", "Impacto social", "1000000000000", "hipotetico"],
  ["saneamento", "Projeto amplo de saneamento", "Impacto social", "1500000000000", "hipotetico"],
  ["reflorestamento", "Reflorestar uma area gigante", "Impacto social", "350000000000", "hipotetico"],
  ["combater-fome", "Combater a fome por um periodo", "Impacto social", "2500000000000", "hipotetico"],
  ["pesquisa-medica", "Financiar pesquisa medica", "Impacto social", "800000000000", "hipotetico"],
  ["agua-potavel", "Fornecer agua potavel", "Impacto social", "600000000000", "hipotetico"],
  ["clube-menor", "Clube brasileiro de menor porte", "Esportes", "7000000000", "estimado"],
  ["clube-grande", "Clube brasileiro de grande porte", "Esportes", "250000000000", "estimado", true],
  ["estadio", "Estadio moderno", "Esportes", "150000000000", "estimado"],
  ["centro-treinamento", "Centro de treinamento elite", "Esportes", "30000000000", "estimado"],
  ["direitos-transmissao", "Direitos de transmissao esportiva", "Esportes", "900000000000", "hipotetico"],
  ["liga-temporada", "Temporada completa de uma liga", "Esportes", "1800000000000", "hipotetico"],
  ["copa-particular", "Copa do Mundo particular ficticia", "Esportes", "7000000000000", "ficticio", true],
  ["voo-suborbital", "Voo suborbital", "Espaco", "2500000000", "estimado"],
  ["viagem-orbital", "Viagem orbital", "Espaco", "28000000000", "estimado"],
  ["missao-lunar", "Missao lunar", "Espaco", "5000000000000", "hipotetico", true],
  ["base-lua", "Base na Lua", "Espaco", "40000000000000", "hipotetico", true],
  ["missao-marte", "Missao para Marte", "Espaco", "85000000000000", "hipotetico", true],
  ["estacao-espacial", "Estacao espacial", "Espaco", "60000000000000", "hipotetico"],
  ["telescopio-espacial", "Telescopio espacial", "Espaco", "5500000000000", "estimado"],
  ["programa-espacial", "Programa espacial de dez anos", "Espaco", "150000000000000", "hipotetico", true],
  ["ponte-gigante", "Ponte monumental", "Infraestrutura", "1200000000000", "hipotetico"],
  ["metro-cidade", "Linha completa de metro", "Infraestrutura", "2200000000000", "estimado"],
  ["usina-solar", "Complexo de energia solar", "Infraestrutura", "750000000000", "estimado"],
  ["rede-satelites", "Rede de satelites", "Infraestrutura", "12000000000000", "hipotetico", true],
  ["ilha", "Ilha particular", "Projetos extravagantes", "30000000000", "estimado"],
  ["cidade-ficticia", "Cidade futurista ficticia", "Projetos extravagantes", "50000000000000", "ficticio", true],
  ["pais-ficticio", "Pais ficticio", "Projetos extravagantes", "500000000000000", "ficticio", true, 1],
  ["monumento", "Reconstruir um monumento", "Projetos extravagantes", "4500000000000", "hipotetico"],
  ["minuto-internet", "Um minuto da internet mundial", "Projetos extravagantes", "1000000000000", "ficticio"],
  ["maravilha-mundo", "Reconstruir uma maravilha do mundo", "Projetos extravagantes", "9000000000000", "hipotetico"],
];

export const CATALOG_VERSION_ID = "catalog-v1";

export const catalogItems: CatalogItem[] = seeds.map(
  ([id, name, category, priceCents, estimateType, featured = false, maxQuantity], index) => ({
    id,
    name,
    shortDescription: `${name} em uma simulacao de gasto com escala bilionaria.`,
    detailedDescription:
      estimateType === "ficticio" || estimateType === "nao_comercializavel"
        ? `${name} e um item ludico para comparacao de escala. Ele nao representa uma oferta real de compra.`
        : `${name} usa uma estimativa plausivel para fins de jogo. Valores variam por mercado, impostos, configuracao e disponibilidade.`,
    priceCents,
    category,
    image: imageFor(id, name),
    priceSource: categoryNotes[category],
    priceReferenceDate: "2026-08-09",
    estimateType,
    tags: [category.toLowerCase(), estimateType, featured ? "destaque" : "catalogo"],
    maxQuantity,
    featured,
    active: true,
    order: index + 1,
    curiosity: `Mesmo este item ajuda a visualizar como numeros extremos mudam a percepcao de escala.`,
    impactEquivalent:
      category === "Impacto social"
        ? "Estimativa hipotetica de impacto social, sem equivaler a uma solucao garantida."
        : undefined,
  }),
);

export const catalogCategories = Array.from(new Set(catalogItems.map((item) => item.category)));

export function getCategoryColor(category: CatalogCategory): string {
  return categoryColors[category];
}

export function findCatalogItem(id: string): CatalogItem | undefined {
  return catalogItems.find((item) => item.id === id);
}
