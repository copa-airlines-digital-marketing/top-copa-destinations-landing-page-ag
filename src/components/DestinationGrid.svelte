<script>
  import DestinationCard from './DestinationCard.svelte';
  
  let { destinations = [] } = $props();
</script>

<div class="container mx-auto py-roomy">
  {#if destinations.length > 0}
    <div class="grid grid-cols-1 px-roomy sm:grid-cols-1 md:grid-cols-2! lg:grid-cols-3! gap-12">
      {#each destinations as city (city.id)}
        <DestinationCard destination={city} />
      {/each}
    </div>
  {:else}
    <div class="flex h-64 flex-col items-center justify-center text-center">
      <h3 class="text-h3 text-grey-600 mb-8">No destinations found</h3>
      <p class="text-grey-500">Try adjusting your filters to see more results.</p>
    </div>
  {/if}
</div>
