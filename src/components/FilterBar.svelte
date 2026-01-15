<script>
  import { motivationCategories } from '../data/destinations';
  
  let { activeCategory = $bindable('All'), activeFilters = $bindable({}) } = $props();

  const secondaryFilters = [

    { id: 'season', label: 'Best Season', options: ['Dec-Apr', 'May-Sep', 'Oct-Nov'] }
  ];

  function setCategory(category) {
    activeCategory = category;
  }

  function toggleFilter(type, value) {
    // Logic to toggle secondary filters
    // For now simplistic implementation
    if (activeFilters[type] === value) {
        delete activeFilters[type]; // Toggle off
    } else {
        activeFilters[type] = value;
    }
  }
</script>


<div class="w-full bg-common-white py-12 sm:py-16 md:py-20 lg:py-24 sticky top-0 z-50 border-b border-grey-100">
  <!-- Primary Categories -->
  <div class="relative flex items-center">
    <!-- Static "All" button on mobile, normal on desktop -->
    <button 
      class="rounded-full px-16 sm:px-16 md:px-20 lg:px-24 py-8 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0
      absolute md:static left-8 sm:left-12 md:left-auto z-20 shadow-medium md:shadow-none
      {activeCategory === 'All' ? 'bg-primary text-common-white border-primary' : 'bg-common-white text-grey-700 border-grey-300 hover:border-primary'}"
      onclick={() => setCategory('All')}
    >
      All
    </button>
    
    <!-- Gradient fade overlay on mobile only - starts after button, fades into scrollable area -->
    <div class="absolute md:hidden left-[140px] sm:left-[160px] top-0 h-full w-40 sm:w-40 z-10 pointer-events-none bg-gradient-to-r from-common-white via-common-white/80 to-transparent"></div>
    
    <!-- Scrollable categories -->
    <div class="flex xs:justify-start sm:justify-start md:justify-center overflow-x-auto hide-scroll gap-4 sm:gap-6 md:gap-8 items-center md:px-16 lg:px-24 pl-[93px] sm:pl-[112px]  pr-8 sm:pr-12 md:pr-16">
      {#each motivationCategories as category}
        <button 
          class="rounded-full sm:px-16 md:px-20 lg:px-24 py-8 px-16 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0
          {activeCategory === category ? 'bg-primary text-common-white border-primary' : 'bg-common-white text-grey-700 border-grey-300 hover:border-primary'}"
          onclick={() => setCategory(category)}
        >
          {category}
        </button>
      {/each}
    </div>
  </div>
</div>

    <!-- Secondary Filters (Collapsible or visible) 
    <div class="flex flex-wrap justify-center gap-8 border-t border-grey-100 pt-16">
        {#each secondaryFilters as filter}
            <div class="group relative  ">
                <span class="text-sm font-body-medium text-grey-600 mr-8 ">{filter.label}:</span>
                <div class="flex  gap-8">
                 {#each filter.options as option}
                    <button 
                        class=" rounded-full text-sm px-24 py-8   m-6 transition-colors
                        {activeFilters[filter.id] === option ? 'bg-primary text-common-white border-secondary' : 'bg-secondary border-grey-200 text-grey-700 hover:border-secondary'}"
                        onclick={() => toggleFilter(filter.id, option)}
                    >
                        {option}
                    </button>
                {/each}
                </div>
               
            </div>
        {/each}
    </div>-->

