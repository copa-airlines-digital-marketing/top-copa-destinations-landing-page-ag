// Single source of truth, multi-lingual (EN / ES / PT-BR)
// Rule: 1 destination + 1 category = 1 entry (even if name repeats)

export const destinations = [
  // ─────────────────────────
  // Trending Destinations
  // ─────────────────────────
  {
    id: 1,
    categories: ["Trending Destinations"],
    image:"7ad0270b-f9e5-4e53-bf68-d4dc1c15f990",
    season: "Dec-Apr",
    landing: "san-juan-trending",
    locales: {
      en: {
        name: "San Juan",
        country: "Puerto Rico",
        tagline: "Island Culture, Global Energy",
        description:
          "San Juan is a globally recognized, energetic destination blending historic, walkable streets, coastal beauty, and a vibrant music and food scene. Enjoy relaxing beaches by day and lively evenings.",
      },
      es: {
        name: "San Juan",
        country: "Puerto Rico",
        tagline: "Cultura isleña, energía global",
        description:
          "San Juan es un destino vibrante y reconocido globalmente, con calles históricas y caminables, belleza costera y una escena fuerte de música y gastronomía. Disfruta playas relajadas de día y noches llenas de vida.",
      },
      pt: {
        name: "San Juan",
        country: "Porto Rico",
        tagline: "Cultura insular, energia global",
        description:
          "San Juan é um destino vibrante e reconhecido mundialmente, com ruas históricas e caminháveis, beleza litorânea e uma cena forte de música e gastronomia. Aproveite praias tranquilas de dia e noites animadas.",
      },
    },
  },
  {
    id: 2,
    categories: ["Trending Destinations"],
    image:"c33fd39b-9a1f-4873-85e0-dcfe497eac19",
    season: "Nov-Apr",
    landing: "mexico-city-trending",
    locales: {
      en: {
        name: "Mexico City",
        country: "Mexico",
        tagline: "A Capital That Never Sleeps",
        description:
          "Mexico City is a dynamic urban destination, rivaling global cities in scale, creativity, and culture. A short 3–4 day trip offers travelers museums, markets, diverse neighborhoods, and vibrant nightlife.",
      },
      es: {
        name: "Ciudad de México",
        country: "México",
        tagline: "Una capital que nunca duerme",
        description:
          "Ciudad de México es un destino urbano dinámico, al nivel de las grandes ciudades del mundo por su escala, creatividad y cultura. En 3–4 días puedes vivir museos, mercados, barrios diversos y una vida nocturna vibrante.",
      },
      pt: {
        name: "Cidade do México",
        country: "México",
        tagline: "Uma capital que nunca dorme",
        description:
          "A Cidade do México é um destino urbano dinâmico, comparável às grandes cidades globais em escala, criatividade e cultura. Em 3–4 dias, dá para curtir museus, mercados, bairros diversos e uma vida noturna vibrante.",
      },
    },
  },
  {
    id: 3,
    categories: ["Trending Destinations"],
    season: "Oct-Apr",
    image:"686c9adb-2be6-4a81-a738-868739dd899d",
    landing: "monterrey-trending",
    locales: {
      en: {
        name: "Monterrey",
        country: "Mexico",
        tagline: "Modern Growth & Mountain Views",
        description:
          "Monterrey is a fast-growing, internationally recognized hub for business and innovation, set against dramatic mountains. The city blends modern dining, urban design, and easy outdoor access.",
      },
      es: {
        name: "Monterrey",
        country: "México",
        tagline: "Crecimiento moderno y vistas a la montaña",
        description:
          "Monterrey es un hub de negocios e innovación en rápido crecimiento y con reconocimiento internacional, rodeado de montañas imponentes. Combina gastronomía moderna, diseño urbano y acceso fácil a planes al aire libre.",
      },
      pt: {
        name: "Monterrey",
        country: "México",
        tagline: "Crescimento moderno e vistas para as montanhas",
        description:
          "Monterrey é um polo de negócios e inovação em rápido crescimento e com reconhecimento internacional, emoldurado por montanhas impressionantes. A cidade combina gastronomia moderna, design urbano e acesso fácil à natureza.",
      },
    },
  },
  {
    id: 4,
    categories: ["Trending Destinations"],
    season: "Jun-Sep",
    image:"d05285e0-8ff1-40ab-b04f-3d75ff5f3b6b",
    landing: "toronto-trending",
    locales: {
      en: {
        name: "Toronto",
        country: "Canada",
        tagline: "Global City With Summer Appeal",
        description:
          "Toronto enters a peak travel moment with strong summer demand and international buzz. Its neighborhoods, waterfront, and cultural diversity make it easy to explore in a few days.",
      },
      es: {
        name: "Toronto",
        country: "Canadá",
        tagline: "Ciudad global con vibra de verano",
        description:
          "Toronto vive un gran momento de viaje, con alta demanda en verano y mucho interés internacional. Sus barrios, su waterfront y su diversidad cultural hacen que se recorra fácil en pocos días.",
      },
      pt: {
        name: "Toronto",
        country: "Canadá",
        tagline: "Cidade global com clima de verão",
        description:
          "Toronto entra em um pico de viagens, com alta demanda no verão e buzz internacional. Bairros, waterfront e diversidade cultural tornam a cidade fácil de explorar em poucos dias.",
      },
    },
  },
  {
    id: 5,
    categories: ["Trending Destinations"],
    image:"ea0f419d-3582-4a47-b01c-22d11e4641db",
    season: "Nov-Apr",
    landing: "miami-trending",
    locales: {
      en: {
        name: "Miami",
        country: "United States",
        tagline: "The Always-Moving Gateway",
        description:
          "Miami remains one of the most in-demand cities in the Americas. Beaches, nightlife, and a constant flow of entertainment keep the city buzzing year-round.",
      },
      es: {
        name: "Miami",
        country: "Estados Unidos",
        tagline: "La puerta de entrada que no se detiene",
        description:
          "Miami sigue siendo una de las ciudades más buscadas de las Américas. Playas, vida nocturna y un flujo constante de entretenimiento mantienen la ciudad activa todo el año.",
      },
      pt: {
        name: "Miami",
        country: "Estados Unidos",
        tagline: "A porta de entrada que não para",
        description:
          "Miami continua sendo uma das cidades mais desejadas das Américas. Praias, vida noturna e um fluxo constante de entretenimento mantêm a cidade animada o ano inteiro.",
      },
    },
  },
  {
    id: 6,
    categories: ["Trending Destinations"],
    season: "Apr-Jun",
    image:"8a5c82be-6ca4-4a25-9ea7-c80492d5f74e",
    landing: "new-york-city-trending",
    locales: {
      en: {
        name: "New York City",
        country: "United States",
        tagline: "A Global Tourist Classic",
        description:
          "New York continues to sit at the top of many travelers’ lists. Its density of culture, dining, and iconic neighborhoods makes it perfect for high-impact trips.",
      },
      es: {
        name: "Nueva York",
        country: "Estados Unidos",
        tagline: "Un clásico global del turismo",
        description:
          "Nueva York sigue en la cima de la lista de muchos viajeros. Su concentración de cultura, gastronomía y barrios icónicos la hace perfecta para viajes cortos pero intensos.",
      },
      pt: {
        name: "Nova York",
        country: "Estados Unidos",
        tagline: "Um clássico global do turismo",
        description:
          "Nova York continua no topo da lista de muitos viajantes. A densidade de cultura, gastronomia e bairros icônicos torna a cidade perfeita para viagens de alto impacto em poucos dias.",
      },
    },
  },

  // ─────────────────────────
  // Beach & Relaxation
  // ─────────────────────────
  {
    id: 7,
    categories: ["Beach & Relaxation"],
    season: "Nov-Apr",
    image:"6e1e835d-127f-4d5f-9892-9ebe8658e0b4",
    landing: "los-cabos-beach",
    locales: {
      en: {
        name: "Los Cabos",
        country: "Mexico",
        tagline: "Where Deserts and Coastlines Meet",
        description:
          "Los Cabos delivers a premium beach experience where dramatic desert landscapes meet calm oceanfront resorts. A three or four-day stay feels complete and restorative.",
      },
      es: {
        name: "Los Cabos",
        country: "México",
        tagline: "Donde el desierto se encuentra con el mar",
        description:
          "Los Cabos ofrece una experiencia de playa premium: paisajes de desierto dramáticos junto a resorts tranquilos frente al mar. Con 3 o 4 días, el viaje se siente completo y renovador.",
      },
      pt: {
        name: "Los Cabos",
        country: "México",
        tagline: "Onde o deserto encontra o mar",
        description:
          "Los Cabos entrega uma experiência de praia premium, onde paisagens desérticas impressionantes encontram resorts tranquilos à beira-mar. Em 3 ou 4 dias, a viagem já parece completa e revigorante.",
      },
    },
  },
  {
    id: 8,
    categories: ["Beach & Relaxation"],
    season: "Dec-Mar",
    image:"167a65eb-22c0-4f5c-ad57-cd3133f9cfc0",
    landing: "florianopolis-beach",
    locales: {
      en: {
        name: "Florianópolis",
        country: "Brazil",
        tagline: "Island Life With Local Soul",
        description:
          "Florianópolis blends island beaches, surf culture, and a relaxed Brazilian rhythm. Ideal for travelers seeking balance between nature and local life.",
      },
      es: {
        name: "Florianópolis",
        country: "Brasil",
        tagline: "Vida de isla con alma local",
        description:
          "Florianópolis combina playas de isla, cultura surf y un ritmo brasileño relajado. Ideal para quienes buscan equilibrio entre naturaleza y vida local.",
      },
      pt: {
        name: "Florianópolis",
        country: "Brasil",
        tagline: "Vida de ilha com alma local",
        description:
          "Florianópolis mistura praias de ilha, cultura do surf e um ritmo brasileiro mais leve. Ideal para quem busca equilíbrio entre natureza e vida local.",
      },
    },
  },
  {
    id: 9,
    categories: ["Beach & Relaxation"],
    season: "Dec-Apr",
    landing: "cancun-beach",
    image:"99126d7c-b67e-4360-ba6e-631de6a197e9",
    locales: {
      en: {
        name: "Cancun",
        country: "Mexico",
        tagline: "Effortless Beach Escapes",
        description:
          "Cancun remains the benchmark for stress-free beach vacations. Warm water, long beaches, and resort infrastructure make it easy to relax from the moment you arrive.",
      },
      es: {
        name: "Cancún",
        country: "México",
        tagline: "Escapadas a la playa sin esfuerzo",
        description:
          "Cancún sigue siendo el estándar para vacaciones de playa sin complicaciones. Agua cálida, playas extensas e infraestructura de resort hacen que relajarte sea fácil desde que llegas.",
      },
      pt: {
        name: "Cancún",
        country: "México",
        tagline: "Escapadas de praia sem esforço",
        description:
          "Cancún continua sendo referência em férias de praia sem estresse. Água quente, praias longas e estrutura de resorts tornam fácil relaxar desde o momento da chegada.",
      },
    },
  },
  {
    id: 10,
    categories: ["Beach & Relaxation"],
    season: "Dec-Mar",
    landing: "rio-de-janeiro-beach",
    image:"499d4ff3-67ab-422a-98b9-8be49fe02ae5",
    locales: {
      en: {
        name: "Rio de Janeiro",
        country: "Brazil",
        tagline: "A Lively City with Iconic Beaches",
        description:
          "Rio offers world-famous beaches integrated into a major city. Copacabana and Ipanema sit alongside nightlife, viewpoints, and local culture.",
      },
      es: {
        name: "Río de Janeiro",
        country: "Brasil",
        tagline: "Una ciudad vibrante con playas icónicas",
        description:
          "Río ofrece algo único: playas mundialmente famosas dentro de una gran ciudad. Copacabana e Ipanema conviven con vida nocturna, miradores y cultura local.",
      },
      pt: {
        name: "Rio de Janeiro",
        country: "Brasil",
        tagline: "Uma cidade vibrante com praias icônicas",
        description:
          "Rio oferece algo raro: praias mundialmente famosas dentro de uma grande cidade. Copacabana e Ipanema se conectam com vida noturna, mirantes e cultura local.",
      },
    },
  },
  {
    id: 11,
    categories: ["Beach & Relaxation"],
    season: "Dec-Apr",
    landing: "santa-marta-beach",
    image:"3352d42c-5664-4037-8670-3003fbd9a5db",
    locales: {
      en: {
        name: "Santa Marta",
        country: "Colombia",
        tagline: "Calm Caribbean Gateway",
        description:
          "Santa Marta feels slower and more nature-focused than larger Colombian cities. Beaches, coastal views, and nearby natural parks define the experience.",
      },
      es: {
        name: "Santa Marta",
        country: "Colombia",
        tagline: "Entrada tranquila al Caribe",
        description:
          "Santa Marta se siente más calmada y conectada con la naturaleza que otras ciudades colombianas grandes. Playas, vistas costeras y parques naturales cercanos definen la experiencia.",
      },
      pt: {
        name: "Santa Marta",
        country: "Colômbia",
        tagline: "Porta de entrada tranquila para o Caribe",
        description:
          "Santa Marta tem um ritmo mais lento e mais voltado à natureza do que outras grandes cidades colombianas. Praias, paisagens costeiras e parques naturais próximos definem a experiência.",
      },
    },
  },
  {
    id: 12,
    categories: ["Beach & Relaxation"],
    season: "Dec-Apr",
    landing: "belize-beach",
    image:"7bc5d8b7-1d2f-4020-a35c-1e7c207d0399",
    locales: {
      en: {
        name: "Belize",
        country: "Belize",
        tagline: "Slow Island Time",
        description:
          "Belize offers a pace that encourages unplugging. Life on the cayes revolves around the sea, simple routines, and clear water.",
      },
      es: {
        name: "Belice",
        country: "Belice",
        tagline: "Ritmo lento de isla",
        description:
          "Belice tiene un ritmo que invita a desconectarse. La vida en los cayos gira alrededor del mar, rutinas simples y agua cristalina.",
      },
      pt: {
        name: "Belize",
        country: "Belize",
        tagline: "Ritmo tranquilo de ilha",
        description:
          "Belize tem um ritmo que incentiva a desacelerar. A vida nos cayes gira em torno do mar, rotinas simples e água cristalina.",
      },
    },
  },
  {
    id: 13,
    categories: ["Beach & Relaxation"],
    season: "Dec-Apr",
    landing: "curacao-beach",
    image:"c1827782-4b2c-4bd6-850f-920482933e69",
    locales: {
      en: {
        name: "Curaçao",
        country: "Curaçao",
        tagline: "Sun, Color, and Calm",
        description:
          "Curaçao offers reliable sunshine without crowds. Its dry climate and walkable coastal areas make it ideal for a short beach reset.",
      },
      es: {
        name: "Curaçao",
        country: "Curazao",
        tagline: "Sol, color y calma",
        description:
          "Curaçao ofrece sol confiable sin multitudes. Su clima seco y zonas costeras caminables lo hacen ideal para un reset corto de playa.",
      },
      pt: {
        name: "Curaçao",
        country: "Curaçao",
        tagline: "Sol, cor e calma",
        description:
          "Curaçao oferece sol garantido sem multidões. O clima seco e as áreas costeiras fáceis de explorar a pé tornam perfeito para um reset rápido de praia.",
      },
    },
  },

  // ─────────────────────────
  // Culture
  // ─────────────────────────
  {
    id: 14,
    categories: ["Culture"],
    season: "Dec-Apr",
    landing: "santiago-de-los-caballeros-culture",
    image:"ab3525d5-f030-4082-b208-53d083b6cebf",
    locales: {
      en: {
        name: "Santiago de los Caballeros",
        country: "Dominican Republic",
        tagline: "Tradition Beyond the Coast",
        description:
          "Santiago de los Caballeros provides insight into Dominican history and daily life away from resort areas. The city feels grounded and authentic.",
      },
      es: {
        name: "Santiago de los Caballeros",
        country: "República Dominicana",
        tagline: "Tradición más allá de la costa",
        description:
          "Santiago de los Caballeros ofrece una mirada a la historia y la vida diaria dominicana lejos de las zonas de resorts. Es una ciudad auténtica, cultural y con mucha identidad.",
      },
      pt: {
        name: "Santiago de los Caballeros",
        country: "República Dominicana",
        tagline: "Tradição além do litoral",
        description:
          "Santiago de los Caballeros revela a história e o dia a dia dominicano longe das áreas de resorts. A cidade é autêntica, cultural e com muita identidade.",
      },
    },
  },
  {
    id: 15,
    categories: ["Culture"],
    season: "Nov-Apr",
    landing: "mexico-city-culture",
    image:"8c95eaac-f8c9-4ecf-a957-aeaa03b59016",
    locales: {
      en: {
        name: "Mexico City",
        country: "Mexico",
        tagline: "Culture at an Unmatched Scale",
        description:
          "Mexico City’s museums, food, and neighborhoods make it one of the most culturally dense cities in the Americas.",
      },
      es: {
        name: "Ciudad de México",
        country: "México",
        tagline: "Cultura a una escala incomparable",
        description:
          "Los museos, la gastronomía y los barrios de Ciudad de México la convierten en una de las ciudades con mayor densidad cultural de las Américas.",
      },
      pt: {
        name: "Cidade do México",
        country: "México",
        tagline: "Cultura em uma escala incomparável",
        description:
          "Museus, gastronomia e bairros diversos fazem da Cidade do México uma das cidades mais intensas culturalmente nas Américas.",
      },
    },
  },
  {
    id: 16,
    categories: ["Culture"],
    season: "Mar-May",
    landing: "buenos-aires-culture",
    image:"bf41bf30-cc60-440a-b70c-c5575f93a179",
    locales: {
      en: {
        name: "Buenos Aires",
        country: "Argentina",
        tagline: "European Style With Latin Rhythm",
        description:
          "Buenos Aires blends grand architecture, café culture, and music into a city that feels timeless and rich in character.",
      },
      es: {
        name: "Buenos Aires",
        country: "Argentina",
        tagline: "Estilo europeo con ritmo latino",
        description:
          "Buenos Aires mezcla arquitectura imponente, cultura de cafés y música en una ciudad con carácter, historia y un encanto atemporal.",
      },
      pt: {
        name: "Buenos Aires",
        country: "Argentina",
        tagline: "Estilo europeu com ritmo latino",
        description:
          "Buenos Aires combina arquitetura grandiosa, cultura de cafés e música em uma cidade com personalidade, história e um charme atemporal.",
      },
    },
  },
  {
    id: 17,
    categories: ["Culture"],
    season: "Dec-Apr",
    landing: "panama-city-culture",
    image:"35c79890-9741-4ded-9603-4172181c8c8f",
    locales: {
      en: {
        name: "Panama City",
        country: "Panama",
        tagline: "Blending History and the Future",
        description:
          "Panama City combines historic streets, a modern skyline, and access to the Panama Canal, offering layered cultural experiences in a compact trip.",
      },
      es: {
        name: "Ciudad de Panamá",
        country: "Panamá",
        tagline: "Historia y futuro en un solo lugar",
        description:
          "Ciudad de Panamá mezcla calles históricas, un skyline moderno y acceso al Canal de Panamá, ofreciendo experiencias culturales variadas en un viaje corto y completo.",
      },
      pt: {
        name: "Cidade do Panamá",
        country: "Panamá",
        tagline: "História e futuro no mesmo lugar",
        description:
          "A Cidade do Panamá combina ruas históricas, um skyline moderno e acesso ao Canal do Panamá, entregando experiências culturais em camadas em uma viagem curta e bem aproveitada.",
      },
    },
  },
  {
    id: 18,
    categories: ["Culture"],
    season: "Dec-Mar",
    landing: "medellin-culture",
    image:"e69d348a-9c63-461f-8c21-a8f40334f20a",
    locales: {
      en: {
        name: "Medellín",
        country: "Colombia",
        tagline: "A City Defined by Change",
        description:
          "Medellín’s creative energy and transformation story continue to attract global travelers through art, innovation, and neighborhood life.",
      },
      es: {
        name: "Medellín",
        country: "Colombia",
        tagline: "Una ciudad definida por el cambio",
        description:
          "La energía creativa de Medellín y su historia de transformación siguen atrayendo viajeros globales a través del arte, la innovación y la vida de barrio.",
      },
      pt: {
        name: "Medellín",
        country: "Colômbia",
        tagline: "Uma cidade marcada pela transformação",
        description:
          "A energia criativa de Medellín e sua história de transformação continuam atraindo viajantes do mundo todo com arte, inovação e vida de bairro.",
      },
    },
  },

  // ─────────────────────────
  // Nature & Adventure
  // ─────────────────────────
  {
    id: 19,
    categories: ["Nature & Adventure"],
    season: "Apr-Oct",
    landing: "salta-nature",
    image:"d3b812ca-cb2e-4b44-ad77-9217ac6649cf",
    locales: {
      en: {
        name: "Salta",
        country: "Argentina",
        tagline: "High-Altitude Landscapes",
        description:
          "Salta delivers dramatic scenery, wide-open landscapes, and striking red rock formations for visually impactful adventures.",
      },
      es: {
        name: "Salta",
        country: "Argentina",
        tagline: "Paisajes de altura",
        description:
          "Salta ofrece paisajes dramáticos, espacios abiertos y formaciones de roca roja impactantes, ideales para una aventura visual y llena de naturaleza.",
      },
      pt: {
        name: "Salta",
        country: "Argentina",
        tagline: "Paisagens de alta altitude",
        description:
          "Salta entrega cenários dramáticos, paisagens amplas e formações de rocha vermelha marcantes — perfeito para aventuras com muito impacto visual.",
      },
    },
  },
  {
    id: 20,
    categories: ["Nature & Adventure"],
    season: "Dec-Apr",
    landing: "belize-nature",
    image:"4741e8cc-35f4-47ee-a000-fb6a7a91e322",
    locales: {
      en: {
        name: "Belize",
        country: "Belize",
        tagline: "Reef and Rainforest",
        description:
          "Belize combines world-class diving with jungle adventures, allowing travelers to move easily between sea and forest.",
      },
      es: {
        name: "Belice",
        country: "Belice",
        tagline: "Arrecife y selva",
        description:
          "Belice combina buceo de clase mundial con aventura en la selva, permitiendo moverte fácilmente entre el mar y el bosque.",
      },
      pt: {
        name: "Belize",
        country: "Belize",
        tagline: "Recife e floresta tropical",
        description:
          "Belize combina mergulho de nível mundial com aventuras na selva, permitindo alternar facilmente entre o mar e a floresta.",
      },
    },
  },
  {
    id: 21,
    categories: ["Nature & Adventure"],
    season: "Dec-Apr",
    landing: "san-jose-nature",
    image:"35962792-c35d-45a0-9b77-ba52975e3b7b",
    locales: {
      en: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Gateway to Nature",
        description:
          "San José serves as an ideal base for exploring volcanoes, cloud forests, and wildlife with easy logistics.",
      },
      es: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Puerta de entrada a la naturaleza",
        description:
          "San José es una base ideal para explorar volcanes, bosques nubosos y vida silvestre con logística fácil y poco tiempo de traslado.",
      },
      pt: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Portal para a natureza",
        description:
          "San José é uma base ideal para explorar vulcões, florestas nubladas e vida selvagem com logística simples e pouco deslocamento.",
      },
    },
  },
  {
    id: 22,
    categories: ["Nature & Adventure"],
    season: "Mar-May",
    landing: "mendoza-nature",
    image:"c9e67fa2-9297-4667-959b-b53d25c6c394",
    locales: {
      en: {
        name: "Mendoza",
        country: "Argentina",
        tagline: "Mountains and Wine",
        description:
          "Mendoza blends outdoor adventure with refined wine culture, pairing Andes landscapes with vineyard experiences.",
      },
      es: {
        name: "Mendoza",
        country: "Argentina",
        tagline: "Montañas y vino",
        description:
          "Mendoza mezcla aventura al aire libre con cultura vinícola sofisticada, combinando paisajes de los Andes con experiencias en viñedos.",
      },
      pt: {
        name: "Mendoza",
        country: "Argentina",
        tagline: "Montanhas e vinho",
        description:
          "Mendoza combina aventura ao ar livre com uma cultura de vinhos sofisticada, unindo paisagens dos Andes a experiências em vinícolas.",
      },
    },
  },
  {
    id: 23,
    categories: ["Nature & Adventure"],
    season: "Dec-Apr",
    landing: "santa-marta-nature",
    image:"2174c635-1e6d-4bd5-9f6b-24749ccc9df5",
    locales: {
      en: {
        name: "Santa Marta",
        country: "Colombia",
        tagline: "Access to Iconic Trails",
        description:
          "Santa Marta is the starting point for some of Colombia’s most iconic natural landscapes and trekking routes.",
      },
      es: {
        name: "Santa Marta",
        country: "Colombia",
        tagline: "Acceso a rutas icónicas",
        description:
          "Santa Marta es el punto de partida hacia algunos de los paisajes naturales y rutas de trekking más icónicos de Colombia.",
      },
      pt: {
        name: "Santa Marta",
        country: "Colômbia",
        tagline: "Acesso a trilhas icônicas",
        description:
          "Santa Marta é o ponto de partida para algumas das paisagens naturais e rotas de trekking mais icônicas da Colômbia.",
      },
    },
  },

  // ─────────────────────────
  // Family-Friendly
  // ─────────────────────────
  {
    id: 24,
    categories: ["Family-Friendly"],
    season: "Mar-May",
    landing: "orlando-family",
    image:"517b4259-1f53-43dd-a678-645fd42c28cd",
    locales: {
      en: {
        name: "Orlando",
        country: "United States",
        tagline: "Built for Families",
        description:
          "Orlando remains one of the most family-oriented destinations in the world, designed to make travel with kids easy and enjoyable.",
      },
      es: {
        name: "Orlando",
        country: "Estados Unidos",
        tagline: "Hecho para familias",
        description:
          "Orlando sigue siendo uno de los destinos más familiares del mundo, diseñado para que viajar con niños sea fácil, cómodo y muy disfrutable.",
      },
      pt: {
        name: "Orlando",
        country: "Estados Unidos",
        tagline: "Feito para famílias",
        description:
          "Orlando continua sendo um dos destinos mais voltados para famílias no mundo, feito para tornar a viagem com crianças mais fácil e divertida.",
      },
    },
  },
  {
    id: 25,
    categories: ["Family-Friendly"],
    season: "Dec-Apr",
    landing: "cancun-family",
    image:"99126d7c-b67e-4360-ba6e-631de6a197e9",
    locales: {
      en: {
        name: "Cancun",
        country: "Mexico",
        tagline: "Family Resorts Made Simple",
        description:
          "Cancun is ideal for family getaways, offering resorts with pools and activities that simplify logistics for parents and kids alike.",
      },
      es: {
        name: "Cancún",
        country: "México",
        tagline: "Resorts familiares sin complicaciones",
        description:
          "Cancún es ideal para escapadas en familia: resorts con piscinas y actividades que simplifican la logística para padres y niños.",
      },
      pt: {
        name: "Cancún",
        country: "México",
        tagline: "Resorts para a família, sem complicação",
        description:
          "Cancún é ideal para viagens em família, com resorts que oferecem piscinas e atividades que facilitam a logística para pais e crianças.",
      },
    },
  },
  {
    id: 26,
    categories: ["Family-Friendly"],
    season: "Jun-Sep",
    landing: "toronto-family",
    image:"87d71d93-eaa5-4906-bff7-541e9ef00919",
    locales: {
      en: {
        name: "Toronto",
        country: "Canada",
        tagline: "Easy and Comfortable With Kids",
        description:
          "Toronto is a family-friendly city known for safety, cleanliness, and easy access to parks, museums, and walkable neighborhoods.",
      },
      es: {
        name: "Toronto",
        country: "Canadá",
        tagline: "Fácil y cómoda con niños",
        description:
          "Toronto es una ciudad ideal para familias por su seguridad, limpieza y acceso fácil a parques, museos y barrios caminables.",
      },
      pt: {
        name: "Toronto",
        country: "Canadá",
        tagline: "Fácil e confortável com crianças",
        description:
          "Toronto é excelente para famílias pela combinação de segurança, limpeza e acesso fácil a parques, museus e bairros caminháveis.",
      },
    },
  },
  {
    id: 27,
    categories: ["Family-Friendly"],
    season: "Dec-Apr",
    landing: "san-jose-family",
    image:"35962792-c35d-45a0-9b77-ba52975e3b7b",
    locales: {
      en: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Nature for All Ages",
        description:
          "San José offers families an easy way to experience wildlife, culture, and nature without long travel days.",
      },
      es: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Naturaleza para todas las edades",
        description:
          "San José permite a las familias vivir fauna, cultura y naturaleza de forma sencilla, sin días largos de traslados.",
      },
      pt: {
        name: "San José",
        country: "Costa Rica",
        tagline: "Natureza para todas as idades",
        description:
          "San José dá às famílias um jeito fácil de viver vida selvagem, cultura e natureza, sem longos dias de deslocamento.",
      },
    },
  },
];

export const motivationCategories = {
  en: [
    "Beach & Relaxation",
    "Culture",
    "Trending Destinations",
    "Family-Friendly",
    "Nature & Adventure",
  ],
  es: [
    "Playa y descanso",
    "Cultura",
    "Destinos en tendencia",
    "Ideal para familias",
    "Naturaleza y aventura",
  ],
  pt: [
    "Praia e descanso",
    "Cultura",
    "Destinos em alta",
    "Para toda a família",
    "Natureza e aventura",
  ],
};
