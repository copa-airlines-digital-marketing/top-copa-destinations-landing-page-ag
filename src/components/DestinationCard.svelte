<script>
  let { destination } = $props();
</script>

<div class="group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium hover:shadow-large transition-shadow duration-300">
  <!-- Image -->
  <div class="relative h-597 overflow-hidden">
    <img 
      src = "https://cm-marketing.directus.app/assets/{destination.image}"
      alt={destination.name} 
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div class="absolute top-16 right-16 rounded-full bg-common-white/80 px-12 py-4 text-xs font-heading-bold backdrop-blur-sm">
      {destination.budget}
    </div>
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col p-24">
    <div class="mb-8 flex flex-col items-left justify-between">
      <h3 class="text-h3 
      font-heading text-h2 text-20/24 font-heading-bold max-w-prose text-primary   caret-transparent
      
      ">{destination.name}</h3>
      <span class="text-xs font-body-medium text-grey-600">{destination.country}</span>
    </div>

    <p class="text-14/20 text-grey-700 mb-16 flex-grow line-clamp-3">
      {destination.description}
    </p>

    <div class="mb-16 flex flex-wrap gap-4">
      {#each destination.categories as cat}
        <span class="rounded bg-grey-100 px-8 py-4 text-12/16 font-body-medium text-grey-600">
          {cat}
        </span>
      {/each}
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-grey-100 pt-16">
      <div>
        <span class="block text-xs text-grey-500">From</span>
        <span class="text-h3 font-heading-bold text-primary">${destination.price}</span>
      </div>
      <a 
        href="#" 
        class="button text-14/20 py-8 px-16 group-hover:bg-secondary group-hover:border-secondary"
      >
        Book Now
      </a>
    </div>
  </div>
</div>
