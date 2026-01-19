<script>
  let { 
    activeCategory = $bindable('All'), 
    activeFilters = $bindable({}),
    categories = []
  } = $props();

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
  <div class="flex justify-center items-center overflow-x-auto hide-scroll gap-4 sm:gap-6 md:gap-8 px-8 sm:px-12 md:px-16 lg:px-24">
    <button 
      class="rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0
      {activeCategory === 'All' ? 'bg-primary text-common-white border-primary' : 'bg-common-white text-grey-700 border-grey-300 hover:border-primary'}"
      onclick={() => setCategory('All')}
    >
      All
    </button>
    {#each categories as category}
      <button 
        class="rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0
        {activeCategory === category ? 'bg-primary text-common-white border-primary' : 'bg-common-white text-grey-700 border-grey-300 hover:border-primary'}"
        onclick={() => setCategory(category)}
      >
        {category}
      </button>
    {/each}
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

