<script>
  let { destination } = $props();
  let isExpanded = $state(false);
  
  function toggleDescription() {
    isExpanded = !isExpanded;
  }
</script>

<div class=" group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium  ">
  <!-- Image -->
  <div class="relative h-[140px] overflow-hidden">
    <img 
      src = "https://cm-marketing.directus.app/assets/{destination.image}"
      alt={destination.name} 
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
 
  </div>

  <div class="flex flex-1 flex-col p-16">
    <div class="mb-3 flex flex-col items-left justify-between">
      <h3 class="text-h3 text-h2 text-20/24 font-heading font-heading-bold text-primary caret-transparent">{destination.name}</h3>
      <span class="text-xs font-heading font-body-medium text-grey-600">{destination.country}</span>
    </div>
    <span class="text-xs font-heading font-body-medium text-grey-700 mb-8">{destination.tagline}</span>
    <div class="mb-8">
      <p class="text-14/20 text-grey-700 flex-grow font-heading {isExpanded ? '' : 'line-clamp-2'}">
        {destination.description}
      </p>
      <button 
        onclick={toggleDescription}
        class="mt-4 text-12/16 font-body-medium text-primary hover:text-secondary transition-colors cursor-pointer"
      >
        {isExpanded ? 'Read less' : 'Read more'}
      </button>
    </div>
    <div class="mb-3 flex flex-wrap gap-3">
      {#each destination.categories as cat}
        <span class="rounded-2xl bg-grey-100 px-6 py-3 text-12/16 font-body-medium text-grey-600">
          {cat}
        </span>
      {/each}
    </div>

    <div class="mt-auto flex items-center justify-end border-t border-grey-100 pt-3">
      
      <a 
        href={"/" + destination.landing}
        data-sveltekit-preload-data="off"
        class="button text-14/20 text-white! font-heading py-6 px-12 group-hover:bg-secondary group-hover:border-secondary"
      >
        Book Now
      </a>
    </div>
  </div>
</div>
