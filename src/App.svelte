<script>
  import Hero from './components/Hero.svelte';
  import FilterBar from './components/FilterBar.svelte';
  import DestinationGrid from './components/DestinationGrid.svelte';
  import Footer from './components/Footer.svelte'; // Assuming I'll create this or omitting for now
  import { destinations } from './data/destinations';
  import './app.css';

  let activeCategory = $state('All');
  let activeFilters = $state({});

  let filteredDestinations = $derived(destinations.filter(dest => {
    // 1. Category Filter
    if (activeCategory !== 'All' && !dest.categories.includes(activeCategory)) {
        return false;
    }

    // 2. Secondary Filters
    
    // Budget
    if (activeFilters.budget) {
        // Map "Low ($)" -> "$"
        const budgetMap = {
            'Low ($)': '$',
            'Medium ($$)': '$$',
            'High ($$$)': '$$$'
        };
        const targetBudget = budgetMap[activeFilters.budget];
        if (dest.budget !== targetBudget) return false;
    }

    // Flight Time
    if (activeFilters.flightTime) {
        const time = parseFloat(dest.flightTime); // "3.5h" -> 3.5
        const filter = activeFilters.flightTime;
        if (filter === '< 3h' && time >= 3) return false;
        if (filter === '3-6h' && (time < 3 || time > 6)) return false;
        if (filter === '> 6h' && time <= 6) return false;
    }

    // Season (Exact Match or Includes logic?)
    // Data: "Dec-Apr". Filter: "Dec-Apr". Simple match for now.
    if (activeFilters.season) {
        if (dest.season !== activeFilters.season) return false;
    }

    return true;
  }));

</script>

<main class="bg-background-paper min-h-screen">
  <Hero />
  
  <FilterBar 
    bind:activeCategory 
    bind:activeFilters 
  />

  <DestinationGrid destinations={filteredDestinations} />
  
  <!-- Footer Placeholer 
  <footer class="bg-primary-ultradark text-common-white py-normal text-center mt-roomy">
    <div class="container mx-auto">
        <p class="text-sm opacity-60">© 2026 Copa Airlines. All rights reserved.</p>
    </div>
  </footer>-->
</main>
