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
  
  let activeCategory = 'All';
  const destinationCards = document.querySelectorAll('[data-destination-card]');
  
  // Filter destinations based on category
  function filterByCategory(category) {
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
  
  // Initialize: set up event listeners
  function init() {
    const buttons = document.querySelectorAll('[data-filter-button]');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const category = this.getAttribute('data-filter-category');
        filterByCategory(category);
      });
    });
    
    // Initial filter - detect "All" or "Todos" button
    const allButton = document.querySelector('[data-filter-button][data-filter-category="All"]');
    if (allButton) {
      const allText = allButton.textContent.trim();
      filterByCategory(allText === 'Todos' ? 'Todos' : 'All');
    } else {
      filterByCategory('All');
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
