// Simple filtering logic for destinations
(function() {
  'use strict';
  
  // Category mapping: Localized name -> English (for all languages)
  const categoryMap = {
    // Spanish
    'Todos': 'All',
    'All': 'All',
    'Playa y descanso': 'Beach & Relaxation',
    'Cultura': 'Culture',
    'Destinos en tendencia': 'Trending Destinations',
    'Ideal para familias': 'Family-Friendly',
    'Naturaleza y aventura': 'Nature & Adventure',
    // English
    'Beach & Relaxation': 'Beach & Relaxation',
    'Culture': 'Culture',
    'Trending Destinations': 'Trending Destinations',
    'Family-Friendly': 'Family-Friendly',
    'Nature & Adventure': 'Nature & Adventure',
    // Portuguese
    'Praia e descanso': 'Beach & Relaxation',
    'Cultura': 'Culture',
    'Destinos em alta': 'Trending Destinations',
    'Para toda a família': 'Family-Friendly',
    'Natureza e aventura': 'Nature & Adventure'
  };
  
  // Anchor to English category mapping (works across all languages)
  const anchorToCategory = {
    'pl': 'Beach & Relaxation',  // pl = playa/praia
    'cu': 'Culture',              // cu = cultura/culture
    'tr': 'Trending Destinations', // tr = trending/tendencia
    'fa': 'Family-Friendly',     // fa = family/familia
    'na': 'Nature & Adventure'   // na = nature/naturaleza
  };
  
  // English category to anchor mapping (reverse lookup)
  const categoryToAnchor = {
    'Beach & Relaxation': 'pl',
    'Culture': 'cu',
    'Trending Destinations': 'tr',
    'Family-Friendly': 'fa',
    'Nature & Adventure': 'na'
  };
  
  // Detect language from page (HTML lang attribute or category names)
  function detectLanguage() {
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      return htmlLang.toLowerCase();
    }
    
    // Fallback: detect from category names present on page
    const buttons = document.querySelectorAll('[data-filter-button]');
    for (const button of buttons) {
      const category = button.getAttribute('data-filter-category');
      if (category === 'Todos') return 'es';
      if (category === 'Praia e descanso' || category === 'Para toda a família') return 'pt';
    }
    
    return 'en'; // Default to English
  }
  
  // Get localized category name from anchor
  function getCategoryFromAnchor(anchor) {
    if (!anchor || !anchorToCategory[anchor]) return null;
    const englishCategory = anchorToCategory[anchor];
    
    // Find the localized category name that maps to this English category
    // Look through all buttons to find the one with matching English category
    const buttons = document.querySelectorAll('[data-filter-button]');
    for (const button of buttons) {
      const localizedCategory = button.getAttribute('data-filter-category');
      if (localizedCategory && categoryMap[localizedCategory] === englishCategory) {
        return localizedCategory;
      }
    }
    
    return null;
  }
  
  // Get anchor from localized category name
  function getAnchorFromCategory(category) {
    if (category === 'All' || category === 'Todos') return null;
    const englishCategory = categoryMap[category];
    return englishCategory ? categoryToAnchor[englishCategory] || null : null;
  }
  
  let activeCategory = 'All';
  const destinationCards = document.querySelectorAll('[data-destination-card]');
  
  // Filter destinations based on category
  function filterByCategory(category, updateHash = true) {
    activeCategory = category;
    // Map localized category to English, or handle "All"/"Todos"
    const isAll = category === 'All' || category === 'Todos';
    const englishCategory = isAll ? 'All' : (categoryMap[category] || category);
    
    let visibleCount = 0;
    
    destinationCards.forEach(card => {
      const cardCategories = card.getAttribute('data-categories') || '';
      const categories = cardCategories.split(',').map(c => c.trim());
      
      const shouldShow = isAll || categories.includes(englishCategory);
      
      if (shouldShow) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide "No destinations found" message
    const noResultsMsg = document.querySelector('[data-no-results]');
    if (noResultsMsg) {
      if (visibleCount === 0) {
        noResultsMsg.style.display = 'flex';
      } else {
        noResultsMsg.style.display = 'none';
      }
    }
    
    // Update active button styles
    updateButtonStyles(category);
    
    // Update URL hash when category is selected (unless called from hash change)
    if (updateHash) {
      const anchor = getAnchorFromCategory(category);
      if (anchor) {
        window.location.hash = anchor;
      } else {
        // Remove hash if "All" is selected
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }
  }
  
  // Update button active states
  function updateButtonStyles(activeCategory) {
    const buttons = document.querySelectorAll('[data-filter-button]');
    buttons.forEach(button => {
      const buttonCategory = button.getAttribute('data-filter-category');
      if (buttonCategory === activeCategory) {
        button.classList.remove('bg-common-white', 'text-grey-700', 'border-grey-300');
        button.classList.add('bg-primary', 'text-common-white', 'border-primary');
      } else {
        button.classList.remove('bg-primary', 'text-common-white', 'border-primary');
        button.classList.add('bg-common-white', 'text-grey-700', 'border-grey-300');
      }
    });
  }
  
  // Read hash from URL and set category
  function setCategoryFromHash() {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash && anchorToCategory[hash]) {
      const category = getCategoryFromAnchor(hash);
      if (category) {
        filterByCategory(category, false); // false = don't update hash (to avoid loop)
        return true;
      }
    }
    return false;
  }
  
  // Initialize: set up event listeners
  function init() {
    const buttons = document.querySelectorAll('[data-filter-button]');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const category = this.getAttribute('data-filter-category');
        filterByCategory(category, true); // true = update hash
      });
    });
    
    // Check for hash in URL first
    if (setCategoryFromHash()) {
      // Hash was found and category was set, we're done
      return;
    }
    
    // No hash found, use default "All" or "Todos"
    const allButton = document.querySelector('[data-filter-button][data-filter-category="All"], [data-filter-button][data-filter-category="Todos"]');
    if (allButton) {
      const allText = allButton.getAttribute('data-filter-category');
      filterByCategory(allText, false); // false = don't update hash for default
    } else {
      filterByCategory('All', false);
    }
  }
  
  // Listen for hash changes
  window.addEventListener('hashchange', function() {
    setCategoryFromHash();
  });
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
