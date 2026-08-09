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
  ["cafe-premium", "Frappuccino Grande Caramelo — Starbucks", "Outros", "2490", "real"],
  ["livro-negocios", "Livro A Biografia de Elon Musk — Walter Isaacson", "Outros", "9990", "real"],
  ["fone-premium", "Apple AirPods Max USB-C", "Tecnologia", "659900", "real"],
  ["smartphone-premium", "Apple iPhone 17 Pro Max 1 TB", "Tecnologia", "1849900", "real", true],
  ["notebook-pro", "MacBook Pro 16 polegadas M4 Max, 128 GB e 8 TB", "Tecnologia", "7699900", "real"],
  ["tv-8k", "Samsung Neo QLED 8K QN990F de 98 polegadas", "Tecnologia", "12999900", "estimado"],
  ["estacao-gamer", "PC gamer Alienware Area-51 com RTX 5090 e monitor OLED", "Tecnologia", "8999000", "estimado"],
  ["robo-humanoide", "Robô humanoide Tesla Optimus Gen 3", "Tecnologia", "16500000", "estimado", true],
  ["supercomputador", "Supercomputador NVIDIA DGX SuperPOD com 32 DGX B200", "Tecnologia", "14500000000", "estimado"],
  ["data-center", "Data center Tier III de 20 MW em Barueri (SP)", "Tecnologia", "180000000000", "estimado"],
  ["fabrica-chips", "Fábrica de semicondutores de 2 nm no padrão TSMC", "Tecnologia", "11000000000000", "estimado", true],
  ["carro-eletrico", "Tesla Model S Plaid 2026 importado para o Brasil", "Carros", "125000000", "estimado"],
  ["porsche-911", "Porsche 911 Turbo S 2026", "Carros", "235000000", "real"],
  ["ferrari-sf90", "Ferrari SF90 XX Stradale", "Carros", "850000000", "estimado"],
  ["lamborghini-revuelto", "Lamborghini Revuelto 2026", "Carros", "790000000", "estimado"],
  ["rolls-royce", "Rolls-Royce Phantom Extended Bespoke", "Carros", "720000000", "estimado"],
  ["bugatti", "Bugatti Tourbillon 2026", "Carros", "2500000000", "estimado", true],
  ["mclaren", "McLaren Senna GTR", "Carros", "1350000000", "estimado"],
  ["colecao-classicos", "Coleção com Ferrari 250 GTO, Mercedes 300 SLR e McLaren F1", "Carros", "90000000000", "estimado"],
  ["equipe-f1", "Comprar a equipe Aston Martin Aramco de Fórmula 1", "Carros", "1900000000000", "hipotetico", true],
  ["ap-sp", "Cobertura de 1.000 m² no Cidade Matarazzo, São Paulo", "Imoveis", "12000000000", "estimado"],
  ["mansao-rio", "Mansão de frente para o mar no Joá, Rio de Janeiro", "Imoveis", "8500000000", "estimado"],
  ["cobertura-bc", "Penthouse no One Tower, Balneário Camboriú", "Imoveis", "6500000000", "estimado"],
  ["fazenda-br", "Fazenda de soja de 20 mil hectares em Sorriso (MT)", "Imoveis", "18000000000", "estimado"],
  ["resort-particular", "Resort privativo de 100 villas em Fernando de Noronha", "Imoveis", "150000000000", "hipotetico"],
  ["hotel-5-estrelas", "Hotel Copacabana Palace, em cenário hipotético de aquisição", "Imoveis", "180000000000", "hipotetico"],
  ["arranha-ceu", "Edifício comercial de 50 andares na Avenida Faria Lima", "Imoveis", "350000000000", "estimado", true],
  ["bairro-completo", "Construir um bairro planejado para 50 mil moradores", "Imoveis", "750000000000", "hipotetico", true],
  ["maldivas", "Sete noites na Villa Nautica do Soneva Jani, Maldivas", "Viagens", "9500000", "estimado"],
  ["volta-mundo", "Volta ao mundo Four Seasons Private Jet Experience", "Viagens", "120000000", "estimado"],
  ["expedicao-antartida", "Expedição à Antártida no navio Scenic Eclipse II", "Viagens", "9000000", "estimado"],
  ["cruzeiro-mundial", "Suíte Regent no cruzeiro mundial Seven Seas Splendor", "Viagens", "65000000", "estimado"],
  ["ferias-ano", "Um ano em suítes presidenciais de hotéis Aman", "Viagens", "550000000", "hipotetico"],
  ["viagem-mil-pessoas", "Levar mil pessoas por 15 dias à Disney World", "Viagens", "7500000000", "hipotetico", true],
  ["helicoptero", "Helicóptero Airbus ACH160 Exclusive", "Aviacao", "11500000000", "estimado"],
  ["jato-executivo", "Jato executivo Gulfstream G700", "Aviacao", "52000000000", "estimado", true],
  ["boeing-787", "Boeing 787-9 Dreamliner novo", "Aviacao", "165000000000", "estimado"],
  ["airbus-a380", "Airbus A380 usado convertido em jato particular", "Aviacao", "280000000000", "hipotetico"],
  ["aeroporto-regional", "Construir um aeroporto executivo no padrão Catarina", "Aviacao", "180000000000", "hipotetico"],
  ["companhia-aerea", "Criar uma companhia aérea brasileira com 20 Airbus A320neo", "Aviacao", "650000000000", "hipotetico", true],
  ["lancha", "Lancha Azimut Grande 35 Metri", "Embarcacoes", "8500000000", "estimado"],
  ["veleiro", "Veleiro Royal Huisman Project 410 de 85 metros", "Embarcacoes", "65000000000", "estimado"],
  ["superiate", "Superiate Lürssen Kismet de 122 metros", "Embarcacoes", "220000000000", "estimado", true],
  ["navio-cruzeiro", "Navio de cruzeiro no porte do Icon of the Seas", "Embarcacoes", "1100000000000", "estimado"],
  ["porta-avioes-expo", "Réplica não operacional do porta-aviões USS Enterprise", "Embarcacoes", "650000000000", "ficticio", true, 1],
  ["relogio-raro", "Patek Philippe Grandmaster Chime Ref. 6300A-010", "Luxo", "17000000000", "estimado"],
  ["joia-historica", "Broche Peacock da Graff com diamantes coloridos", "Luxo", "5500000000", "estimado"],
  ["diamante", "Diamante rosa Williamson Pink Star de 11,15 quilates", "Luxo", "32000000000", "estimado"],
  ["vinho-colecao", "Adega com 1.000 garrafas Domaine de la Romanée-Conti", "Luxo", "18000000000", "estimado"],
  ["jantar-chefs", "Banquete para 1.000 pessoas com 100 chefs Michelin", "Luxo", "500000000", "hipotetico"],
  ["obra-famosa", "Salvator Mundi, de Leonardo da Vinci", "Arte e raridades", "250000000000", "estimado", true, 1],
  ["colecao-arte", "Coleção com Picasso, Monet, Van Gogh, Basquiat e Warhol", "Arte e raridades", "600000000000", "estimado"],
  ["instrumento-historico", "Violino Stradivarius Lady Blunt de 1721", "Arte e raridades", "9000000000", "estimado"],
  ["joias-coroa", "Conjunto completo das Joias da Coroa Britânica", "Arte e raridades", "2500000000000", "nao_comercializavel", true, 1],
  ["leao-conservacao", "Financiar por 10 anos o Lion Recovery Fund na África", "Animais e conservacao", "550000000", "hipotetico"],
  ["tigre-resgate", "Manter um centro de resgate para 100 tigres por 10 anos", "Animais e conservacao", "800000000", "hipotetico"],
  ["elefante-santuario", "Construir um santuário de 2 mil hectares para elefantes", "Animais e conservacao", "3500000000", "hipotetico"],
  ["girafa-programa", "Rastrear e proteger 1.000 girafas com a Giraffe Conservation Foundation", "Animais e conservacao", "1200000000", "hipotetico"],
  ["reserva-ecologica", "Criar uma reserva privada de 100 mil hectares na Amazônia", "Animais e conservacao", "50000000000", "hipotetico", true],
  ["distribuir-10k", "Enviar um Pix de R$ 10 mil para 1.000 brasileiros", "Impacto social", "1000000000", "hipotetico"],
  ["bolsas-estudo", "Pagar 10 mil bolsas integrais de Medicina na USP", "Impacto social", "120000000000", "hipotetico"],
  ["construir-escolas", "Construir 100 escolas públicas para 1.000 alunos cada", "Impacto social", "350000000000", "hipotetico"],
  ["construir-hospitais", "Construir 20 hospitais de 200 leitos no padrão Sírio-Libanês", "Impacto social", "2400000000000", "hipotetico", true],
  ["moradias-populares", "Construir 100 mil casas populares de R$ 180 mil", "Impacto social", "1800000000000", "hipotetico"],
  ["saneamento", "Universalizar água e esgoto para uma cidade de 1 milhão de habitantes", "Impacto social", "3500000000000", "hipotetico"],
  ["reflorestamento", "Reflorestar 1 milhão de hectares da Mata Atlântica", "Impacto social", "4500000000000", "hipotetico"],
  ["combater-fome", "Fornecer 1 bilhão de refeições completas a R$ 15 cada", "Impacto social", "1500000000000", "hipotetico"],
  ["pesquisa-medica", "Financiar por 10 anos um instituto brasileiro de pesquisa contra o câncer", "Impacto social", "500000000000", "hipotetico"],
  ["agua-potavel", "Instalar 100 mil poços e sistemas de água potável", "Impacto social", "250000000000", "hipotetico"],
  ["clube-menor", "Comprar 100% da SAF do Botafogo-SP", "Esportes", "15000000000", "estimado"],
  ["clube-grande", "Comprar 100% da SAF do Botafogo de Futebol e Regatas", "Esportes", "150000000000", "hipotetico", true],
  ["estadio", "Construir um estádio de 60 mil lugares no padrão Allianz Arena", "Esportes", "450000000000", "estimado"],
  ["centro-treinamento", "Construir um CT no padrão do Real Madrid City", "Esportes", "75000000000", "estimado"],
  ["direitos-transmissao", "Comprar os direitos globais de uma temporada do Brasileirão", "Esportes", "300000000000", "hipotetico"],
  ["liga-temporada", "Custear uma temporada inteira dos 20 clubes do Brasileirão Série A", "Esportes", "550000000000", "hipotetico"],
  ["copa-particular", "Organizar uma Copa do Mundo privada com 48 seleções", "Esportes", "9000000000000", "ficticio", true],
  ["voo-suborbital", "Assento em voo suborbital da Virgin Galactic", "Espaco", "330000000", "estimado"],
  ["viagem-orbital", "Missão orbital privada de 10 dias com a Axiom Space", "Espaco", "33000000000", "estimado"],
  ["missao-lunar", "Missão tripulada privada de sobrevoo lunar com a SpaceX", "Espaco", "1000000000000", "hipotetico", true],
  ["base-lua", "Construir uma base lunar para 20 astronautas", "Espaco", "55000000000000", "hipotetico", true],
  ["missao-marte", "Financiar a primeira missão humana de ida e volta a Marte", "Espaco", "110000000000000", "hipotetico", true],
  ["estacao-espacial", "Construir uma estação espacial no porte da ISS", "Espaco", "82500000000000", "hipotetico"],
  ["telescopio-espacial", "Construir e lançar um telescópio no porte do James Webb", "Espaco", "5500000000000", "estimado"],
  ["programa-espacial", "Financiar por 10 anos um programa espacial no porte da NASA", "Espaco", "137500000000000", "hipotetico", true],
  ["ponte-gigante", "Construir uma ponte Rio–Niterói paralela com 13 km", "Infraestrutura", "2500000000000", "hipotetico"],
  ["metro-cidade", "Construir 25 km de metrô subterrâneo em São Paulo", "Infraestrutura", "1250000000000", "estimado"],
  ["usina-solar", "Construir um complexo solar de 1 GW no Nordeste", "Infraestrutura", "350000000000", "estimado"],
  ["rede-satelites", "Lançar uma constelação de 3 mil satélites de internet", "Infraestrutura", "16500000000000", "hipotetico", true],
  ["ilha", "Ilha Rangyai, de 44 hectares, na Tailândia", "Projetos extravagantes", "8800000000", "estimado"],
  ["cidade-ficticia", "Construir uma cidade futurista para 1 milhão de habitantes", "Projetos extravagantes", "110000000000000", "ficticio", true],
  ["pais-ficticio", "Comprar o país fictício de San Escobar", "Projetos extravagantes", "500000000000000", "ficticio", true, 1],
  ["monumento", "Construir uma réplica em escala real do Coliseu de Roma", "Projetos extravagantes", "500000000000", "hipotetico"],
  ["minuto-internet", "Comprar toda a publicidade digital mundial por um minuto", "Projetos extravagantes", "22000000000", "ficticio"],
  ["maravilha-mundo", "Reconstruir a Grande Pirâmide de Gizé com técnicas modernas", "Projetos extravagantes", "280000000000", "hipotetico"],
];

export const CATALOG_VERSION_ID = "catalog-v2-specific-items";

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