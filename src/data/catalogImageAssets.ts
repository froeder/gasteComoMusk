import type { ImageSource } from "expo-image";

type CatalogImageSource = {
  file?: string;
  uri?: string;
  sourcePage?: string;
  match: "exact" | "illustrative";
};

const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%2F/g, "/")}`;

const commonsImage = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=1200`;

/**
 * Fontes visuais pesquisadas para o catálogo.
 * `exact` indica o produto/local/obra exato; `illustrative` indica uma foto real
 * equivalente para um projeto hipotético ou um modelo sem acervo aberto adequado.
 */
export const catalogImageSources: Record<string, CatalogImageSource> = {
  "cafe-premium": { file: "Starbucks - Coffee Frappuccino (51259869202).jpg", match: "exact" },
  "livro-negocios": {
    uri: "https://target.scene7.com/is/image/Target/GUEST_45e245a7-1821-4808-ada9-659312155207",
    sourcePage: "https://www.target.com/p/-/A-88683072",
    match: "exact",
  },
  "fone-premium": { file: "Apple airpods max with case.jpg", match: "exact" },
  "smartphone-premium": { file: "Silver iPhone 17 Pro Max.jpg", match: "exact" },
  "notebook-pro": { file: "MacBook Pro (16-inch, M4 Pro, Silver).jpg", match: "exact" },
  "tv-8k": {
    uri: "https://img.pchome.com.tw/cs/items/DPADG3A900J0A30/000001_1751619070.jpg",
    sourcePage: "https://24h.pchome.com.tw/prod/DPADG3-A900J0A30",
    match: "illustrative",
  },
  "estacao-gamer": { file: "Gaming PC-Setup - Astaroth- The Completed System.jpg", match: "illustrative" },
  "robo-humanoide": { file: "Latest Tesla Optimus Humanoid Robot.jpg", match: "exact" },
  "supercomputador": {
    uri: "https://www.nvidia.com/content/dam/en-zz/Solutions/data-center/dgx-superpod-gb200/dgx-superpod-with-dgx-gb200-systems-og-1200x630.jpg",
    sourcePage: "https://www.nvidia.com/pt-br/data-center/dgx-gb200/",
    match: "exact",
  },
  "data-center": { file: "Datacenter Server Racks (22370909788).jpg", match: "illustrative" },
  "fabrica-chips": { file: "TSMC Fab5.JPG", match: "exact" },
  "carro-eletrico": { file: "Tesla Model S Plaid Autofrühling Ulm IMG 9321.jpg", match: "exact" },
  "porsche-911": { file: "Porsche 911 Turbo S Exclusive Series IMG 3750.jpg", match: "exact" },
  "ferrari-sf90": { file: "Ferrari SF90 XX Stradale 2.jpg", match: "exact" },
  "lamborghini-revuelto": { file: "Lamborghini Revuelto DSC 6987.jpg", match: "exact" },
  "rolls-royce": { file: "Rolls-Royce Phantom Extended VIII Dark Emerald (1).jpg", match: "exact" },
  bugatti: { file: "Bugatti Tourbillon.jpg", match: "exact" },
  mclaren: { file: "McLaren Senna GTR, GIMS 2018, Le Grand-Saconnex (1X7A0442).jpg", match: "exact" },
  "colecao-classicos": { file: "Ferrari 250 GTO Replica.jpg", match: "illustrative" },
  "equipe-f1": { file: "Aston Martin AMR22.jpg", match: "exact" },
  "ap-sp": { file: "Cidade Matarazzo Triplex, Rosewood São Paulo 2.jpg", match: "exact" },
  "mansao-rio": { file: "Joá, Rio de Janeiro - State of Rio de Janeiro, Brazil - panoramio.jpg", match: "illustrative" },
  "cobertura-bc": { file: "One-tower-bc.jpg", match: "exact" },
  "fazenda-br": { file: "Soja Tangará.jpg", match: "illustrative" },
  "resort-particular": { file: "Praia do Sancho, Noronha.JPG", match: "illustrative" },
  "hotel-5-estrelas": { file: "Hotel Copacabana Palace, Rio de Janeiro.jpg", match: "exact" },
  "arranha-ceu": { file: "Avenida Faria Lima, São Paulo (03).jpg", match: "illustrative" },
  "bairro-completo": { file: "Brasilia aerea eixo monumental.jpg", match: "illustrative" },
  maldivas: { file: "Diamonds Thudufushi Beach and Water Villas, May 2017 -04.jpg", match: "illustrative" },
  "volta-mundo": {
    uri: "https://static.standard.co.uk/s3fs-public/thumbnails/image/2019/07/22/11/jtt-233-aspect16x9.jpg?width=1200",
    sourcePage: "https://www.standard.co.uk/lifestyle/living/four-seasons-unveils-four-new-around-the-world-private-jet-trip-itineraries-a4195756.html",
    match: "exact",
  },
  "expedicao-antartida": { file: "ECLIPSE ANTARCTICA.jpg", match: "exact" },
  "cruzeiro-mundial": { file: "Avitak Seven Seas Splendor and Sky Princess at Tallinn Cruise Terminal in Port of Tallinn 13 July 2023.jpg", match: "exact" },
  "ferias-ano": { file: "Reception lounge at Amantaka luxury Resort & Hotel at blue hour in Luang Prabang Laos.jpg", match: "exact" },
  "viagem-mil-pessoas": { file: "Cinderella Castle, Magic Kingdom Walt Disney World (2024).jpg", match: "exact" },
  helicoptero: { file: "Airbus Helicopters H160 (cropped).jpg", match: "exact" },
  "jato-executivo": { file: "Gulfstream G700 at the Dubai Airshow 2023.jpg", match: "exact" },
  "boeing-787": { file: "N1015X Air Tahiti Nui Boeing 787-9 Dreamliner 26.jpg", match: "exact" },
  "airbus-a380": { file: "Emirates Airbus A380-861 A6-EER MUC 2015 01.jpg", match: "exact" },
  "aeroporto-regional": { file: "Inauguração do Aeroporto Catarina (49228466988).jpg", match: "exact" },
  "companhia-aerea": { file: "Frontier Airbus A320neo N362FR BWI MD1.jpg", match: "illustrative" },
  lancha: {
    uri: "https://img.drivemag.net/media/default/0001/44/azimut-grande-35m-1-9620.jpeg",
    sourcePage: "https://boats.drivemag.com/news/azimut-grande-35m-is-the-latest-superyacht-from-the-italian-builder/",
    match: "exact",
  },
  veleiro: { file: "Vollenhove Netherlands Royal-Huisman-shipyard-01.jpg", match: "illustrative" },
  superiate: {
    uri: "https://media.revistagq.com/photos/68889a45c1ed8194a94d0b72/master/w_1600%2Cc_limit/Kismet%2520%28L%25C3%25BCrssen%2C%2520122%25E2%2580%25AFm%29.jpg",
    sourcePage: "https://www.revistagq.com/articulo/los-mejores-yates-de-lujo-de-2025",
    match: "exact",
  },
  "navio-cruzeiro": { file: "Icon of the Seas (kahunapulej).jpg", match: "exact" },
  "porta-avioes-expo": { file: "US Navy 040229-N-7097H-006 Sailors aboard the nuclear powered aircraft carrier USS Enterprise (CVN 65).jpg", match: "exact" },
  "relogio-raro": {
    uri: "https://masterhorologer.com/wp-content/uploads/2016/03/d27ca-patek2bphilippe2bgrandmaster2bchime2bref-2b6300-4.jpg",
    sourcePage: "https://masterhorologer.com/2016/03/28/patek-philippe-grandmaster-chime-ref-6300-grand-complication-watch-white-gold-case-manual-wound-mechanical-movement-grande-and-petite-sonnerie-minute-repeater-alarm-with-time-strike-date-repeater-seco/",
    match: "exact",
  },
  "joia-historica": {
    uri: "https://www.thejewelleryeditor.com/media/images_thumbnails/filer_public_thumbnails/filer_public/4e/8c/4e8c5d8a-2eaa-4d7c-9e6f-945cd6582ff7/graffpeacockbrooch.jpg__1536x0_q75_crop-scale_subsampling-2_upscale-false.jpg",
    sourcePage: "https://www.thejewelleryeditor.com/jewellery/article/this-summer-sees-exceptional-graff-diamonds-pieces-on-display-at-the-monaco-rare-jewels-exhibition/",
    match: "exact",
  },
  diamante: {
    uri: "https://pic.yupoo.com/fotomag/e9ad4c7c/759d4d23.jpg",
    sourcePage: "https://www.showfay.com/The-Auction-11-15ct-cushion-colored-pink-diamond-Williamson-Pink-Star-sold-for-HK-453-million-setting-a-new-single-carat-auction-record-for-natural-gemstones-a699255.html",
    match: "exact",
  },
  "vinho-colecao": { file: "Grands-échezeaux.JPG", match: "illustrative" },
  "jantar-chefs": { file: "Open kitchen with young chef and two waitress at Hong Kong style restaurant.jpg", match: "illustrative" },
  "obra-famosa": { file: "Leonardo da Vinci, Salvator Mundi, c.1500, oil on walnut, 45.4 × 65.6 cm.jpg", match: "exact" },
  "colecao-arte": { file: "Krakow 2024 138 National Museum Modern Art - Blessing Food.jpg", match: "illustrative" },
  "instrumento-historico": { file: "Lady Blunt top.jpg", match: "exact" },
  "joias-coroa": { file: "Crown Jewels of the United Kingdom 1952-12-13.jpg", match: "exact" },
  "leao-conservacao": { file: "Lion conservation at working with wildlife.jpg", match: "illustrative" },
  "tigre-resgate": { file: "Moka, rescued at the border, found his forever home at Lions, Tigers, and Bears Sanctuary (28712668877).jpg", match: "illustrative" },
  "elefante-santuario": {
    uri: "https://www.elephantnaturepark.org/wp-content/uploads/2025/11/Overnight_Visit_ENP.jpg",
    sourcePage: "https://www.elephantnaturepark.org/",
    match: "illustrative",
  },
  "girafa-programa": { file: "042 Masai giraffe in the Serengeti National Park Photo by Giles Laurent.jpg", match: "illustrative" },
  "reserva-ecologica": { file: "Aerial view of the Amazon Rainforest.jpg", match: "illustrative" },
  "distribuir-10k": { file: "Mobile Payment.jpg", match: "illustrative" },
  "bolsas-estudo": { file: "Werner Haberkorn - Vista parcial da Faculdade de Medicina da Universidade de São Paulo. São Paulo-SP.jpg", match: "exact" },
  "construir-escolas": { file: "4th CAG visits local school in Brazil 151117-M-WQ543-039.jpg", match: "illustrative" },
  "construir-hospitais": { file: "Santa Catarina Hospital, Avenida Paulista, São Paulo, Brazil.jpg", match: "illustrative" },
  "moradias-populares": { file: "Minha Casa Minha Vida em Hortolândia SP.jpg", match: "illustrative" },
  saneamento: { file: "The Minister of State for Drinking Water & Sanitation, Shri Ram Kripal Yadav visiting a Water Treatment Plant, at Killa, in Gomati District of Tripura on January 29, 2016.jpg", match: "illustrative" },
  reflorestamento: { file: "Instituto Terra 1, Aymorés-MG.jpg", match: "illustrative" },
  "combater-fome": { file: "WVS Hot Meals Service- Wartime Food Distribution, Birkenhead, Cheshire, 1942 D10280.jpg", match: "illustrative" },
  "pesquisa-medica": { file: "Immunology laboratory at the central cancer research labs.jpg", match: "illustrative" },
  "agua-potavel": { file: "Home well.jpg", match: "illustrative" },
  "clube-menor": { file: "Cadeira Cativa Estádio Santa Cruz.JPG", match: "exact" },
  "clube-grande": { file: "Estádio Olímpico Nilton Santos, Clube Botafogo de Futebol e Regatas (Acesso Norte).jpg", match: "exact" },
  estadio: { file: "St Patrick's Day Munich - Allianz Arena.JPG", match: "exact" },
  "centro-treinamento": { file: "Parque Nacional da Serra dos Órgãos - Centro de Treinamento de Seleção, Granja Comary, visto do Mirante Mozar Catão - panoramio.jpg", match: "illustrative" },
  "direitos-transmissao": { file: "TV cameras filming the Chelsea versus Leicester City FA Cup quarter-final (6996508249).jpg", match: "illustrative" },
  "liga-temporada": { file: "Internacional Campeão Brasileiro 1975.jpg", match: "illustrative" },
  "copa-particular": { file: "2026 FIFA World Cup Match 4, United States v Paraguay (stadium 3 hours before).jpg", match: "illustrative" },
  "voo-suborbital": { file: "Virgin Galactic SpaceShipTwo \"Unity\" rollout 19Feb2016, FAITH hangar, Mojave, California.jpg", match: "exact" },
  "viagem-orbital": { file: "The SpaceX Dragon spacecraft carrying Axiom Mission 4 approaches the International Space Station (iss073e0249700).jpg", match: "exact" },
  "missao-lunar": { file: "Artist’s Concepts Depict SpaceX’s Starship HLS Test Article for NASA’s Artemis III.jpg", match: "illustrative" },
  "base-lua": { file: "Artistic depiction of a NASA lunar base.jpg", match: "illustrative" },
  "missao-marte": { file: "Nasa mars artificial gravity 1989.jpg", match: "illustrative" },
  "estacao-espacial": { file: "International Space Station after undocking of STS-132.jpg", match: "exact" },
  "telescopio-espacial": { file: "James Webb Space Telescope Mirror37.jpg", match: "exact" },
  "programa-espacial": { file: "Mega Moon rocket- the integrated Space Launch System rocket and Orion spacecraft at NASA’s Kennedy Space Center, March 2022.jpg", match: "illustrative" },
  "ponte-gigante": { file: "Ponte Rio-Niterói.jpg", match: "exact" },
  "metro-cidade": { file: "Metro de São Paulo, Luz Station, Brazil.jpg", match: "illustrative" },
  "usina-solar": { file: "Usina solar de Pirapora 2.gif", match: "exact" },
  "rede-satelites": { file: "Falcon 9 - Starlink 6-86 Launch (9415579).jpg", match: "exact" },
  ilha: {
    uri: "https://travel-or-die.ru/wp-content/uploads/2019/04/Ostrov-Rang-YAj-Phuket-Rang-Yai-Island.jpg",
    sourcePage: "https://travel-or-die.ru/ostrov-rang-yai-island-phuket/",
    match: "exact",
  },
  "cidade-ficticia": { file: "Algorithmically-generated AI-generated artwork of a futuristic city.png", match: "illustrative" },
  "pais-ficticio": { file: "Fictional country Listenbourg color map.svg", match: "illustrative" },
  monumento: { file: "Rome Colosseum exterior 2.jpg", match: "illustrative" },
  "minuto-internet": { file: "Subway Station Digital Advertising Screens (13251201894).jpg", match: "illustrative" },
  "maravilha-mundo": { file: "The Great Pyramid of Giza from southeast corner.JPG", match: "exact" },
};

export const catalogImageAssets: Record<string, ImageSource> = Object.fromEntries(
  Object.entries(catalogImageSources).map(([itemId, source]) => [
    itemId,
    { uri: source.uri ?? commonsImage(source.file!) },
  ]),
);

export const catalogImageCredits = Object.fromEntries(
  Object.entries(catalogImageSources).map(([itemId, source]) => [
    itemId,
    {
      sourcePage: source.sourcePage ?? commonsPage(source.file!),
      match: source.match,
    },
  ]),
);