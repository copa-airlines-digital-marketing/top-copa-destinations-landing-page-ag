import { t as index_server_exports } from "../../chunks/index-server.js";
import { t as false_default } from "../../chunks/false.js";
import { i as version, o as assets } from "../../chunks/environment.js";
import "../../chunks/shared.js";
import { s as hash } from "../../chunks/exports.js";
import { C as escape_html, D as run, E as noop, b as writable, d as getContext } from "../../chunks/server.js";
import { HttpError, Redirect, SvelteKitError } from "@sveltejs/kit/internal";
import { try_get_request_store } from "@sveltejs/kit/internal/server";
const PRELOAD_PRIORITIES = {
	tap: 1,
	hover: 2,
	viewport: 3,
	eager: 4,
	off: -1,
	false: -1
};
({ ...PRELOAD_PRIORITIES }), PRELOAD_PRIORITIES.hover;
function notifiable_store(value) {
	const store = writable(value);
	let ready = true;
	function notify() {
		ready = true;
		store.update((val) => val);
	}
	function set(new_value) {
		ready = false;
		store.set(new_value);
	}
	function subscribe(run$1) {
		let old_value;
		return store.subscribe((new_value) => {
			if (old_value === void 0 || ready && new_value !== old_value) run$1(old_value = new_value);
		});
	}
	return {
		notify,
		set,
		subscribe
	};
}
const updated_listener = { v: () => {} };
function create_updated_store() {
	const { set, subscribe } = writable(false);
	return {
		subscribe,
		check: async () => false
	};
}
let navigating$2;
let updated$2;
if (noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString())) {
	new URL("https://example.com");
	navigating$2 = { current: null };
	updated$2 = { current: false };
} else {
	new class Page {
		data = {};
		form = null;
		error = null;
		params = {};
		route = { id: null };
		state = {};
		status = -1;
		url = new URL("https://example.com");
	}();
	navigating$2 = new class Navigating {
		current = null;
	}();
	updated$2 = new class Updated {
		current = false;
	}();
	updated_listener.v = () => updated$2.current = true;
}
var { onMount, tick } = index_server_exports;
const stores = {
	url: /* @__PURE__ */ notifiable_store({}),
	page: /* @__PURE__ */ notifiable_store({}),
	navigating: /* @__PURE__ */ writable(null),
	updated: /* @__PURE__ */ create_updated_store()
};
Object.defineProperty({
	get from() {
		return navigating$2.current ? navigating$2.current.from : null;
	},
	get to() {
		return navigating$2.current ? navigating$2.current.to : null;
	},
	get type() {
		return navigating$2.current ? navigating$2.current.type : null;
	},
	get willUnload() {
		return navigating$2.current ? navigating$2.current.willUnload : null;
	},
	get delta() {
		return navigating$2.current ? navigating$2.current.delta : null;
	},
	get complete() {
		return navigating$2.current ? navigating$2.current.complete : null;
	}
}, "current", { get() {
	throw new Error("Replace navigating.current.<prop> with navigating.<prop>");
} });
stores.updated.check;
function context() {
	return getContext("__request__");
}
const page = {
	get data() {
		return context().page.data;
	},
	get error() {
		return context().page.error;
	},
	get form() {
		return context().page.form;
	},
	get params() {
		return context().page.params;
	},
	get route() {
		return context().page.route;
	},
	get state() {
		return context().page.state;
	},
	get status() {
		return context().page.status;
	},
	get url() {
		return context().page.url;
	}
};
function Error$1($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		$$renderer$1.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
	});
}
export { Error$1 as default };
