import { n as tick } from "../../chunks/index-server.js";
import "../../chunks/false.js";
import { C as escape_html, E as noop, S as attr, n as bind_props, o as stringify, r as ensure_array_like, t as attr_class } from "../../chunks/server.js";
function Hero($$renderer) {
	$$renderer.push(`<div class="container mx-auto pt-4"><h1 class="text-h1 font-heading text-center text-primary font-heading-bold mb-24">Top Copa destinations 2026</h1> <h2 class="text-h4 font-heading text-center mb-24">Travel trends are constantly evolving, but certain destinations consistently capture the attention of modern travelers. Currently, there's a strong pull toward cities, beaches, and nature retreats that offer excitement, activity, or simply effortless enjoyment, often fitting perfectly into getaways or as part of a longer itinerary.</h2> <h2 class="text-h5 font-heading text-center mb-24">These cities range from vibrant cultural capitals to relaxed coastal spots. <br/> Thanks to convenient connections throughout the Americas, reaching these destinations is made easy and efficient with Copa Airlines.</h2></div>`);
}
function FilterBar($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { activeCategory = "All", activeFilters = {}, categories = [], getAnchorFromCategory = () => null } = $$props;
		$$renderer$1.push(`<div class="w-full bg-common-white py-12 sm:py-16 md:py-20 lg:py-24 sticky top-0 z-50 border-b border-grey-100"><div class="flex justify-center items-center overflow-x-auto hide-scroll gap-4 sm:gap-6 md:gap-8 px-8 sm:px-12 md:px-16 lg:px-24"><button${attr_class(`rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0 ${stringify(activeCategory === "All" ? "bg-primary text-common-white border-primary" : "bg-common-white text-grey-700 border-grey-300 hover:border-primary")}`)}>All</button> <!--[-->`);
		const each_array = ensure_array_like(categories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let category = each_array[$$index];
			$$renderer$1.push(`<button${attr_class(`rounded-full p-12 px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-7 md:py-8 border transition-all duration-300 font-heading-medium text-12/16 sm:text-14/20 whitespace-nowrap shrink-0 ${stringify(activeCategory === category ? "bg-primary text-common-white border-primary" : "bg-common-white text-grey-700 border-grey-300 hover:border-primary")}`)}>${escape_html(category)}</button>`);
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
		$$renderer$1.push(`<div class="group relative flex flex-col overflow-hidden rounded-2xl bg-common-white shadow-medium"><div class="relative h-[140px] overflow-hidden"><img${attr("src", `https://cm-marketing.directus.app/assets/${stringify(destination.image)}`)}${attr("alt", destination.name)} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/></div> <div class="flex flex-1 flex-col p-16"><div class="mb-3 flex flex-col items-left justify-between"><h3 class="text-h3 text-h2 text-20/24 font-heading font-heading-bold text-primary caret-transparent">${escape_html(destination.name)}</h3> <span class="text-xs font-heading font-body-medium text-grey-600">${escape_html(destination.country)}</span></div> <span class="text-xs font-heading font-body-medium text-grey-700 mb-8">${escape_html(destination.tagline)}</span> <div class="mb-8"><p${attr_class(`text-14/20 text-grey-700 flex-grow font-heading ${stringify("line-clamp-2")}`)}>${escape_html(destination.description)}</p> <button class="mt-4 text-12/16 font-body-medium text-primary hover:text-secondary transition-colors cursor-pointer">${escape_html("Read more")}</button></div> <div class="mb-3 flex flex-wrap gap-3"><!--[-->`);
		const each_array = ensure_array_like(destination.categories);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let cat = each_array[$$index];
			$$renderer$1.push(`<span class="rounded-2xl bg-grey-100 px-6 py-3 text-12/16 font-body-medium text-grey-600">${escape_html(cat)}</span>`);
		}
		$$renderer$1.push(`<!--]--></div> <div class="mt-auto flex items-center justify-end border-t border-grey-100 pt-3"><a${attr("href", "/" + destination.landing)} data-sveltekit-preload-data="off" class="button text-14/20 text-white! font-heading py-6 px-12 group-hover:bg-secondary group-hover:border-secondary">Book Now</a></div></div></div>`);
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
const motivationCategories = {
	en: [
		"Beach & Relaxation",
		"Culture",
		"Trending Destinations",
		"Family-Friendly",
		"Nature & Adventure"
	],
	es: [
		"Playa y descanso",
		"Cultura",
		"Destinos en tendencia",
		"Ideal para familias",
		"Naturaleza y aventura"
	],
	pt: [
		"Praia e descanso",
		"Cultura",
		"Destinos em alta",
		"Para toda a família",
		"Natureza e aventura"
	]
};
function getLocalizedCategories(lang, motivationCategories$1) {
	return motivationCategories$1[lang] || motivationCategories$1.en || [];
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let activeCategory = "All";
		let activeFilters = {};
		let currentLang = "es";
		let storefrontFilteredDestinations = [];
		const categoryMap = {
			en: {
				"Beach & Relaxation": "Beach & Relaxation",
				"Culture": "Culture",
				"Trending Destinations": "Trending Destinations",
				"Family-Friendly": "Family-Friendly",
				"Nature & Adventure": "Nature & Adventure"
			},
			es: {
				"Playa y descanso": "Beach & Relaxation",
				"Cultura": "Culture",
				"Destinos en tendencia": "Trending Destinations",
				"Ideal para familias": "Family-Friendly",
				"Naturaleza y aventura": "Nature & Adventure"
			},
			pt: {
				"Praia e descanso": "Beach & Relaxation",
				"Cultura": "Culture",
				"Destinos em alta": "Trending Destinations",
				"Para toda a família": "Family-Friendly",
				"Natureza e aventura": "Nature & Adventure"
			}
		};
		const categoryToAnchor = {
			"Beach & Relaxation": "pl",
			"Culture": "cu",
			"Trending Destinations": "tr",
			"Family-Friendly": "fa",
			"Nature & Adventure": "na"
		};
		function getAnchorFromCategory(category) {
			if (category === "All") return null;
			return categoryToAnchor[categoryMap[currentLang]?.[category] || category] || null;
		}
		let filteredDestinations = storefrontFilteredDestinations.filter((dest) => {
			if (activeCategory !== "All") {
				const englishCategory = categoryMap[currentLang]?.[activeCategory] || activeCategory;
				if (!dest.categories.includes(englishCategory)) return false;
			}
			const budget = activeFilters?.["budget"];
			if (budget) {
				const targetBudget = {
					"Low ($)": "$",
					"Medium ($$)": "$$",
					"High ($$$)": "$$$"
				}[budget];
				if (dest.budget !== targetBudget) return false;
			}
			const flightTime = activeFilters?.["flightTime"];
			if (flightTime) {
				const time = parseFloat(dest.flightTime);
				if (flightTime === "< 3h" && time >= 3) return false;
				if (flightTime === "3-6h" && (time < 3 || time > 6)) return false;
				if (flightTime === "> 6h" && time <= 6) return false;
			}
			const season = activeFilters?.["season"];
			if (season) {
				if (dest.season !== season) return false;
			}
			return true;
		});
		let localizedCategories = getLocalizedCategories(currentLang, motivationCategories);
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			$$renderer$2.push(`<main class="container mx-auto min-h-screen">`);
			Hero($$renderer$2, {});
			$$renderer$2.push(`<!----> `);
			FilterBar($$renderer$2, {
				categories: localizedCategories,
				getAnchorFromCategory,
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
