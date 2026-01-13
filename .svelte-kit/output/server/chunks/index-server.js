import { t as false_default } from "./false.js";
import { D as run, E as noop, T as experimental_async_required, _ as lifecycle_function_unavailable, c as get_render_context, d as getContext, f as hasContext, g as hydratable_serialization_failed, h as hydratable_clobbering, l as createContext, m as ssr_context, p as setContext, s as get_user_code_location, u as getAllContexts, v as getAbortSignal, w as async_mode_flag } from "./server.js";
import * as devalue from "devalue";
var __defProp = Object.defineProperty;
var __export = (all) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	return target;
};
function hydratable(key, fn) {
	if (!async_mode_flag) experimental_async_required("hydratable");
	const { hydratable: hydratable$1 } = get_render_context();
	let entry = hydratable$1.lookup.get(key);
	if (entry !== void 0) return entry.value;
	const value = fn();
	entry = encode(key, value, hydratable$1.unresolved_promises);
	hydratable$1.lookup.set(key, entry);
	return value;
}
function encode(key, value, unresolved) {
	const entry = {
		value,
		serialized: ""
	};
	let uid = 1;
	entry.serialized = devalue.uneval(entry.value, (value$1, uneval) => {
		if (is_promise(value$1)) {
			const placeholder = `"${uid++}"`;
			const p = value$1.then((v) => {
				entry.serialized = entry.serialized.replace(placeholder, `r(${uneval(v)})`);
			}).catch((devalue_error) => hydratable_serialization_failed(key, serialization_stack(entry.stack, devalue_error?.stack)));
			unresolved?.set(p, key);
			p.catch(() => {}).finally(() => unresolved?.delete(p));
			(entry.promises ??= []).push(p);
			return placeholder;
		}
	});
	return entry;
}
function is_promise(value) {
	return Object.prototype.toString.call(value) === "[object Promise]";
}
function serialization_stack(root_stack, uneval_stack) {
	let out = "";
	if (root_stack) out += root_stack + "\n";
	if (uneval_stack) out += "Caused by:\n" + uneval_stack + "\n";
	return out || "<missing stack trace>";
}
function createRawSnippet(fn) {
	return (renderer, ...args) => {
		var getters = args.map((value) => () => value);
		renderer.push(fn(...getters).render().trim());
	};
}
var index_server_exports = /* @__PURE__ */ __export({
	afterUpdate: () => noop,
	beforeUpdate: () => noop,
	createContext: () => createContext,
	createEventDispatcher: () => createEventDispatcher,
	createRawSnippet: () => createRawSnippet,
	flushSync: () => noop,
	fork: () => fork,
	getAbortSignal: () => getAbortSignal,
	getAllContexts: () => getAllContexts,
	getContext: () => getContext,
	hasContext: () => hasContext,
	hydratable: () => hydratable,
	hydrate: () => hydrate,
	mount: () => mount,
	onDestroy: () => onDestroy,
	onMount: () => noop,
	setContext: () => setContext,
	settled: () => settled,
	tick: () => tick,
	unmount: () => unmount,
	untrack: () => run
});
function onDestroy(fn) {
	ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
	return noop;
}
function mount() {
	lifecycle_function_unavailable("mount");
}
function hydrate() {
	lifecycle_function_unavailable("hydrate");
}
function unmount() {
	lifecycle_function_unavailable("unmount");
}
function fork() {
	lifecycle_function_unavailable("fork");
}
async function tick() {}
async function settled() {}
export { tick as n, index_server_exports as t };
