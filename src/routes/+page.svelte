<script>
  import { onMount } from 'svelte';
  import Hero from '../components/Hero.svelte';
  import FilterBar from '../components/FilterBar.svelte';
  import DestinationGrid from '../components/DestinationGrid.svelte';
  import Footer from '../components/Footer.svelte'; // Assuming I'll create this or omitting for now
  import { destinations, motivationCategories } from '../data/destinations';
  import { 
    getFilteredDestinations, 
    getLanguageFromDataLayer,
    getCountryFromDataLayer,
    getLocalizedCategories
  } from '../utils/destinationFilter';

  let activeCategory = $state('All');
  /** @type {Record<string, any>} */
  let activeFilters = $state({});
  let currentLang = $state('es'); // Default language
  let currentCountry = $state('gs'); // Default country
  
  // Initialize with empty array, will be populated in onMount
  // This avoids SSR issues and the onMount will run quickly on client
  let storefrontFilteredDestinations = $state([]);

  // Category mapping: localized name -> English name
  const categoryMap = {
    en: {
      'Beach & Relaxation': 'Beach & Relaxation',
      'Culture': 'Culture',
      'Trending Destinations': 'Trending Destinations',
      'Family-Friendly': 'Family-Friendly',
      'Nature & Adventure': 'Nature & Adventure',
    },
    es: {
      'Playa y descanso': 'Beach & Relaxation',
      'Cultura': 'Culture',
      'Destinos en tendencia': 'Trending Destinations',
      'Ideal para familias': 'Family-Friendly',
      'Naturaleza y aventura': 'Nature & Adventure',
    },
    pt: {
      'Praia e descanso': 'Beach & Relaxation',
      'Cultura': 'Culture',
      'Destinos em alta': 'Trending Destinations',
      'Para toda a família': 'Family-Friendly',
      'Natureza e aventura': 'Nature & Adventure',
    },
  };

  // Initialize language and country detection
  onMount(() => {
    // Initialize immediately with defaults
    currentLang = getLanguageFromDataLayer('es');
    currentCountry = getCountryFromDataLayer();
    storefrontFilteredDestinations = getFilteredDestinations(
      destinations, 
      currentCountry, 
      currentLang
    );
    
    // Wait a bit for dataLayer to be fully available (similar to your script)
    // Using a shorter timeout than the example script for better UX
    setTimeout(() => {
      const detectedLang = getLanguageFromDataLayer('pt');
      const detectedCountry = getCountryFromDataLayer();
      
      // Update if different from initial values
      if (detectedLang !== currentLang || detectedCountry !== currentCountry) {
        currentLang = detectedLang;
        currentCountry = detectedCountry;
        
        // Filter destinations based on storefront and language
        storefrontFilteredDestinations = getFilteredDestinations(
          destinations, 
          currentCountry, 
          currentLang
        );
      }
    }, 100);
  });

  // Apply category and other filters on top of storefront-filtered destinations
  let filteredDestinations = $derived(storefrontFilteredDestinations.filter(dest => {
    // 1. Category Filter
    if (activeCategory !== 'All') {
      // Map localized category name back to English category name
      const englishCategory = categoryMap[currentLang]?.[activeCategory] || activeCategory;
      if (!dest.categories.includes(englishCategory)) {
        return false;
      }
    }

    // 2. Secondary Filters
    
    // Budget
    const budget = activeFilters?.['budget'];
    if (budget) {
        // Map "Low ($)" -> "$"
        const budgetMap = {
            'Low ($)': '$',
            'Medium ($$)': '$$',
            'High ($$$)': '$$$'
        };
        const targetBudget = budgetMap[budget];
        if (dest.budget !== targetBudget) return false;
    }

    // Flight Time
    const flightTime = activeFilters?.['flightTime'];
    if (flightTime) {
        const time = parseFloat(dest.flightTime); // "3.5h" -> 3.5
        if (flightTime === '< 3h' && time >= 3) return false;
        if (flightTime === '3-6h' && (time < 3 || time > 6)) return false;
        if (flightTime === '> 6h' && time <= 6) return false;
    }

    // Season (Exact Match or Includes logic?)
    // Data: "Dec-Apr". Filter: "Dec-Apr". Simple match for now.
    const season = activeFilters?.['season'];
    if (season) {
        if (dest.season !== season) return false;
    }

    return true;
  }));

  // Get localized categories for FilterBar
  let localizedCategories = $derived(getLocalizedCategories(currentLang, motivationCategories));

</script>

<main class="container mx-auto min-h-screen">
 
  <Hero />
  <FilterBar 
    bind:activeCategory 
    bind:activeFilters 
    categories={localizedCategories}
  />

  <DestinationGrid destinations={filteredDestinations} />
  
 

 
</main>
