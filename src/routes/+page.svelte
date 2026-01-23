<script>
  import { onMount, tick } from 'svelte';
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

  // Anchor to English category mapping (works across all languages)
  const anchorToCategory = {
    'pl': 'Beach & Relaxation',  // pl = playa/praia
    'cu': 'Culture',              // cu = cultura/culture
    'tr': 'Trending Destinations', // tr = trending/tendencia
    'fa': 'Family-Friendly',     // fa = family/familia
    'na': 'Nature & Adventure',   // na = nature/naturaleza
  };

  // English category to anchor mapping (reverse lookup)
  const categoryToAnchor = {
    'Beach & Relaxation': 'pl',
    'Culture': 'cu',
    'Trending Destinations': 'tr',
    'Family-Friendly': 'fa',
    'Nature & Adventure': 'na',
  };

  // Function to get localized category name from anchor
  function getCategoryFromAnchor(anchor) {
    if (!anchor || !anchorToCategory[anchor]) return null;
    const englishCategory = anchorToCategory[anchor];
    
    // Find the localized name that maps to this English category
    // categoryMap structure: categoryMap[lang][localizedName] = englishName
    const langMap = categoryMap[currentLang];
    if (langMap) {
      // Find the key (localized name) whose value matches the English category
      for (const [localizedName, mappedEnglish] of Object.entries(langMap)) {
        if (mappedEnglish === englishCategory) {
          return localizedName;
        }
      }
    }
    
    // Fallback to English category if not found
    return englishCategory;
  }

  // Function to get anchor from localized category name
  function getAnchorFromCategory(category) {
    if (category === 'All') return null;
    const englishCategory = categoryMap[currentLang]?.[category] || category;
    return categoryToAnchor[englishCategory] || null;
  }

  // Function to read hash from URL and set active category
  function setCategoryFromHash() {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash && anchorToCategory[hash]) {
      const category = getCategoryFromAnchor(hash);
      if (category) {
        // Verify the category exists in localizedCategories before setting
        // This ensures the button will be found and selected
        if (localizedCategories && localizedCategories.length > 0) {
          if (localizedCategories.includes(category)) {
            activeCategory = category;
          }
        } else {
          // If categories aren't ready yet, set it anyway (will be validated by $effect)
          activeCategory = category;
        }
      }
    } else if (!hash) {
      activeCategory = 'All';
    }
  }

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
    
    // Wait for reactive updates to propagate, then read hash
    // Use a small delay to ensure localizedCategories is populated
    tick().then(() => {
      // Give it one more tick to ensure categories are ready
      setTimeout(() => {
        setCategoryFromHash();
      }, 10);
    });
    
    // Listen for hash changes
    const handleHashChange = () => {
      setCategoryFromHash();
    };
    window.addEventListener('hashchange', handleHashChange);
    
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
        
        // Wait for reactive state to update, then re-read hash
        tick().then(() => {
          setCategoryFromHash();
        });
      }
    }, 100);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
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

  // Reactively update category from hash when language or categories change
  // This ensures the button selection updates correctly
  $effect(() => {
    if (typeof window === 'undefined') return;
    
    // Wait for language and categories to be ready
    if (!currentLang || !localizedCategories || localizedCategories.length === 0) return;
    
    // If there's a hash in the URL, update the category to the localized version
    const hash = window.location.hash.slice(1);
    if (hash && anchorToCategory[hash]) {
      const category = getCategoryFromAnchor(hash);
      if (category) {
        // Verify the category exists in localizedCategories before setting
        // This ensures the button will be found and selected
        if (localizedCategories.includes(category)) {
          activeCategory = category;
        }
      }
    } else if (!hash && activeCategory !== 'All') {
      // If no hash and we have a category selected, reset to 'All'
      // But only if hash was explicitly removed (not on initial page load)
      // We'll let the hashchange handler manage this to avoid conflicts
    }
  });

</script>

<main class="container mx-auto min-h-screen">
 
  <Hero />
  <FilterBar 
    bind:activeCategory 
    bind:activeFilters 
    categories={localizedCategories}
    {getAnchorFromCategory}
  />

  <DestinationGrid destinations={filteredDestinations} />
  
 

 
</main>
