<script>
  let { destination } = $props();
</script>

<div class=" group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium  ">
  <!-- Image -->
  <div class="relative h-[150px] overflow-hidden">
    <img 
      src = "https://cm-marketing.directus.app/assets/{destination.image}"
      alt={destination.name} 
      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
 
  </div>

  <!-- Content -->
  <div class="flex flex-1 flex-col p-24">
    <div class="mb-8 flex flex-col items-left justify-between">
      <h3 class="text-h3 text-h2 text-20/24 font-heading font-heading-bold text-primary caret-transparent">{destination.name}</h3>
      <span class="text-xs font-heading font-body-medium text-grey-600">{destination.country}</span>
    </div>
    <p class="text-14/20 text-grey-700 mb-16 flex-grow font-heading line-clamp-3">
      {destination.description}
    </p>
    <div class="mb-16 flex flex-wrap gap-4">
      {#each destination.categories as cat}
        <span class="rounded bg-grey-100 px-8 py-4 text-12/16 font-body-medium text-grey-600">
          {cat}
        </span>
      {/each}
    </div>

    <div class="mt-auto flex items-center justify-end border-t border-grey-100 pt-4">
      
      <a 
        href={destination.landing}
        class="button text-14/20 text-white! font-heading py-8 px-16 group-hover:bg-secondary group-hover:border-secondary"
      >
        Book Now
      </a>
    </div>
  </div>
</div>
