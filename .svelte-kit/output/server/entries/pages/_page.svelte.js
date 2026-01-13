import "../../chunks/false.js";
import { C as escape_html, S as attr, n as bind_props, o as stringify, r as ensure_array_like, t as attr_class } from "../../chunks/server.js";
function Hero($$renderer) {
	$$renderer.push(`<div class="container mx-auto"><picture class="mx-auto block py-roomy sm:aspect-[8/8] md:aspect-[26/8] lg:aspect-[28/9]"><source media="(min-width: 960px)" srcset="https://cm-marketing.directus.app/assets/db01d3f8-5b1c-404b-93e0-e8cbd69af1bb" sizes=""/> <img src="https://cm-marketing.directus.app/assets/db01d3f8-5b1c-404b-93e0-e8cbd69af1bb" alt="ConnectMiles Card Promo" class="h-full w-full rounded-2xl object-cover drop-shadow-lg"/></picture> <div class="container mx-auto items-center"><h2 class="text-h2 font-heading text-center text-primary-ultradark font-heading-bold mb-24">Sé parte del lanzamiento de nuestra primera tarjeta ConnectMiles en Estados Unidos.<br/> Completa
      el siguiente formulario y sé de los primeros en utilizarla.</h2></div></div>`);
}
const destinations = [
	{
		id: 1,
		name: "Cancún",
		country: "México",
		image: "5766915a-4092-4508-bf2a-7f82497d9a40",
		categories: [
			"Beach & Relaxation",
			"Trending Destinations",
			"Family-Friendly"
		],
		budget: "$$",
		flightTime: "3.5h",
		season: "Dec-Apr",
		description: "Turquoise waters and white sand beaches await you.",
		price: 350,
		landing: "vuelos-a-cancun"
	},
	{
		id: 2,
		name: "Lima",
		country: "Perú",
		image: "a115a68e-d61f-4b7b-a7a5-21d4328f38ee",
		categories: ["Culture", "Nature & Adventure"],
		budget: "$",
		flightTime: "4h",
		season: "May-Sep",
		description: "The gateway to Machu Picchu and Incan history.",
		price: 420,
		landing: "vuelos-a-lima"
	},
	{
		id: 3,
		name: "Punta Cana",
		country: "República Dominicana",
		image: "/bc16ddb7-8dbe-4c42-b2fb-824dc54f2f4f",
		categories: ["Beach & Relaxation", "Family-Friendly"],
		budget: "$$",
		flightTime: "2.5h",
		season: "Dec-Apr",
		description: "All-inclusive resorts and endless beaches.",
		price: 380,
		landing: "vuelos-a-punta-cana"
	},
	{
		id: 4,
		name: "Buenos Aires",
		country: "Argentina",
		image: "2ffafcd4-aad6-45aa-b561-08ce8233dee0",
		categories: ["Culture", "Trending Destinations"],
		budget: "$$$",
		flightTime: "7h",
		season: "Mar-May",
		description: "European flair with Latin passion.",
		price: 600,
		landing: "vuelos-a-buenos-aires"
	},
	{
		id: 5,
		name: "Costa Rica",
		country: "Costa Rica",
		image: "2b50d3a3-35bf-46b3-b72f-a670521f0e65",
		categories: ["Nature & Adventure", "Family-Friendly"],
		budget: "$$",
		flightTime: "1.5h",
		season: "Dec-Apr",
		description: "Pura Vida! Rainforests, volcanoes, and wildlife.",
		price: 250,
		landing: "vuelos-a-san-jose-costa-rica"
	}
];
const motivationCategories = [
	"Beach & Relaxation",
	"Culture",
	"Trending Destinations",
	"Family-Friendly",
	"Nature & Adventure"
];
function FilterBar($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { activeCategory = "All", activeFilters = {} } = $$props;
		$$renderer$1.push(`<div class="container mx-auto w-full bg-common-white py-24 px-16 sticky top-0 z-50 border-b border-grey-100 flex justify-center"><div class="flex flex-row overflow-x-scroll justify-start gap-8"><button${attr_class(`rounded-full px-24 py-8 border transition-all duration-300 md:font-heading-medium text-14/20 ${stringify(activeCategory === "All" ? "bg-primary text-common-white border-primary" : "bg-common-white text-grey-700 border-grey-300 hover:border-primary")}`)}>All</button> <!--[-->`);
		const each_array = ensure_array_like(motivationCategories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let category = each_array[$$index];
			$$renderer$1.push(`<button${attr_class(`rounded-full px-24 py-8 border transition-all duration-300 md:font-heading-medium text-14/20 ${stringify(activeCategory === category ? "bg-primary text-common-white border-primary" : "bg-common-white text-grey-700 border-grey-300 hover:border-primary")}`)}>${escape_html(category)}</button>`);
		}
		$$renderer$1.push(`<!--]--></div></div>`);
		bind_props($$props, {
			activeCategory,
			activeFilters
		});
	});
}
function DestinationCard($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { destination } = $$props;
		$$renderer$1.push(`<div class="group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium"><div class="relative h-[150px] overflow-hidden"><img${attr("src", `https://cm-marketing.directus.app/assets/${stringify(destination.image)}`)}${attr("alt", destination.name)} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/></div> <div class="flex flex-1 flex-col p-24"><div class="mb-8 flex flex-col items-left justify-between"><h3 class="text-h3 text-h2 text-20/24 font-heading font-heading-bold text-primary caret-transparent">${escape_html(destination.name)}</h3> <span class="text-xs font-heading font-body-medium text-grey-600">${escape_html(destination.country)}</span></div> <p class="text-14/20 text-grey-700 mb-16 flex-grow font-heading line-clamp-3">${escape_html(destination.description)}</p> <div class="mb-16 flex flex-wrap gap-4"><!--[-->`);
		const each_array = ensure_array_like(destination.categories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cat = each_array[$$index];
			$$renderer$1.push(`<span class="rounded bg-grey-100 px-8 py-4 text-12/16 font-body-medium text-grey-600">${escape_html(cat)}</span>`);
		}
		$$renderer$1.push(`<!--]--></div> <div class="mt-auto flex items-center justify-end border-t border-grey-100 pt-4"><a${attr("href", "/" + destination.landing)} data-sveltekit-preload-data="off" class="button text-14/20 text-white! font-heading py-8 px-16 group-hover:bg-secondary group-hover:border-secondary">Book Now</a></div></div></div>`);
	});
}
function DestinationGrid($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { destinations: destinations$1 = [] } = $$props;
		$$renderer$1.push(`<div class="container mx-auto py-roomy">`);
		if (destinations$1.length > 0) {
			$$renderer$1.push("<!--[-->");
			$$renderer$1.push(`<div class="grid grid-cols-1 px-roomy sm:grid-cols-1 md:grid-cols-2! lg:grid-cols-3! gap-12"><!--[-->`);
			const each_array = ensure_array_like(destinations$1);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let city = each_array[$$index];
				DestinationCard($$renderer$1, { destination: city });
			}
			$$renderer$1.push(`<!--]--></div>`);
		} else {
			$$renderer$1.push("<!--[!-->");
			$$renderer$1.push(`<div class="flex h-64 flex-col items-center justify-center text-center"><h3 class="text-h3 text-grey-600 mb-8">No destinations found</h3> <p class="text-grey-500">Try adjusting your filters to see more results.</p></div>`);
		}
		$$renderer$1.push(`<!--]--></div>`);
	});
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let activeCategory = "All";
		let activeFilters = {};
		let filteredDestinations = destinations.filter((dest) => {
			if (activeCategory !== "All" && !dest.categories.includes(activeCategory)) return false;
			if (activeFilters.budget) {
				const targetBudget = {
					"Low ($)": "$",
					"Medium ($$)": "$$",
					"High ($$$)": "$$$"
				}[activeFilters.budget];
				if (dest.budget !== targetBudget) return false;
			}
			if (activeFilters.flightTime) {
				const time = parseFloat(dest.flightTime);
				const filter = activeFilters.flightTime;
				if (filter === "< 3h" && time >= 3) return false;
				if (filter === "3-6h" && (time < 3 || time > 6)) return false;
				if (filter === "> 6h" && time <= 6) return false;
			}
			if (activeFilters.season) {
				if (dest.season !== activeFilters.season) return false;
			}
			return true;
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			$$renderer$2.push(`<main class="bg-background-paper min-h-screen">`);
			Hero($$renderer$2, {});
			$$renderer$2.push(`<!----> `);
			FilterBar($$renderer$2, {
				get activeCategory() {
					return activeCategory;
				},
				set activeCategory($$value) {
					activeCategory = $$value;
					$$settled = false;
				},
				get activeFilters() {
					return activeFilters;
				},
				set activeFilters($$value) {
					activeFilters = $$value;
					$$settled = false;
				}
			});
			$$renderer$2.push(`<!----> `);
			DestinationGrid($$renderer$2, { destinations: filteredDestinations });
			$$renderer$2.push(`<!----></main>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
export { _page as default };
