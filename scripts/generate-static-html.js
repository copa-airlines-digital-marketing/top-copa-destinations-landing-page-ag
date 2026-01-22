import { readFileSync, writeFileSync, unlinkSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Main async function
async function main() {
  // Read destinations data
  const destinationsPath = join(__dirname, '..', 'src', 'data', 'destinations.js');
  const destinationsContent = readFileSync(destinationsPath, 'utf-8');

  // Extract destinations array by creating a temporary module
  let allDestinations = [];
  try {
    // Create a temporary file with the destinations data (remove export)
    const tempModulePath = join(__dirname, '..', '.temp-destinations.mjs');
    const moduleContent = destinationsContent.replace(/^export const destinations = /m, 'const destinations = ').replace(/^export const motivationCategories = /m, 'const motivationCategories = ') + '\nexport { destinations, motivationCategories };';
    writeFileSync(tempModulePath, moduleContent, 'utf-8');
    
    // Import it as a module - use pathToFileURL for proper Windows support
    const moduleUrl = pathToFileURL(tempModulePath).href;
    const module = await import(moduleUrl);
    allDestinations = module.destinations || [];
    
    // Clean up temp file
    try {
      unlinkSync(tempModulePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  } catch (error) {
    console.error('Error loading destinations:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  // Get unique destinations by ID (since same destination can appear in multiple categories)
  const uniqueDestinations = [];
  const seenIds = new Set();

  for (const dest of allDestinations) {
    if (!seenIds.has(dest.id)) {
      seenIds.add(dest.id);
      uniqueDestinations.push(dest);
    }
  }

  // Hero translations
  const heroTranslations = {
    es: {
      title: 'Top destinos Copa 2026',
      description1: 'Las tendencias de viaje están en constante evolución, pero ciertos destinos capturan consistentemente la atención de los viajeros modernos. Actualmente, hay una fuerte atracción hacia ciudades, playas y retiros naturales que ofrecen emoción, actividad o simplemente disfrute sin esfuerzo, encajando perfectamente en escapadas o como parte de un itinerario más largo.',
      description2: 'Estas ciudades van desde capitales culturales vibrantes hasta lugares costeros relajados. <br> Gracias a las conexiones convenientes en toda América, llegar a estos destinos es fácil y eficiente con Copa Airlines.',
      bookNow: 'Reservar ahora'
    },
    en: {
      title: 'Top Copa destinations 2026',
      description1: 'Travel trends are constantly evolving, but certain destinations consistently capture the attention of modern travelers. Currently, there\'s a strong pull toward cities, beaches, and nature retreats that offer excitement, activity, or simply effortless enjoyment, often fitting perfectly into getaways or as part of a longer itinerary.',
      description2: 'These cities range from vibrant cultural capitals to relaxed coastal spots. <br> Thanks to convenient connections throughout the Americas, reaching these destinations is made easy and efficient with Copa Airlines.',
      bookNow: 'Book Now'
    },
    pt: {
      title: 'Top destinos Copa 2026',
      description1: 'As tendências de viagem estão em constante evolução, mas certos destinos capturam consistentemente a atenção dos viajantes modernos. Atualmente, há uma forte atração por cidades, praias e retiros naturais que oferecem emoção, atividade ou simplesmente diversão sem esforço, muitas vezes se encaixando perfeitamente em escapadelas ou como parte de um itinerário mais longo.',
      description2: 'Essas cidades variam de capitais culturais vibrantes a pontos costeiros relaxados. <br> Graças às conexões convenientes em toda a América, chegar a esses destinos é fácil e eficiente com a Copa Airlines.',
      bookNow: 'Reservar agora'
    }
  };

  // Category translations
  const categoryTranslations = {
    es: {
      'Beach & Relaxation': 'Playa y descanso',
      'Culture': 'Cultura',
      'Trending Destinations': 'Destinos en tendencia',
      'Family-Friendly': 'Ideal para familias',
      'Nature & Adventure': 'Naturaleza y aventura'
    },
    en: {
      'Beach & Relaxation': 'Beach & Relaxation',
      'Culture': 'Culture',
      'Trending Destinations': 'Trending Destinations',
      'Family-Friendly': 'Family-Friendly',
      'Nature & Adventure': 'Nature & Adventure'
    },
    pt: {
      'Beach & Relaxation': 'Praia e descanso',
      'Culture': 'Cultura',
      'Trending Destinations': 'Destinos em alta',
      'Family-Friendly': 'Para toda a família',
      'Nature & Adventure': 'Natureza e aventura'
    }
  };

  // Read the current build index.html to get the CSS link
  const buildIndexPath = join(__dirname, '..', 'build', 'index.html');
  let buildHtml = '';
  try {
    buildHtml = readFileSync(buildIndexPath, 'utf-8');
  } catch (e) {
    // Ignore if file doesn't exist
  }

  // Extract CSS link
  const cssMatch = buildHtml.match(/<link href="([^"]+\.css)" rel="stylesheet">/);
  const cssLink = cssMatch ? cssMatch[1] : './_app/immutable/assets/0.CpSrnS_q.css';

  // Generate HTML for each language
  const languages = ['es', 'en', 'pt'];
  
  for (const lang of languages) {
    generateHTMLForLanguage(lang, uniqueDestinations, heroTranslations[lang], categoryTranslations[lang], buildIndexPath, cssLink);
  }
  
  // Copy filters.js to build directory
  const filtersSourcePath = join(__dirname, 'filters.js');
  const filtersDestDir = join(__dirname, '..', 'build', 'scripts');
  const filtersDestPath = join(filtersDestDir, 'filters.js');
  
  if (existsSync(filtersSourcePath)) {
    if (!existsSync(filtersDestDir)) {
      mkdirSync(filtersDestDir, { recursive: true });
    }
    copyFileSync(filtersSourcePath, filtersDestPath);
    console.log(`   Copied filters.js to build/scripts/`);
  } else {
    console.warn(`   ⚠️  filters.js not found at ${filtersSourcePath}`);
  }
  
  console.log(`✅ Generated static HTML files for ${languages.length} languages`);
  console.log(`   Languages: ${languages.join(', ')}`);
  console.log(`   Total destinations: ${uniqueDestinations.length}`);
}

// Generate HTML for a specific language
function generateHTMLForLanguage(lang, uniqueDestinations, heroTexts, categoryMap, baseBuildPath, cssLink) {

  // Generate destination card HTML
  function generateDestinationCard(destination, lang, categoryMap, bookNowText) {
    const locale = destination.locales[lang] || destination.locales.en;
    const imageUrl = `https://cm-marketing.directus.app/assets/${destination.image}`;
    const categories = destination.categories || [];
    
    // Store English categories as data attribute for filtering
    const categoriesData = categories.join(',');
    
    const categoriesHtml = categories.map(cat => {
      // Map English category names to localized names
      const displayCategory = categoryMap[cat] || cat;
      return `<span class="rounded-2xl bg-grey-100 px-6 py-3 text-12/16 font-body-medium text-grey-600">${displayCategory}</span>`;
    }).join('\n          ');

    return `
    <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium" data-destination-card data-categories="${categoriesData}">
      <!-- Image -->
      <div class="relative h-[140px] overflow-hidden">
        <img 
          src="${imageUrl}"
          alt="${locale.name}" 
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div class="flex flex-1 flex-col p-16">
        <div class="mb-3 flex flex-col items-left justify-between">
          <h3 class="text-h3 text-h2 text-20/24 font-heading font-heading-bold text-primary caret-transparent">${locale.name}</h3>
          <span class="text-xs font-heading font-body-medium text-grey-600">${locale.country}</span>
        </div>
        <span class="text-xs font-heading font-body-medium text-grey-700 mb-8">${locale.tagline}</span>
        <div class="mb-8">
          <p class="text-14/20 text-grey-700 flex-grow font-heading">
            ${locale.description}
          </p>
        </div>
        <div class="mb-3 flex flex-wrap gap-3">
          ${categoriesHtml}
        </div>

        <div class="mt-auto flex items-center justify-end border-t border-grey-100 pt-3">
          <a 
            href="/${destination.landing}"
            class="button text-14/20 text-white! font-heading py-6 px-12 group-hover:bg-secondary group-hover:border-secondary"
          >
            ${bookNowText}
          </a>
        </div>
      </div>
    </div>`;
  }

  // Read the current build index.html to get the CSS link
  let buildHtml = '';
  try {
    buildHtml = readFileSync(baseBuildPath, 'utf-8');
  } catch (e) {
    // Ignore if file doesn't exist
  }

  // Extract CSS link (use the passed cssLink parameter)
  
  // Get localized categories for filter buttons (based on language)
  // categoryMap contains English -> Localized mapping, so we need the localized values
  const localizedCategories = Object.values(categoryMap);
  
  // Generate filter buttons HTML
  const allText = lang === 'es' ? 'Todos' : lang === 'pt' ? 'Todos' : 'All';
  const filterButtons = `
    <button 
      data-filter-button
      data-filter-category="${allText}"
      class="rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0 bg-primary text-common-white border-primary"
    >
      ${allText}
    </button>
${localizedCategories.map(cat => `    <button 
      data-filter-button
      data-filter-category="${cat}"
      class="rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0 bg-common-white text-grey-700 border-grey-300 hover:border-primary"
    >
      ${cat}
    </button>`).join('\n')}`;

  // Generate destinations grid
  const destinationsGrid = uniqueDestinations.map(dest => generateDestinationCard(dest, lang, categoryMap, heroTexts.bookNow)).join('\n');

  // Meta descriptions by language
  const metaDescriptions = {
    es: 'Descubre los mejores destinos de Copa Airlines para 2026. Conecta con América a través del Hub de las Américas en Panamá.',
    en: 'Discover the best Copa Airlines destinations for 2026. Connect with the Americas through the Hub of the Americas in Panama.',
    pt: 'Descubra os melhores destinos da Copa Airlines para 2026. Conecte-se com as Américas através do Hub das Américas no Panamá.'
  };

  // No results messages by language
  const noResultsMessages = {
    es: {
      title: 'No se encontraron destinos',
      description: 'Intenta ajustar tus filtros para ver más resultados.'
    },
    en: {
      title: 'No destinations found',
      description: 'Try adjusting your filters to see more results.'
    },
    pt: {
      title: 'Nenhum destino encontrado',
      description: 'Tente ajustar seus filtros para ver mais resultados.'
    }
  };

  // Generate complete static HTML
  const filename = lang === 'es' ? 'index.html' : `index-${lang}.html`;
  const buildIndexPath = join(dirname(baseBuildPath), filename);
  
  const staticHTML = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${metaDescriptions[lang]}" />
    <title>Copa Airlines - ${heroTexts.title}</title>
    
    <link href="${cssLink}" rel="stylesheet">
  </head>
  <body>
    <main class="container mx-auto min-h-screen">
      <!-- Hero Section -->
      <div class="container mx-auto pt-4">
        <h1 class="text-h1 font-heading text-center text-primary font-heading-bold mb-24">
          ${heroTexts.title}
        </h1>
        <h2 class="text-h4 font-heading text-center mb-24">
          ${heroTexts.description1}
        </h2>
        <h2 class="text-h5 font-heading text-center mb-24">
          ${heroTexts.description2}
        </h2>
      </div>

      <!-- Filter Bar -->
      <div class="w-full bg-common-white py-12 sm:py-16 md:py-20 lg:py-24 sticky top-0 z-50 border-b border-grey-100">
        <div class="flex justify-center items-center overflow-x-auto hide-scroll gap-4 sm:gap-6 md:gap-8 px-8 sm:px-12 md:px-16 lg:px-24">
${filterButtons}
        </div>
      </div>

      <!-- Destinations Grid -->
      <div class="container mx-auto py-roomy">
        <div class="grid grid-cols-1 px-roomy sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
${destinationsGrid}
        </div>
        
        <!-- No results message -->
        <div data-no-results class="flex h-64 flex-col items-center justify-center text-center" style="display: none;">
          <h3 class="text-h3 text-grey-600 mb-8">${noResultsMessages[lang].title}</h3>
          <p class="text-grey-500">${noResultsMessages[lang].description}</p>
        </div>
      </div>
    </main>
    
    <script src="./scripts/filters.js"></script>
  </body>
</html>`;

  // Write the static HTML
  writeFileSync(buildIndexPath, staticHTML, 'utf-8');
  
  console.log(`   ✓ Generated index-${lang === 'es' ? 'es' : lang}.html (${uniqueDestinations.length} destinations)`);
}

// Run the main function
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
