import "./chunks/index-server.js";
import { t as false_default } from "./chunks/false.js";
import { a as app_dir, c as override, l as relative, o as assets, s as base, u as reset } from "./chunks/environment.js";
import { a as stringify, c as validate_load_response, d as text_decoder, f as text_encoder, i as parse_remote_arg, l as base64_encode, n as TRAILING_SLASH_PARAM, r as create_remote_key, s as validate_depends, t as INVALIDATED_PARAM, u as get_relative_path } from "./chunks/shared.js";
import { i as deserialize_binary_form, t as BINARY_FORM_CONTENT_TYPE } from "./chunks/form-utils.js";
import { C as coalesce_to_error, E as normalize_error, S as compact, T as get_status, _ as add_resolution_suffix, a as validate_server_exports, b as strip_data_suffix, c as SCHEME, d as disable_search, f as make_trackable, g as add_data_suffix, h as noop_span, i as validate_page_server_exports, l as decode_params, m as resolve, n as validate_layout_server_exports, o as exec, p as normalize_path, r as validate_page_exports, s as hash, t as validate_layout_exports, u as decode_pathname, v as has_data_suffix, w as get_message, x as strip_resolution_suffix, y as has_resolution_suffix } from "./chunks/exports.js";
import { a as set_read_implementation, c as set_private_env, i as set_manifest, l as set_public_env, n as options, o as fix_stack_trace, r as read_implementation, s as public_env, t as get_hooks } from "./chunks/internal.js";
import { b as writable, y as readable } from "./chunks/server.js";
import { error, json, text } from "@sveltejs/kit";
import { ActionFailure, HttpError, Redirect, SvelteKitError } from "@sveltejs/kit/internal";
import { merge_tracing, try_get_request_store, with_request_store } from "@sveltejs/kit/internal/server";
import * as devalue from "devalue";
import { parse as parse$1, serialize } from "cookie";
import * as set_cookie_parser from "set-cookie-parser";
function with_resolvers() {
	let resolve$1;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve$1 = res;
			reject = rej;
		}),
		resolve: resolve$1,
		reject
	};
}
const NULL_BODY_STATUS = [
	101,
	103,
	204,
	205,
	304
];
const IN_WEBCONTAINER = !!globalThis.process?.versions?.webcontainer;
const ENDPOINT_METHODS = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
	"HEAD"
];
const PAGE_METHODS = [
	"GET",
	"POST",
	"HEAD"
];
function negotiate(accept, types) {
	const parts = [];
	accept.split(",").forEach((str, i) => {
		const match = /([^/ \t]+)\/([^; \t]+)[ \t]*(?:;[ \t]*q=([0-9.]+))?/.exec(str);
		if (match) {
			const [, type, subtype, q = "1"] = match;
			parts.push({
				type,
				subtype,
				q: +q,
				i
			});
		}
	});
	parts.sort((a, b) => {
		if (a.q !== b.q) return b.q - a.q;
		if (a.subtype === "*" !== (b.subtype === "*")) return a.subtype === "*" ? 1 : -1;
		if (a.type === "*" !== (b.type === "*")) return a.type === "*" ? 1 : -1;
		return a.i - b.i;
	});
	let accepted;
	let min_priority = Infinity;
	for (const mimetype of types) {
		const [type, subtype] = mimetype.split("/");
		const priority = parts.findIndex((part) => (part.type === type || part.type === "*") && (part.subtype === subtype || part.subtype === "*"));
		if (priority !== -1 && priority < min_priority) {
			accepted = mimetype;
			min_priority = priority;
		}
	}
	return accepted;
}
function is_content_type(request, ...types) {
	const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
	return types.includes(type.toLowerCase());
}
function is_form_content_type(request) {
	return is_content_type(request, "application/x-www-form-urlencoded", "multipart/form-data", "text/plain", BINARY_FORM_CONTENT_TYPE);
}
var escape_html_attr_dict = {
	"&": "&amp;",
	"\"": "&quot;"
};
var escape_html_dict = {
	"&": "&amp;",
	"<": "&lt;"
};
var escape_html_attr_regex = new RegExp(`[${Object.keys(escape_html_attr_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
var escape_html_regex = new RegExp(`[${Object.keys(escape_html_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
function escape_html(str, is_attr) {
	const dict = is_attr ? escape_html_attr_dict : escape_html_dict;
	return str.replace(is_attr ? escape_html_attr_regex : escape_html_regex, (match) => {
		if (match.length === 2) return match;
		return dict[match] ?? `&#${match.charCodeAt(0)};`;
	});
}
function method_not_allowed(mod, method) {
	return text(`${method} method not allowed`, {
		status: 405,
		headers: { allow: allowed_methods(mod).join(", ") }
	});
}
function allowed_methods(mod) {
	const allowed = ENDPOINT_METHODS.filter((method) => method in mod);
	if ("GET" in mod && !("HEAD" in mod)) allowed.push("HEAD");
	return allowed;
}
function get_global_name(options$1) {
	return `__sveltekit_${options$1.version_hash}`;
}
function static_error_page(options$1, status, message) {
	return text(options$1.templates.error({
		status,
		message: escape_html(message)
	}), {
		headers: { "content-type": "text/html; charset=utf-8" },
		status
	});
}
async function handle_fatal_error(event, state, options$1, error$1) {
	error$1 = error$1 instanceof HttpError ? error$1 : coalesce_to_error(error$1);
	const status = get_status(error$1);
	const body$1 = await handle_error_and_jsonify(event, state, options$1, error$1);
	const type = negotiate(event.request.headers.get("accept") || "text/html", ["application/json", "text/html"]);
	if (event.isDataRequest || type === "application/json") return json(body$1, { status });
	return static_error_page(options$1, status, body$1.message);
}
async function handle_error_and_jsonify(event, state, options$1, error$1) {
	if (error$1 instanceof HttpError) return {
		message: "Unknown Error",
		...error$1.body
	};
	const status = get_status(error$1);
	const message = get_message(error$1);
	return await with_request_store({
		event,
		state
	}, () => options$1.hooks.handleError({
		error: error$1,
		event,
		status,
		message
	})) ?? { message };
}
function redirect_response(status, location) {
	return new Response(void 0, {
		status,
		headers: { location }
	});
}
function clarify_devalue_error(event, error$1) {
	if (error$1.path) return `Data returned from \`load\` while rendering ${event.route.id} is not serializable: ${error$1.message} (${error$1.path}). If you need to serialize/deserialize custom types, use transport hooks: https://svelte.dev/docs/kit/hooks#Universal-hooks-transport.`;
	if (error$1.path === "") return `Data returned from \`load\` while rendering ${event.route.id} is not a plain object`;
	return error$1.message;
}
function serialize_uses(node) {
	const uses = {};
	if (node.uses && node.uses.dependencies.size > 0) uses.dependencies = Array.from(node.uses.dependencies);
	if (node.uses && node.uses.search_params.size > 0) uses.search_params = Array.from(node.uses.search_params);
	if (node.uses && node.uses.params.size > 0) uses.params = Array.from(node.uses.params);
	if (node.uses?.parent) uses.parent = 1;
	if (node.uses?.route) uses.route = 1;
	if (node.uses?.url) uses.url = 1;
	return uses;
}
function has_prerendered_path(manifest, pathname) {
	return manifest._.prerendered_routes.has(pathname) || pathname.at(-1) === "/" && manifest._.prerendered_routes.has(pathname.slice(0, -1));
}
function format_server_error(status, error$1, event) {
	const formatted_text = `\n\x1b[1;31m[${status}] ${event.request.method} ${event.url.pathname}\x1b[0m`;
	if (status === 404) return formatted_text;
	return `${formatted_text}\n${error$1.stack}`;
}
function get_node_type(node_id) {
	const filename = (node_id?.split("/"))?.at(-1);
	if (!filename) return "unknown";
	return filename.split(".").slice(0, -1).join(".");
}
async function render_endpoint(event, event_state, mod, state) {
	const method = event.request.method;
	let handler = mod[method] || mod.fallback;
	if (method === "HEAD" && !mod.HEAD && mod.GET) handler = mod.GET;
	if (!handler) return method_not_allowed(mod, method);
	const prerender = mod.prerender ?? state.prerender_default;
	if (prerender && (mod.POST || mod.PATCH || mod.PUT || mod.DELETE)) throw new Error("Cannot prerender endpoints that have mutative methods");
	if (state.prerendering && !state.prerendering.inside_reroute && !prerender) if (state.depth > 0) throw new Error(`${event.route.id} is not prerenderable`);
	else return new Response(void 0, { status: 204 });
	event_state.is_endpoint_request = true;
	try {
		const response = await with_request_store({
			event,
			state: event_state
		}, () => handler(event));
		if (!(response instanceof Response)) throw new Error(`Invalid response from route ${event.url.pathname}: handler should return a Response object`);
		if (state.prerendering && (!state.prerendering.inside_reroute || prerender)) {
			const cloned = new Response(response.clone().body, {
				status: response.status,
				statusText: response.statusText,
				headers: new Headers(response.headers)
			});
			cloned.headers.set("x-sveltekit-prerender", String(prerender));
			if (state.prerendering.inside_reroute && prerender) {
				cloned.headers.set("x-sveltekit-routeid", encodeURI(event.route.id));
				state.prerendering.dependencies.set(event.url.pathname, {
					response: cloned,
					body: null
				});
			} else return cloned;
		}
		return response;
	} catch (e) {
		if (e instanceof Redirect) return new Response(void 0, {
			status: e.status,
			headers: { location: e.location }
		});
		throw e;
	}
}
function is_endpoint_request(event) {
	const { method, headers: headers$1 } = event.request;
	if (ENDPOINT_METHODS.includes(method) && !PAGE_METHODS.includes(method)) return true;
	if (method === "POST" && headers$1.get("x-sveltekit-action") === "true") return false;
	return negotiate(event.request.headers.get("accept") ?? "*/*", ["*", "text/html"]) !== "text/html";
}
async function record_span({ name, attributes, fn }) {
	return fn(noop_span);
}
function is_action_json_request(event) {
	return negotiate(event.request.headers.get("accept") ?? "*/*", ["application/json", "text/html"]) === "application/json" && event.request.method === "POST";
}
async function handle_action_json_request(event, event_state, options$1, server) {
	const actions = server?.actions;
	if (!actions) {
		const no_actions_error = new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`);
		return action_json({
			type: "error",
			error: await handle_error_and_jsonify(event, event_state, options$1, no_actions_error)
		}, {
			status: no_actions_error.status,
			headers: { allow: "GET" }
		});
	}
	check_named_default_separate(actions);
	try {
		const data = await call_action(event, event_state, actions);
		if (data instanceof ActionFailure) return action_json({
			type: "failure",
			status: data.status,
			data: stringify_action_response(data.data, event.route.id, options$1.hooks.transport)
		});
		else return action_json({
			type: "success",
			status: data ? 200 : 204,
			data: stringify_action_response(data, event.route.id, options$1.hooks.transport)
		});
	} catch (e) {
		const err = normalize_error(e);
		if (err instanceof Redirect) return action_json_redirect(err);
		return action_json({
			type: "error",
			error: await handle_error_and_jsonify(event, event_state, options$1, check_incorrect_fail_use(err))
		}, { status: get_status(err) });
	}
}
function check_incorrect_fail_use(error$1) {
	return error$1 instanceof ActionFailure ? /* @__PURE__ */ new Error("Cannot \"throw fail()\". Use \"return fail()\"") : error$1;
}
function action_json_redirect(redirect) {
	return action_json({
		type: "redirect",
		status: redirect.status,
		location: redirect.location
	});
}
function action_json(data, init$1) {
	return json(data, init$1);
}
function is_action_request(event) {
	return event.request.method === "POST";
}
async function handle_action_request(event, event_state, server) {
	const actions = server?.actions;
	if (!actions) {
		event.setHeaders({ allow: "GET" });
		return {
			type: "error",
			error: new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`)
		};
	}
	check_named_default_separate(actions);
	try {
		const data = await call_action(event, event_state, actions);
		if (data instanceof ActionFailure) return {
			type: "failure",
			status: data.status,
			data: data.data
		};
		else return {
			type: "success",
			status: 200,
			data
		};
	} catch (e) {
		const err = normalize_error(e);
		if (err instanceof Redirect) return {
			type: "redirect",
			status: err.status,
			location: err.location
		};
		return {
			type: "error",
			error: check_incorrect_fail_use(err)
		};
	}
}
function check_named_default_separate(actions) {
	if (actions.default && Object.keys(actions).length > 1) throw new Error("When using named actions, the default action cannot be used. See the docs for more info: https://svelte.dev/docs/kit/form-actions#named-actions");
}
async function call_action(event, event_state, actions) {
	const url = new URL(event.request.url);
	let name = "default";
	for (const param of url.searchParams) if (param[0].startsWith("/")) {
		name = param[0].slice(1);
		if (name === "default") throw new Error("Cannot use reserved action name \"default\"");
		break;
	}
	const action = actions[name];
	if (!action) throw new SvelteKitError(404, "Not Found", `No action with name '${name}' found`);
	if (!is_form_content_type(event.request)) throw new SvelteKitError(415, "Unsupported Media Type", `Form actions expect form-encoded data — received ${event.request.headers.get("content-type")}`);
	return record_span({
		name: "sveltekit.form_action",
		attributes: {
			"sveltekit.form_action.name": name,
			"http.route": event.route.id || "unknown"
		},
		fn: async (current$1) => {
			const traced_event = merge_tracing(event, current$1);
			const result = await with_request_store({
				event: traced_event,
				state: event_state
			}, () => action(traced_event));
			if (result instanceof ActionFailure) current$1.setAttributes({
				"sveltekit.form_action.result.type": "failure",
				"sveltekit.form_action.result.status": result.status
			});
			return result;
		}
	});
}
function uneval_action_response(data, route_id, transport) {
	const replacer = (thing) => {
		for (const key$1 in transport) {
			const encoded = transport[key$1].encode(thing);
			if (encoded) return `app.decode('${key$1}', ${devalue.uneval(encoded, replacer)})`;
		}
	};
	return try_serialize(data, (value) => devalue.uneval(value, replacer), route_id);
}
function stringify_action_response(data, route_id, transport) {
	const encoders = Object.fromEntries(Object.entries(transport).map(([key$1, value]) => [key$1, value.encode]));
	return try_serialize(data, (value) => devalue.stringify(value, encoders), route_id);
}
function try_serialize(data, fn, route_id) {
	try {
		return fn(data);
	} catch (e) {
		const error$1 = e;
		if (data instanceof Response) throw new Error(`Data returned from action inside ${route_id} is not serializable. Form actions need to return plain objects or fail(). E.g. return { success: true } or return fail(400, { message: "invalid" });`);
		if ("path" in error$1) {
			let message = `Data returned from action inside ${route_id} is not serializable: ${error$1.message}`;
			if (error$1.path !== "") message += ` (data.${error$1.path})`;
			throw new Error(message);
		}
		throw error$1;
	}
}
function create_async_iterator() {
	let resolved = -1;
	let returned = -1;
	const deferred = [];
	return {
		iterate: (transform = (x) => x) => {
			return { [Symbol.asyncIterator]() {
				return { next: async () => {
					const next = deferred[++returned];
					if (!next) return {
						value: null,
						done: true
					};
					return {
						value: transform(await next.promise),
						done: false
					};
				} };
			} };
		},
		add: (promise) => {
			deferred.push(with_resolvers());
			promise.then((value) => {
				deferred[++resolved].resolve(value);
			});
		}
	};
}
function server_data_serializer(event, event_state, options$1) {
	let promise_id = 1;
	let max_nodes = -1;
	const iterator = create_async_iterator();
	const global = get_global_name(options$1);
	function get_replacer(index) {
		return function replacer(thing) {
			if (typeof thing?.then === "function") {
				const id = promise_id++;
				const promise = thing.then((data) => ({ data })).catch(async (error$1) => ({ error: await handle_error_and_jsonify(event, event_state, options$1, error$1) })).then(async ({ data, error: error$1 }) => {
					let str;
					try {
						str = devalue.uneval(error$1 ? [, error$1] : [data], replacer);
					} catch {
						error$1 = await handle_error_and_jsonify(event, event_state, options$1, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
						data = void 0;
						str = devalue.uneval([, error$1], replacer);
					}
					return {
						index,
						str: `${global}.resolve(${id}, ${str.includes("app.decode") ? `(app) => ${str}` : `() => ${str}`})`
					};
				});
				iterator.add(promise);
				return `${global}.defer(${id})`;
			} else for (const key$1 in options$1.hooks.transport) {
				const encoded = options$1.hooks.transport[key$1].encode(thing);
				if (encoded) return `app.decode('${key$1}', ${devalue.uneval(encoded, replacer)})`;
			}
		};
	}
	const strings = [];
	return {
		set_max_nodes(i) {
			max_nodes = i;
		},
		add_node(i, node) {
			try {
				if (!node) {
					strings[i] = "null";
					return;
				}
				const payload = {
					type: "data",
					data: node.data,
					uses: serialize_uses(node)
				};
				if (node.slash) payload.slash = node.slash;
				strings[i] = devalue.uneval(payload, get_replacer(i));
			} catch (e) {
				e.path = e.path.slice(1);
				throw new Error(clarify_devalue_error(event, e));
			}
		},
		get_data(csp) {
			const open = `<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>`;
			const close = `<\/script>\n`;
			return {
				data: `[${compact(max_nodes > -1 ? strings.slice(0, max_nodes) : strings).join(",")}]`,
				chunks: promise_id > 1 ? iterator.iterate(({ index, str }) => {
					if (max_nodes > -1 && index >= max_nodes) return "";
					return open + str + close;
				}) : null
			};
		}
	};
}
function server_data_serializer_json(event, event_state, options$1) {
	let promise_id = 1;
	const iterator = create_async_iterator();
	const reducers = {
		...Object.fromEntries(Object.entries(options$1.hooks.transport).map(([key$1, value]) => [key$1, value.encode])),
		Promise: (thing) => {
			if (typeof thing?.then !== "function") return;
			const id = promise_id++;
			let key$1 = "data";
			const promise = thing.catch(async (e) => {
				key$1 = "error";
				return handle_error_and_jsonify(event, event_state, options$1, e);
			}).then(async (value) => {
				let str;
				try {
					str = devalue.stringify(value, reducers);
				} catch {
					const error$1 = await handle_error_and_jsonify(event, event_state, options$1, /* @__PURE__ */ new Error(`Failed to serialize promise while rendering ${event.route.id}`));
					key$1 = "error";
					str = devalue.stringify(error$1, reducers);
				}
				return `{"type":"chunk","id":${id},"${key$1}":${str}}\n`;
			});
			iterator.add(promise);
			return id;
		}
	};
	const strings = [];
	return {
		add_node(i, node) {
			try {
				if (!node) {
					strings[i] = "null";
					return;
				}
				if (node.type === "error" || node.type === "skip") {
					strings[i] = JSON.stringify(node);
					return;
				}
				strings[i] = `{"type":"data","data":${devalue.stringify(node.data, reducers)},"uses":${JSON.stringify(serialize_uses(node))}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
			} catch (e) {
				e.path = "data" + e.path;
				throw new Error(clarify_devalue_error(event, e));
			}
		},
		get_data() {
			return {
				data: `{"type":"data","nodes":[${strings.join(",")}]}\n`,
				chunks: promise_id > 1 ? iterator.iterate() : null
			};
		}
	};
}
async function load_server_data({ event, event_state, state, node, parent }) {
	if (!node?.server) return null;
	let is_tracking = true;
	const uses = {
		dependencies: /* @__PURE__ */ new Set(),
		params: /* @__PURE__ */ new Set(),
		parent: false,
		route: false,
		url: false,
		search_params: /* @__PURE__ */ new Set()
	};
	const load = node.server.load;
	const slash = node.server.trailingSlash;
	if (!load) return {
		type: "data",
		data: null,
		uses,
		slash
	};
	const url = make_trackable(event.url, () => {
		if (is_tracking) uses.url = true;
	}, (param) => {
		if (is_tracking) uses.search_params.add(param);
	});
	if (state.prerendering) disable_search(url);
	return {
		type: "data",
		data: await record_span({
			name: "sveltekit.load",
			attributes: {
				"sveltekit.load.node_id": node.server_id || "unknown",
				"sveltekit.load.node_type": get_node_type(node.server_id),
				"sveltekit.load.environment": "server",
				"http.route": event.route.id || "unknown"
			},
			fn: async (current$1) => {
				const traced_event = merge_tracing(event, current$1);
				return await with_request_store({
					event: traced_event,
					state: event_state
				}, () => load.call(null, {
					...traced_event,
					fetch: (info, init$1) => {
						new URL(info instanceof Request ? info.url : info, event.url);
						return event.fetch(info, init$1);
					},
					depends: (...deps) => {
						for (const dep of deps) {
							const { href } = new URL(dep, event.url);
							uses.dependencies.add(href);
						}
					},
					params: new Proxy(event.params, { get: (target, key$1) => {
						if (is_tracking) uses.params.add(key$1);
						return target[key$1];
					} }),
					parent: async () => {
						if (is_tracking) uses.parent = true;
						return parent();
					},
					route: new Proxy(event.route, { get: (target, key$1) => {
						if (is_tracking) uses.route = true;
						return target[key$1];
					} }),
					url,
					untrack(fn) {
						is_tracking = false;
						try {
							return fn();
						} finally {
							is_tracking = true;
						}
					}
				}));
			}
		}) ?? null,
		uses,
		slash
	};
}
async function load_data({ event, event_state, fetched, node, parent, server_data_promise, state, resolve_opts, csr }) {
	const server_data_node = await server_data_promise;
	const load = node?.universal?.load;
	if (!load) return server_data_node?.data ?? null;
	return await record_span({
		name: "sveltekit.load",
		attributes: {
			"sveltekit.load.node_id": node.universal_id || "unknown",
			"sveltekit.load.node_type": get_node_type(node.universal_id),
			"sveltekit.load.environment": "server",
			"http.route": event.route.id || "unknown"
		},
		fn: async (current$1) => {
			const traced_event = merge_tracing(event, current$1);
			return await with_request_store({
				event: traced_event,
				state: event_state
			}, () => load.call(null, {
				url: event.url,
				params: event.params,
				data: server_data_node?.data ?? null,
				route: event.route,
				fetch: create_universal_fetch(event, state, fetched, csr, resolve_opts),
				setHeaders: event.setHeaders,
				depends: () => {},
				parent,
				untrack: (fn) => fn(),
				tracing: traced_event.tracing
			}));
		}
	}) ?? null;
}
function create_universal_fetch(event, state, fetched, csr, resolve_opts) {
	const universal_fetch = async (input, init$1) => {
		const cloned_body = input instanceof Request && input.body ? input.clone().body : null;
		const cloned_headers = input instanceof Request && [...input.headers].length ? new Headers(input.headers) : init$1?.headers;
		let response = await event.fetch(input, init$1);
		const url = new URL(input instanceof Request ? input.url : input, event.url);
		const same_origin = url.origin === event.url.origin;
		let dependency;
		if (same_origin) {
			if (state.prerendering) {
				dependency = {
					response,
					body: null
				};
				state.prerendering.dependencies.set(url.pathname, dependency);
			}
		} else if (url.protocol === "https:" || url.protocol === "http:") if ((input instanceof Request ? input.mode : init$1?.mode ?? "cors") === "no-cors") response = new Response("", {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers
		});
		else {
			const acao = response.headers.get("access-control-allow-origin");
			if (!acao || acao !== event.url.origin && acao !== "*") throw new Error(`CORS error: ${acao ? "Incorrect" : "No"} 'Access-Control-Allow-Origin' header is present on the requested resource`);
		}
		let teed_body;
		const proxy = new Proxy(response, { get(response$1, key$1, receiver) {
			async function push_fetched(body$1, is_b64) {
				const status_number = Number(response$1.status);
				if (isNaN(status_number)) throw new Error(`response.status is not a number. value: "${response$1.status}" type: ${typeof response$1.status}`);
				fetched.push({
					url: same_origin ? url.href.slice(event.url.origin.length) : url.href,
					method: event.request.method,
					request_body: input instanceof Request && cloned_body ? await stream_to_string(cloned_body) : init$1?.body,
					request_headers: cloned_headers,
					response_body: body$1,
					response: response$1,
					is_b64
				});
			}
			if (key$1 === "body") {
				if (response$1.body === null) return null;
				if (teed_body) return teed_body;
				const [a, b] = response$1.body.tee();
				(async () => {
					let result = new Uint8Array();
					for await (const chunk of a) {
						const combined = new Uint8Array(result.length + chunk.length);
						combined.set(result, 0);
						combined.set(chunk, result.length);
						result = combined;
					}
					if (dependency) dependency.body = new Uint8Array(result);
					push_fetched(base64_encode(result), true);
				})();
				return teed_body = b;
			}
			if (key$1 === "arrayBuffer") return async () => {
				const buffer = await response$1.arrayBuffer();
				const bytes = new Uint8Array(buffer);
				if (dependency) dependency.body = bytes;
				if (buffer instanceof ArrayBuffer) await push_fetched(base64_encode(bytes), true);
				return buffer;
			};
			async function text$1() {
				const body$1 = await response$1.text();
				if (body$1 === "" && NULL_BODY_STATUS.includes(response$1.status)) {
					await push_fetched(void 0, false);
					return;
				}
				if (!body$1 || typeof body$1 === "string") await push_fetched(body$1, false);
				if (dependency) dependency.body = body$1;
				return body$1;
			}
			if (key$1 === "text") return text$1;
			if (key$1 === "json") return async () => {
				const body$1 = await text$1();
				return body$1 ? JSON.parse(body$1) : void 0;
			};
			const value = Reflect.get(response$1, key$1, response$1);
			if (value instanceof Function) return Object.defineProperties(function() {
				return Reflect.apply(value, this === receiver ? response$1 : this, arguments);
			}, {
				name: { value: value.name },
				length: { value: value.length }
			});
			return value;
		} });
		if (csr) {
			const get = response.headers.get;
			response.headers.get = (key$1) => {
				const lower = key$1.toLowerCase();
				const value = get.call(response.headers, lower);
				if (value && !lower.startsWith("x-sveltekit-")) {
					if (!resolve_opts.filterSerializedResponseHeaders(lower, value)) throw new Error(`Failed to get response header "${lower}" — it must be included by the \`filterSerializedResponseHeaders\` option: https://svelte.dev/docs/kit/hooks#Server-hooks-handle (at ${event.route.id})`);
				}
				return value;
			};
		}
		return proxy;
	};
	return (input, init$1) => {
		const response = universal_fetch(input, init$1);
		response.catch(() => {});
		return response;
	};
}
async function stream_to_string(stream) {
	let result = "";
	const reader = stream.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		result += text_decoder.decode(value);
	}
	return result;
}
var replacements = {
	"<": "\\u003C",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
var pattern = new RegExp(`[${Object.keys(replacements).join("")}]`, "g");
function serialize_data(fetched, filter, prerendering = false) {
	const headers$1 = {};
	let cache_control = null;
	let age = null;
	let varyAny = false;
	for (const [key$1, value] of fetched.response.headers) {
		if (filter(key$1, value)) headers$1[key$1] = value;
		if (key$1 === "cache-control") cache_control = value;
		else if (key$1 === "age") age = value;
		else if (key$1 === "vary" && value.trim() === "*") varyAny = true;
	}
	const payload = {
		status: fetched.response.status,
		statusText: fetched.response.statusText,
		headers: headers$1,
		body: fetched.response_body
	};
	const safe_payload = JSON.stringify(payload).replace(pattern, (match) => replacements[match]);
	const attrs = [
		"type=\"application/json\"",
		"data-sveltekit-fetched",
		`data-url="${escape_html(fetched.url, true)}"`
	];
	if (fetched.is_b64) attrs.push("data-b64");
	if (fetched.request_headers || fetched.request_body) {
		const values = [];
		if (fetched.request_headers) values.push([...new Headers(fetched.request_headers)].join(","));
		if (fetched.request_body) values.push(fetched.request_body);
		attrs.push(`data-hash="${hash(...values)}"`);
	}
	if (!prerendering && fetched.method === "GET" && cache_control && !varyAny) {
		const match = /s-maxage=(\d+)/g.exec(cache_control) ?? /max-age=(\d+)/g.exec(cache_control);
		if (match) {
			const ttl = +match[1] - +(age ?? "0");
			attrs.push(`data-ttl="${ttl}"`);
		}
	}
	return `<script ${attrs.join(" ")}>${safe_payload}<\/script>`;
}
const s = JSON.stringify;
function sha256(data) {
	if (!key[0]) precompute();
	const out = init.slice(0);
	const array$1 = encode(data);
	for (let i = 0; i < array$1.length; i += 16) {
		const w = array$1.subarray(i, i + 16);
		let tmp;
		let a;
		let b;
		let out0 = out[0];
		let out1 = out[1];
		let out2 = out[2];
		let out3 = out[3];
		let out4 = out[4];
		let out5 = out[5];
		let out6 = out[6];
		let out7 = out[7];
		for (let i$1 = 0; i$1 < 64; i$1++) {
			if (i$1 < 16) tmp = w[i$1];
			else {
				a = w[i$1 + 1 & 15];
				b = w[i$1 + 14 & 15];
				tmp = w[i$1 & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) + w[i$1 & 15] + w[i$1 + 9 & 15] | 0;
			}
			tmp = tmp + out7 + (out4 >>> 6 ^ out4 >>> 11 ^ out4 >>> 25 ^ out4 << 26 ^ out4 << 21 ^ out4 << 7) + (out6 ^ out4 & (out5 ^ out6)) + key[i$1];
			out7 = out6;
			out6 = out5;
			out5 = out4;
			out4 = out3 + tmp | 0;
			out3 = out2;
			out2 = out1;
			out1 = out0;
			out0 = tmp + (out1 & out2 ^ out3 & (out1 ^ out2)) + (out1 >>> 2 ^ out1 >>> 13 ^ out1 >>> 22 ^ out1 << 30 ^ out1 << 19 ^ out1 << 10) | 0;
		}
		out[0] = out[0] + out0 | 0;
		out[1] = out[1] + out1 | 0;
		out[2] = out[2] + out2 | 0;
		out[3] = out[3] + out3 | 0;
		out[4] = out[4] + out4 | 0;
		out[5] = out[5] + out5 | 0;
		out[6] = out[6] + out6 | 0;
		out[7] = out[7] + out7 | 0;
	}
	const bytes = new Uint8Array(out.buffer);
	reverse_endianness(bytes);
	return btoa(String.fromCharCode(...bytes));
}
var init = new Uint32Array(8);
var key = new Uint32Array(64);
function precompute() {
	function frac(x) {
		return (x - Math.floor(x)) * 4294967296;
	}
	let prime = 2;
	for (let i = 0; i < 64; prime++) {
		let is_prime = true;
		for (let factor = 2; factor * factor <= prime; factor++) if (prime % factor === 0) {
			is_prime = false;
			break;
		}
		if (is_prime) {
			if (i < 8) init[i] = frac(prime ** (1 / 2));
			key[i] = frac(prime ** (1 / 3));
			i++;
		}
	}
}
function reverse_endianness(bytes) {
	for (let i = 0; i < bytes.length; i += 4) {
		const a = bytes[i + 0];
		const b = bytes[i + 1];
		const c = bytes[i + 2];
		const d = bytes[i + 3];
		bytes[i + 0] = d;
		bytes[i + 1] = c;
		bytes[i + 2] = b;
		bytes[i + 3] = a;
	}
}
function encode(str) {
	const encoded = text_encoder.encode(str);
	const length = encoded.length * 8;
	const size = 512 * Math.ceil((length + 65) / 512);
	const bytes = new Uint8Array(size / 8);
	bytes.set(encoded);
	bytes[encoded.length] = 128;
	reverse_endianness(bytes);
	const words = new Uint32Array(bytes.buffer);
	words[words.length - 2] = Math.floor(length / 4294967296);
	words[words.length - 1] = length;
	return words;
}
var array = new Uint8Array(16);
function generate_nonce() {
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode(...array));
}
var quoted = new Set([
	"self",
	"unsafe-eval",
	"unsafe-hashes",
	"unsafe-inline",
	"none",
	"strict-dynamic",
	"report-sample",
	"wasm-unsafe-eval",
	"script"
]);
var crypto_pattern = /^(nonce|sha\d\d\d)-/;
var BaseProvider = class {
	#use_hashes;
	#script_needs_csp;
	#script_src_needs_csp;
	#script_src_elem_needs_csp;
	#style_needs_csp;
	#style_src_needs_csp;
	#style_src_attr_needs_csp;
	#style_src_elem_needs_csp;
	#directives;
	#script_src;
	#script_src_elem;
	#style_src;
	#style_src_attr;
	#style_src_elem;
	#nonce;
	constructor(use_hashes, directives, nonce) {
		this.#use_hashes = use_hashes;
		this.#directives = directives;
		const d = this.#directives;
		this.#script_src = [];
		this.#script_src_elem = [];
		this.#style_src = [];
		this.#style_src_attr = [];
		this.#style_src_elem = [];
		const effective_script_src = d["script-src"] || d["default-src"];
		const script_src_elem = d["script-src-elem"];
		const effective_style_src = d["style-src"] || d["default-src"];
		const style_src_attr = d["style-src-attr"];
		const style_src_elem = d["style-src-elem"];
		const needs_csp = (directive) => !!directive && !directive.some((value) => value === "unsafe-inline");
		this.#script_src_needs_csp = needs_csp(effective_script_src);
		this.#script_src_elem_needs_csp = needs_csp(script_src_elem);
		this.#style_src_needs_csp = needs_csp(effective_style_src);
		this.#style_src_attr_needs_csp = needs_csp(style_src_attr);
		this.#style_src_elem_needs_csp = needs_csp(style_src_elem);
		this.#script_needs_csp = this.#script_src_needs_csp || this.#script_src_elem_needs_csp;
		this.#style_needs_csp = this.#style_src_needs_csp || this.#style_src_attr_needs_csp || this.#style_src_elem_needs_csp;
		this.script_needs_nonce = this.#script_needs_csp && !this.#use_hashes;
		this.style_needs_nonce = this.#style_needs_csp && !this.#use_hashes;
		this.#nonce = nonce;
	}
	add_script(content) {
		if (!this.#script_needs_csp) return;
		const source = this.#use_hashes ? `sha256-${sha256(content)}` : `nonce-${this.#nonce}`;
		if (this.#script_src_needs_csp) this.#script_src.push(source);
		if (this.#script_src_elem_needs_csp) this.#script_src_elem.push(source);
	}
	add_style(content) {
		if (!this.#style_needs_csp) return;
		const source = this.#use_hashes ? `sha256-${sha256(content)}` : `nonce-${this.#nonce}`;
		if (this.#style_src_needs_csp) this.#style_src.push(source);
		if (this.#style_src_attr_needs_csp) this.#style_src_attr.push(source);
		if (this.#style_src_elem_needs_csp) {
			const sha256_empty_comment_hash = "sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=";
			const d = this.#directives;
			if (d["style-src-elem"] && !d["style-src-elem"].includes(sha256_empty_comment_hash) && !this.#style_src_elem.includes(sha256_empty_comment_hash)) this.#style_src_elem.push(sha256_empty_comment_hash);
			if (source !== sha256_empty_comment_hash) this.#style_src_elem.push(source);
		}
	}
	get_header(is_meta = false) {
		const header = [];
		const directives = { ...this.#directives };
		if (this.#style_src.length > 0) directives["style-src"] = [...directives["style-src"] || directives["default-src"] || [], ...this.#style_src];
		if (this.#style_src_attr.length > 0) directives["style-src-attr"] = [...directives["style-src-attr"] || [], ...this.#style_src_attr];
		if (this.#style_src_elem.length > 0) directives["style-src-elem"] = [...directives["style-src-elem"] || [], ...this.#style_src_elem];
		if (this.#script_src.length > 0) directives["script-src"] = [...directives["script-src"] || directives["default-src"] || [], ...this.#script_src];
		if (this.#script_src_elem.length > 0) directives["script-src-elem"] = [...directives["script-src-elem"] || [], ...this.#script_src_elem];
		for (const key$1 in directives) {
			if (is_meta && (key$1 === "frame-ancestors" || key$1 === "report-uri" || key$1 === "sandbox")) continue;
			const value = directives[key$1];
			if (!value) continue;
			const directive = [key$1];
			if (Array.isArray(value)) value.forEach((value$1) => {
				if (quoted.has(value$1) || crypto_pattern.test(value$1)) directive.push(`'${value$1}'`);
				else directive.push(value$1);
			});
			header.push(directive.join(" "));
		}
		return header.join("; ");
	}
};
var CspProvider = class extends BaseProvider {
	get_meta() {
		const content = this.get_header(true);
		if (!content) return;
		return `<meta http-equiv="content-security-policy" content="${escape_html(content, true)}">`;
	}
};
var CspReportOnlyProvider = class extends BaseProvider {
	constructor(use_hashes, directives, nonce) {
		super(use_hashes, directives, nonce);
		if (Object.values(directives).filter((v) => !!v).length > 0) {
			const has_report_to = directives["report-to"]?.length ?? false;
			const has_report_uri = directives["report-uri"]?.length ?? false;
			if (!has_report_to && !has_report_uri) throw Error("`content-security-policy-report-only` must be specified with either the `report-to` or `report-uri` directives, or both");
		}
	}
};
var Csp = class {
	nonce = generate_nonce();
	csp_provider;
	report_only_provider;
	constructor({ mode, directives, reportOnly }, { prerender }) {
		const use_hashes = mode === "hash" || mode === "auto" && prerender;
		this.csp_provider = new CspProvider(use_hashes, directives, this.nonce);
		this.report_only_provider = new CspReportOnlyProvider(use_hashes, reportOnly, this.nonce);
	}
	get script_needs_nonce() {
		return this.csp_provider.script_needs_nonce || this.report_only_provider.script_needs_nonce;
	}
	get style_needs_nonce() {
		return this.csp_provider.style_needs_nonce || this.report_only_provider.style_needs_nonce;
	}
	add_script(content) {
		this.csp_provider.add_script(content);
		this.report_only_provider.add_script(content);
	}
	add_style(content) {
		this.csp_provider.add_style(content);
		this.report_only_provider.add_style(content);
	}
};
function generate_route_object(route, url, manifest) {
	const { errors, layouts, leaf } = route;
	const nodes = [
		...errors,
		...layouts.map((l) => l?.[1]),
		leaf[1]
	].filter((n) => typeof n === "number").map((n) => `'${n}': () => ${create_client_import(manifest._.client.nodes?.[n], url)}`).join(",\n		");
	return [
		`{\n\tid: ${s(route.id)}`,
		`errors: ${s(route.errors)}`,
		`layouts: ${s(route.layouts)}`,
		`leaf: ${s(route.leaf)}`,
		`nodes: {\n\t\t${nodes}\n\t}\n}`
	].join(",\n	");
}
function create_client_import(import_path, url) {
	if (!import_path) return "Promise.resolve({})";
	if (import_path[0] === "/") return `import('${import_path}')`;
	if (assets !== "") return `import('${assets}/${import_path}')`;
	let path = get_relative_path(url.pathname, `${base}/${import_path}`);
	if (path[0] !== ".") path = `./${path}`;
	return `import('${path}')`;
}
async function resolve_route(resolved_path, url, manifest) {
	if (!manifest._.client.routes) return text("Server-side route resolution disabled", { status: 400 });
	let route = null;
	let params = {};
	const matchers = await manifest._.matchers();
	for (const candidate of manifest._.client.routes) {
		const match = candidate.pattern.exec(resolved_path);
		if (!match) continue;
		const matched = exec(match, candidate.params, matchers);
		if (matched) {
			route = candidate;
			params = decode_params(matched);
			break;
		}
	}
	return create_server_routing_response(route, params, url, manifest).response;
}
function create_server_routing_response(route, params, url, manifest) {
	const headers$1 = new Headers({ "content-type": "application/javascript; charset=utf-8" });
	if (route) {
		const csr_route = generate_route_object(route, url, manifest);
		const body$1 = `${create_css_import(route, url, manifest)}\nexport const route = ${csr_route}; export const params = ${JSON.stringify(params)};`;
		return {
			response: text(body$1, { headers: headers$1 }),
			body: body$1
		};
	} else return {
		response: text("", { headers: headers$1 }),
		body: ""
	};
}
function create_css_import(route, url, manifest) {
	const { errors, layouts, leaf } = route;
	let css = "";
	for (const node of [
		...errors,
		...layouts.map((l) => l?.[1]),
		leaf[1]
	]) {
		if (typeof node !== "number") continue;
		const node_css = manifest._.client.css?.[node];
		for (const css_path of node_css ?? []) css += `'${assets || base}/${css_path}',`;
	}
	if (!css) return "";
	return `${create_client_import(manifest._.client.start, url)}.then(x => x.load_css([${css}]));`;
}
var updated = {
	...readable(false),
	check: () => false
};
async function render_response({ branch, fetched, options: options$1, manifest, state, page_config, status, error: error$1 = null, event, event_state, resolve_opts, action_result, data_serializer }) {
	if (state.prerendering) {
		if (options$1.csp.mode === "nonce") throw new Error("Cannot use prerendering if config.kit.csp.mode === \"nonce\"");
		if (options$1.app_template_contains_nonce) throw new Error("Cannot use prerendering if page template contains %sveltekit.nonce%");
	}
	const { client } = manifest._;
	const modulepreloads = new Set(client.imports);
	const stylesheets = new Set(client.stylesheets);
	const fonts = new Set(client.fonts);
	const link_headers = /* @__PURE__ */ new Set();
	const link_tags = /* @__PURE__ */ new Set();
	const inline_styles = /* @__PURE__ */ new Map();
	let rendered;
	const form_value = action_result?.type === "success" || action_result?.type === "failure" ? action_result.data ?? null : null;
	let base$1 = base;
	let assets$1 = assets;
	let base_expression = s(base);
	if (!state.prerendering?.fallback) {
		base$1 = event.url.pathname.slice(base.length).split("/").slice(2).map(() => "..").join("/") || ".";
		base_expression = `new URL(${s(base$1)}, location).pathname.slice(0, -1)`;
		if (!assets || assets[0] === "/" && assets !== "/_svelte_kit_assets") assets$1 = base$1;
	} else if (options$1.hash_routing) base_expression = "new URL('.', location).pathname.slice(0, -1)";
	if (page_config.ssr) {
		const props = {
			stores: {
				page: writable(null),
				navigating: writable(null),
				updated
			},
			constructors: await Promise.all(branch.map(({ node }) => {
				if (!node.component) throw new Error(`Missing +page.svelte component for route ${event.route.id}`);
				return node.component();
			})),
			form: form_value
		};
		let data$1 = {};
		for (let i = 0; i < branch.length; i += 1) {
			data$1 = {
				...data$1,
				...branch[i].data
			};
			props[`data_${i}`] = data$1;
		}
		props.page = {
			error: error$1,
			params: event.params,
			route: event.route,
			status,
			url: event.url,
			data: data$1,
			form: form_value,
			state: {}
		};
		const render_opts = { context: new Map([["__request__", { page: props.page }]]) };
		globalThis.fetch;
		try {
			rendered = await with_request_store({
				event,
				state: event_state
			}, async () => {
				override({
					base: base$1,
					assets: assets$1
				});
				const maybe_promise = options$1.root.render(props, render_opts);
				const rendered$1 = options$1.async && "then" in maybe_promise ? maybe_promise.then((r) => r) : maybe_promise;
				if (options$1.async) reset();
				const { head: head$1, html: html$1, css } = options$1.async ? await rendered$1 : rendered$1;
				return {
					head: head$1,
					html: html$1,
					css
				};
			});
		} finally {
			reset();
		}
		for (const { node } of branch) {
			for (const url of node.imports) modulepreloads.add(url);
			for (const url of node.stylesheets) stylesheets.add(url);
			for (const url of node.fonts) fonts.add(url);
			if (node.inline_styles && !client.inline) Object.entries(await node.inline_styles()).forEach(([k, v]) => inline_styles.set(k, v));
		}
	} else rendered = {
		head: "",
		html: "",
		css: {
			code: "",
			map: null
		}
	};
	let head = "";
	let body$1 = rendered.html;
	const csp = new Csp(options$1.csp, { prerender: !!state.prerendering });
	const prefixed = (path) => {
		if (path.startsWith("/")) return base + path;
		return `${assets$1}/${path}`;
	};
	const style = client.inline ? client.inline?.style : Array.from(inline_styles.values()).join("\n");
	if (style) {
		const attributes = [];
		if (csp.style_needs_nonce) attributes.push(` nonce="${csp.nonce}"`);
		csp.add_style(style);
		head += `\n\t<style${attributes.join("")}>${style}</style>`;
	}
	for (const dep of stylesheets) {
		const path = prefixed(dep);
		const attributes = ["rel=\"stylesheet\""];
		if (inline_styles.has(dep)) attributes.push("disabled", "media=\"(max-width: 0)\"");
		else if (resolve_opts.preload({
			type: "css",
			path
		})) link_headers.add(`<${encodeURI(path)}>; rel="preload"; as="style"; nopush`);
		head += `\n\t\t<link href="${path}" ${attributes.join(" ")}>`;
	}
	for (const dep of fonts) {
		const path = prefixed(dep);
		if (resolve_opts.preload({
			type: "font",
			path
		})) {
			const ext = dep.slice(dep.lastIndexOf(".") + 1);
			link_tags.add(`<link rel="preload" as="font" type="font/${ext}" href="${path}" crossorigin>`);
			link_headers.add(`<${encodeURI(path)}>; rel="preload"; as="font"; type="font/${ext}"; crossorigin; nopush`);
		}
	}
	const global = get_global_name(options$1);
	const { data, chunks } = data_serializer.get_data(csp);
	if (page_config.ssr && page_config.csr) body$1 += `\n\t\t\t${fetched.map((item) => serialize_data(item, resolve_opts.filterSerializedResponseHeaders, !!state.prerendering)).join("\n			")}`;
	if (page_config.csr) {
		const route = manifest._.client.routes?.find((r) => r.id === event.route.id) ?? null;
		if (client.uses_env_dynamic_public && state.prerendering) modulepreloads.add(`${app_dir}/env.js`);
		if (!client.inline) {
			const included_modulepreloads = Array.from(modulepreloads, (dep) => prefixed(dep)).filter((path) => resolve_opts.preload({
				type: "js",
				path
			}));
			for (const path of included_modulepreloads) {
				link_headers.add(`<${encodeURI(path)}>; rel="modulepreload"; nopush`);
				if (options$1.preload_strategy !== "modulepreload") head += `\n\t\t<link rel="preload" as="script" crossorigin="anonymous" href="${path}">`;
				else link_tags.add(`<link rel="modulepreload" href="${path}">`);
			}
		}
		if (state.prerendering && link_tags.size > 0) head += Array.from(link_tags).map((tag) => `\n\t\t${tag}`).join("");
		if (manifest._.client.routes && state.prerendering && !state.prerendering.fallback) {
			const pathname = add_resolution_suffix(event.url.pathname);
			state.prerendering.dependencies.set(pathname, create_server_routing_response(route, event.params, new URL(pathname, event.url), manifest));
		}
		const blocks = [];
		const load_env_eagerly = client.uses_env_dynamic_public && state.prerendering;
		const properties = [`base: ${base_expression}`];
		if (assets) properties.push(`assets: ${s(assets)}`);
		if (client.uses_env_dynamic_public) properties.push(`env: ${load_env_eagerly ? "null" : s(public_env)}`);
		if (chunks) {
			blocks.push("const deferred = new Map();");
			properties.push(`defer: (id) => new Promise((fulfil, reject) => {
							deferred.set(id, { fulfil, reject });
						})`);
			let app_declaration = "";
			if (Object.keys(options$1.hooks.transport).length > 0) if (client.inline) app_declaration = `const app = __sveltekit_${options$1.version_hash}.app.app;`;
			else if (client.app) app_declaration = `const app = await import(${s(prefixed(client.app))});`;
			else app_declaration = `const { app } = await import(${s(prefixed(client.start))});`;
			const prelude = app_declaration ? `${app_declaration}
							const [data, error] = fn(app);` : `const [data, error] = fn();`;
			properties.push(`resolve: async (id, fn) => {
							${prelude}

							const try_to_resolve = () => {
								if (!deferred.has(id)) {
									setTimeout(try_to_resolve, 0);
									return;
								}
								const { fulfil, reject } = deferred.get(id);
								deferred.delete(id);
								if (error) reject(error);
								else fulfil(data);
							}
							try_to_resolve();
						}`);
		}
		blocks.push(`${global} = {
						${properties.join(",\n						")}
					};`);
		const args = ["element"];
		blocks.push("const element = document.currentScript.parentElement;");
		if (page_config.ssr) {
			const serialized = {
				form: "null",
				error: "null"
			};
			if (form_value) serialized.form = uneval_action_response(form_value, event.route.id, options$1.hooks.transport);
			if (error$1) serialized.error = devalue.uneval(error$1);
			const hydrate = [
				`node_ids: [${branch.map(({ node }) => node.index).join(", ")}]`,
				`data: ${data}`,
				`form: ${serialized.form}`,
				`error: ${serialized.error}`
			];
			if (status !== 200) hydrate.push(`status: ${status}`);
			if (manifest._.client.routes) {
				if (route) {
					const stringified = generate_route_object(route, event.url, manifest).replaceAll("\n", "\n							");
					hydrate.push(`params: ${devalue.uneval(event.params)}`, `server_route: ${stringified}`);
				}
			} else if (options$1.embedded) hydrate.push(`params: ${devalue.uneval(event.params)}`, `route: ${s(event.route)}`);
			const indent = "	".repeat(load_env_eagerly ? 7 : 6);
			args.push(`{\n${indent}\t${hydrate.join(`,\n${indent}\t`)}\n${indent}}`);
		}
		const { remote_data: remote_cache } = event_state;
		let serialized_remote_data = "";
		if (remote_cache) {
			const remote = {};
			for (const [info, cache] of remote_cache) {
				if (!info.id) continue;
				for (const key$1 in cache) remote[create_remote_key(info.id, key$1)] = await cache[key$1];
			}
			const replacer = (thing) => {
				for (const key$1 in options$1.hooks.transport) {
					const encoded = options$1.hooks.transport[key$1].encode(thing);
					if (encoded) return `app.decode('${key$1}', ${devalue.uneval(encoded, replacer)})`;
				}
			};
			serialized_remote_data = `${global}.data = ${devalue.uneval(remote, replacer)};\n\n\t\t\t\t\t\t`;
		}
		const boot = client.inline ? `${client.inline.script}

					${serialized_remote_data}${global}.app.start(${args.join(", ")});` : client.app ? `Promise.all([
						import(${s(prefixed(client.start))}),
						import(${s(prefixed(client.app))})
					]).then(([kit, app]) => {
						${serialized_remote_data}kit.start(app, ${args.join(", ")});
					});` : `import(${s(prefixed(client.start))}).then((app) => {
						${serialized_remote_data}app.start(${args.join(", ")})
					});`;
		if (load_env_eagerly) blocks.push(`import(${s(`${base$1}/${app_dir}/env.js`)}).then(({ env }) => {
						${global}.env = env;

						${boot.replace(/\n/g, "\n	")}
					});`);
		else blocks.push(boot);
		if (options$1.service_worker) {
			let opts = "";
			if (options$1.service_worker_options != null) opts = `, ${s({ ...options$1.service_worker_options })}`;
			blocks.push(`if ('serviceWorker' in navigator) {
						addEventListener('load', function () {
							navigator.serviceWorker.register('${prefixed("service-worker.js")}'${opts});
						});
					}`);
		}
		const init_app = `
				{
					${blocks.join("\n\n					")}
				}
			`;
		csp.add_script(init_app);
		body$1 += `\n\t\t\t<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>${init_app}<\/script>\n\t\t`;
	}
	const headers$1 = new Headers({
		"x-sveltekit-page": "true",
		"content-type": "text/html"
	});
	if (state.prerendering) {
		const http_equiv = [];
		const csp_headers = csp.csp_provider.get_meta();
		if (csp_headers) http_equiv.push(csp_headers);
		if (state.prerendering.cache) http_equiv.push(`<meta http-equiv="cache-control" content="${state.prerendering.cache}">`);
		if (http_equiv.length > 0) head = http_equiv.join("\n") + head;
	} else {
		const csp_header = csp.csp_provider.get_header();
		if (csp_header) headers$1.set("content-security-policy", csp_header);
		const report_only_header = csp.report_only_provider.get_header();
		if (report_only_header) headers$1.set("content-security-policy-report-only", report_only_header);
		if (link_headers.size) headers$1.set("link", Array.from(link_headers).join(", "));
	}
	head += rendered.head;
	const html = options$1.templates.app({
		head,
		body: body$1,
		assets: assets$1,
		nonce: csp.nonce,
		env: public_env
	});
	const transformed = await resolve_opts.transformPageChunk({
		html,
		done: true
	}) || "";
	if (!chunks) headers$1.set("etag", `"${hash(transformed)}"`);
	return !chunks ? text(transformed, {
		status,
		headers: headers$1
	}) : new Response(new ReadableStream({
		async start(controller) {
			controller.enqueue(text_encoder.encode(transformed + "\n"));
			for await (const chunk of chunks) if (chunk.length) controller.enqueue(text_encoder.encode(chunk));
			controller.close();
		},
		type: "bytes"
	}), { headers: headers$1 });
}
var PageNodes = class {
	data;
	constructor(nodes) {
		this.data = nodes;
	}
	layouts() {
		return this.data.slice(0, -1);
	}
	page() {
		return this.data.at(-1);
	}
	validate() {
		for (const layout of this.layouts()) if (layout) {
			validate_layout_server_exports(layout.server, layout.server_id);
			validate_layout_exports(layout.universal, layout.universal_id);
		}
		const page = this.page();
		if (page) {
			validate_page_server_exports(page.server, page.server_id);
			validate_page_exports(page.universal, page.universal_id);
		}
	}
	#get_option(option) {
		return this.data.reduce((value, node) => {
			return node?.universal?.[option] ?? node?.server?.[option] ?? value;
		}, void 0);
	}
	csr() {
		return this.#get_option("csr") ?? true;
	}
	ssr() {
		return this.#get_option("ssr") ?? true;
	}
	prerender() {
		return this.#get_option("prerender") ?? false;
	}
	trailing_slash() {
		return this.#get_option("trailingSlash") ?? "never";
	}
	get_config() {
		let current$1 = {};
		for (const node of this.data) {
			if (!node?.universal?.config && !node?.server?.config) continue;
			current$1 = {
				...current$1,
				...node?.universal?.config,
				...node?.server?.config
			};
		}
		return Object.keys(current$1).length ? current$1 : void 0;
	}
	should_prerender_data() {
		return this.data.some((node) => node?.server?.load || node?.server?.trailingSlash !== void 0);
	}
};
async function respond_with_error({ event, event_state, options: options$1, manifest, state, status, error: error$1, resolve_opts }) {
	if (event.request.headers.get("x-sveltekit-error")) return static_error_page(options$1, status, error$1.message);
	const fetched = [];
	try {
		const branch = [];
		const default_layout = await manifest._.nodes[0]();
		const nodes = new PageNodes([default_layout]);
		const ssr = nodes.ssr();
		const csr = nodes.csr();
		const data_serializer = server_data_serializer(event, event_state, options$1);
		if (ssr) {
			state.error = true;
			const server_data_promise = load_server_data({
				event,
				event_state,
				state,
				node: default_layout,
				parent: async () => ({})
			});
			const server_data = await server_data_promise;
			data_serializer.add_node(0, server_data);
			const data = await load_data({
				event,
				event_state,
				fetched,
				node: default_layout,
				parent: async () => ({}),
				resolve_opts,
				server_data_promise,
				state,
				csr
			});
			branch.push({
				node: default_layout,
				server_data,
				data
			}, {
				node: await manifest._.nodes[1](),
				data: null,
				server_data: null
			});
		}
		return await render_response({
			options: options$1,
			manifest,
			state,
			page_config: {
				ssr,
				csr
			},
			status,
			error: await handle_error_and_jsonify(event, event_state, options$1, error$1),
			branch,
			fetched,
			event,
			event_state,
			resolve_opts,
			data_serializer
		});
	} catch (e) {
		if (e instanceof Redirect) return redirect_response(e.status, e.location);
		return static_error_page(options$1, get_status(e), (await handle_error_and_jsonify(event, event_state, options$1, e)).message);
	}
}
async function handle_remote_call(event, state, options$1, manifest, id) {
	return record_span({
		name: "sveltekit.remote.call",
		attributes: { "sveltekit.remote.call.id": id },
		fn: (current$1) => {
			const traced_event = merge_tracing(event, current$1);
			return with_request_store({
				event: traced_event,
				state
			}, () => handle_remote_call_internal(traced_event, state, options$1, manifest, id));
		}
	});
}
async function handle_remote_call_internal(event, state, options$1, manifest, id) {
	const [hash$1, name, additional_args] = id.split("/");
	const remotes = manifest._.remotes;
	if (!remotes[hash$1]) error(404);
	const fn = (await remotes[hash$1]()).default[name];
	if (!fn) error(404);
	const info = fn.__;
	const transport = options$1.hooks.transport;
	event.tracing.current.setAttributes({
		"sveltekit.remote.call.type": info.type,
		"sveltekit.remote.call.name": info.name
	});
	let form_client_refreshes;
	try {
		if (info.type === "query_batch") {
			if (event.request.method !== "POST") throw new SvelteKitError(405, "Method Not Allowed", `\`query.batch\` functions must be invoked via POST request, not ${event.request.method}`);
			const { payloads } = await event.request.json();
			const args = payloads.map((payload$1) => parse_remote_arg(payload$1, transport));
			const get_result = await with_request_store({
				event,
				state
			}, () => info.run(args));
			return json({
				type: "result",
				result: stringify(await Promise.all(args.map(async (arg, i) => {
					try {
						return {
							type: "result",
							data: get_result(arg, i)
						};
					} catch (error$1) {
						return {
							type: "error",
							error: await handle_error_and_jsonify(event, state, options$1, error$1),
							status: error$1 instanceof HttpError || error$1 instanceof SvelteKitError ? error$1.status : 500
						};
					}
				})), transport)
			});
		}
		if (info.type === "form") {
			if (event.request.method !== "POST") throw new SvelteKitError(405, "Method Not Allowed", `\`form\` functions must be invoked via POST request, not ${event.request.method}`);
			if (!is_form_content_type(event.request)) throw new SvelteKitError(415, "Unsupported Media Type", `\`form\` functions expect form-encoded data — received ${event.request.headers.get("content-type")}`);
			const { data, meta, form_data } = await deserialize_binary_form(event.request);
			if (additional_args && !("id" in data)) data.id = JSON.parse(decodeURIComponent(additional_args));
			const fn$1 = info.fn;
			const result = await with_request_store({
				event,
				state
			}, () => fn$1(data, meta, form_data));
			return json({
				type: "result",
				result: stringify(result, transport),
				refreshes: result.issues ? void 0 : await serialize_refreshes(meta.remote_refreshes)
			});
		}
		if (info.type === "command") {
			const { payload: payload$1, refreshes } = await event.request.json();
			const arg = parse_remote_arg(payload$1, transport);
			return json({
				type: "result",
				result: stringify(await with_request_store({
					event,
					state
				}, () => fn(arg)), transport),
				refreshes: await serialize_refreshes(refreshes)
			});
		}
		const payload = info.type === "prerender" ? additional_args : new URL(event.request.url).searchParams.get("payload");
		return json({
			type: "result",
			result: stringify(await with_request_store({
				event,
				state
			}, () => fn(parse_remote_arg(payload, transport))), transport)
		});
	} catch (error$1) {
		if (error$1 instanceof Redirect) return json({
			type: "redirect",
			location: error$1.location,
			refreshes: await serialize_refreshes(form_client_refreshes)
		});
		const status = error$1 instanceof HttpError || error$1 instanceof SvelteKitError ? error$1.status : 500;
		return json({
			type: "error",
			error: await handle_error_and_jsonify(event, state, options$1, error$1),
			status
		}, {
			status: state.prerendering ? status : void 0,
			headers: { "cache-control": "private, no-store" }
		});
	}
	async function serialize_refreshes(client_refreshes) {
		const refreshes = state.refreshes ?? {};
		if (client_refreshes) for (const key$1 of client_refreshes) {
			if (refreshes[key$1] !== void 0) continue;
			const [hash$2, name$1, payload] = key$1.split("/");
			const loader = manifest._.remotes[hash$2];
			const fn$1 = (await loader?.())?.default?.[name$1];
			if (!fn$1) error(400, "Bad Request");
			refreshes[key$1] = with_request_store({
				event,
				state
			}, () => fn$1(parse_remote_arg(payload, transport)));
		}
		if (Object.keys(refreshes).length === 0) return;
		return stringify(Object.fromEntries(await Promise.all(Object.entries(refreshes).map(async ([key$1, promise]) => [key$1, await promise]))), transport);
	}
}
async function handle_remote_form_post(event, state, manifest, id) {
	return record_span({
		name: "sveltekit.remote.form.post",
		attributes: { "sveltekit.remote.form.post.id": id },
		fn: (current$1) => {
			const traced_event = merge_tracing(event, current$1);
			return with_request_store({
				event: traced_event,
				state
			}, () => handle_remote_form_post_internal(traced_event, state, manifest, id));
		}
	});
}
async function handle_remote_form_post_internal(event, state, manifest, id) {
	const [hash$1, name, action_id] = id.split("/");
	let form = (await manifest._.remotes[hash$1]?.())?.default[name];
	if (!form) {
		event.setHeaders({ allow: "GET" });
		return {
			type: "error",
			error: new SvelteKitError(405, "Method Not Allowed", `POST method not allowed. No form actions exist for this page`)
		};
	}
	if (action_id) form = with_request_store({
		event,
		state
	}, () => form.for(JSON.parse(action_id)));
	try {
		const fn = form.__.fn;
		const { data, meta, form_data } = await deserialize_binary_form(event.request);
		if (action_id && !("id" in data)) data.id = JSON.parse(decodeURIComponent(action_id));
		await with_request_store({
			event,
			state
		}, () => fn(data, meta, form_data));
		return {
			type: "success",
			status: 200
		};
	} catch (e) {
		const err = normalize_error(e);
		if (err instanceof Redirect) return {
			type: "redirect",
			status: err.status,
			location: err.location
		};
		return {
			type: "error",
			error: check_incorrect_fail_use(err)
		};
	}
}
function get_remote_id(url) {
	return url.pathname.startsWith(`${base}/_app/remote/`) && url.pathname.replace(`${base}/_app/remote/`, "");
}
function get_remote_action(url) {
	return url.searchParams.get("/remote");
}
var MAX_DEPTH = 10;
async function render_page(event, event_state, page, options$1, manifest, state, nodes, resolve_opts) {
	if (state.depth > MAX_DEPTH) return text(`Not found: ${event.url.pathname}`, { status: 404 });
	if (is_action_json_request(event)) return handle_action_json_request(event, event_state, options$1, (await manifest._.nodes[page.leaf]())?.server);
	try {
		const leaf_node = nodes.page();
		let status = 200;
		let action_result = void 0;
		if (is_action_request(event)) {
			const remote_id = get_remote_action(event.url);
			if (remote_id) action_result = await handle_remote_form_post(event, event_state, manifest, remote_id);
			else action_result = await handle_action_request(event, event_state, leaf_node.server);
			if (action_result?.type === "redirect") return redirect_response(action_result.status, action_result.location);
			if (action_result?.type === "error") status = get_status(action_result.error);
			if (action_result?.type === "failure") status = action_result.status;
		}
		const should_prerender = nodes.prerender();
		if (should_prerender) {
			if (leaf_node.server?.actions) throw new Error("Cannot prerender pages with actions");
		} else if (state.prerendering) return new Response(void 0, { status: 204 });
		state.prerender_default = should_prerender;
		const should_prerender_data = nodes.should_prerender_data();
		const data_pathname = add_data_suffix(event.url.pathname);
		const fetched = [];
		const ssr = nodes.ssr();
		const csr = nodes.csr();
		if (ssr === false && !(state.prerendering && should_prerender_data)) return await render_response({
			branch: [],
			fetched,
			page_config: {
				ssr: false,
				csr
			},
			status,
			error: null,
			event,
			event_state,
			options: options$1,
			manifest,
			state,
			resolve_opts,
			data_serializer: server_data_serializer(event, event_state, options$1)
		});
		const branch = [];
		let load_error = null;
		const data_serializer = server_data_serializer(event, event_state, options$1);
		const data_serializer_json = state.prerendering && should_prerender_data ? server_data_serializer_json(event, event_state, options$1) : null;
		const server_promises = nodes.data.map((node, i) => {
			if (load_error) throw load_error;
			return Promise.resolve().then(async () => {
				try {
					if (node === leaf_node && action_result?.type === "error") throw action_result.error;
					const server_data = await load_server_data({
						event,
						event_state,
						state,
						node,
						parent: async () => {
							const data = {};
							for (let j = 0; j < i; j += 1) {
								const parent = await server_promises[j];
								if (parent) Object.assign(data, parent.data);
							}
							return data;
						}
					});
					if (node) data_serializer.add_node(i, server_data);
					data_serializer_json?.add_node(i, server_data);
					return server_data;
				} catch (e) {
					load_error = e;
					throw load_error;
				}
			});
		});
		const load_promises = nodes.data.map((node, i) => {
			if (load_error) throw load_error;
			return Promise.resolve().then(async () => {
				try {
					return await load_data({
						event,
						event_state,
						fetched,
						node,
						parent: async () => {
							const data = {};
							for (let j = 0; j < i; j += 1) Object.assign(data, await load_promises[j]);
							return data;
						},
						resolve_opts,
						server_data_promise: server_promises[i],
						state,
						csr
					});
				} catch (e) {
					load_error = e;
					throw load_error;
				}
			});
		});
		for (const p of server_promises) p.catch(() => {});
		for (const p of load_promises) p.catch(() => {});
		for (let i = 0; i < nodes.data.length; i += 1) {
			const node = nodes.data[i];
			if (node) try {
				const server_data = await server_promises[i];
				const data = await load_promises[i];
				branch.push({
					node,
					server_data,
					data
				});
			} catch (e) {
				const err = normalize_error(e);
				if (err instanceof Redirect) {
					if (state.prerendering && should_prerender_data) {
						const body$1 = JSON.stringify({
							type: "redirect",
							location: err.location
						});
						state.prerendering.dependencies.set(data_pathname, {
							response: text(body$1),
							body: body$1
						});
					}
					return redirect_response(err.status, err.location);
				}
				const status$1 = get_status(err);
				const error$1 = await handle_error_and_jsonify(event, event_state, options$1, err);
				while (i--) if (page.errors[i]) {
					const index = page.errors[i];
					const node$1 = await manifest._.nodes[index]();
					let j = i;
					while (!branch[j]) j -= 1;
					data_serializer.set_max_nodes(j + 1);
					const layouts = compact(branch.slice(0, j + 1));
					const nodes$1 = new PageNodes(layouts.map((layout) => layout.node));
					return await render_response({
						event,
						event_state,
						options: options$1,
						manifest,
						state,
						resolve_opts,
						page_config: {
							ssr: nodes$1.ssr(),
							csr: nodes$1.csr()
						},
						status: status$1,
						error: error$1,
						branch: layouts.concat({
							node: node$1,
							data: null,
							server_data: null
						}),
						fetched,
						data_serializer
					});
				}
				return static_error_page(options$1, status$1, error$1.message);
			}
			else branch.push(null);
		}
		if (state.prerendering && data_serializer_json) {
			let { data, chunks } = data_serializer_json.get_data();
			if (chunks) for await (const chunk of chunks) data += chunk;
			state.prerendering.dependencies.set(data_pathname, {
				response: text(data),
				body: data
			});
		}
		return await render_response({
			event,
			event_state,
			options: options$1,
			manifest,
			state,
			resolve_opts,
			page_config: {
				csr,
				ssr
			},
			status,
			error: null,
			branch: ssr === false ? [] : compact(branch),
			action_result,
			fetched,
			data_serializer: ssr === false ? server_data_serializer(event, event_state, options$1) : data_serializer
		});
	} catch (e) {
		return await respond_with_error({
			event,
			event_state,
			options: options$1,
			manifest,
			state,
			status: 500,
			error: e,
			resolve_opts
		});
	}
}
function once(fn) {
	let done = false;
	let result;
	return () => {
		if (done) return result;
		done = true;
		return result = fn();
	};
}
async function render_data(event, event_state, route, options$1, manifest, state, invalidated_data_nodes, trailing_slash) {
	if (!route.page) return new Response(void 0, { status: 404 });
	try {
		const node_ids = [...route.page.layouts, route.page.leaf];
		const invalidated = invalidated_data_nodes ?? node_ids.map(() => true);
		let aborted = false;
		const url = new URL(event.url);
		url.pathname = normalize_path(url.pathname, trailing_slash);
		const new_event = {
			...event,
			url
		};
		const functions = node_ids.map((n, i) => {
			return once(async () => {
				try {
					if (aborted) return { type: "skip" };
					return load_server_data({
						event: new_event,
						event_state,
						state,
						node: n == void 0 ? n : await manifest._.nodes[n](),
						parent: async () => {
							const data$1 = {};
							for (let j = 0; j < i; j += 1) {
								const parent = await functions[j]();
								if (parent) Object.assign(data$1, parent.data);
							}
							return data$1;
						}
					});
				} catch (e) {
					aborted = true;
					throw e;
				}
			});
		});
		const promises = functions.map(async (fn, i) => {
			if (!invalidated[i]) return { type: "skip" };
			return fn();
		});
		let length = promises.length;
		const nodes = await Promise.all(promises.map((p, i) => p.catch(async (error$1) => {
			if (error$1 instanceof Redirect) throw error$1;
			length = Math.min(length, i + 1);
			return {
				type: "error",
				error: await handle_error_and_jsonify(event, event_state, options$1, error$1),
				status: error$1 instanceof HttpError || error$1 instanceof SvelteKitError ? error$1.status : void 0
			};
		})));
		const data_serializer = server_data_serializer_json(event, event_state, options$1);
		for (let i = 0; i < nodes.length; i++) data_serializer.add_node(i, nodes[i]);
		const { data, chunks } = data_serializer.get_data();
		if (!chunks) return json_response(data);
		return new Response(new ReadableStream({
			async start(controller) {
				controller.enqueue(text_encoder.encode(data));
				for await (const chunk of chunks) controller.enqueue(text_encoder.encode(chunk));
				controller.close();
			},
			type: "bytes"
		}), { headers: {
			"content-type": "text/sveltekit-data",
			"cache-control": "private, no-store"
		} });
	} catch (e) {
		const error$1 = normalize_error(e);
		if (error$1 instanceof Redirect) return redirect_json_response(error$1);
		else return json_response(await handle_error_and_jsonify(event, event_state, options$1, error$1), 500);
	}
}
function json_response(json$1, status = 200) {
	return text(typeof json$1 === "string" ? json$1 : JSON.stringify(json$1), {
		status,
		headers: {
			"content-type": "application/json",
			"cache-control": "private, no-store"
		}
	});
}
function redirect_json_response(redirect) {
	return json_response({
		type: "redirect",
		location: redirect.location
	});
}
var INVALID_COOKIE_CHARACTER_REGEX = /[\x00-\x1F\x7F()<>@,;:"/[\]?={} \t]/;
function validate_options(options$1) {
	if (options$1?.path === void 0) throw new Error("You must specify a `path` when setting, deleting or serializing cookies");
}
function generate_cookie_key(domain, path, name) {
	return `${domain || ""}${path}?${encodeURIComponent(name)}`;
}
function get_cookies(request, url) {
	const header = request.headers.get("cookie") ?? "";
	const initial_cookies = parse$1(header, { decode: (value) => value });
	let normalized_url;
	const new_cookies = /* @__PURE__ */ new Map();
	const defaults = {
		httpOnly: true,
		sameSite: "lax",
		secure: url.hostname === "localhost" && url.protocol === "http:" ? false : true
	};
	const cookies = {
		get(name, opts) {
			const best_match = Array.from(new_cookies.values()).filter((c) => {
				return c.name === name && domain_matches(url.hostname, c.options.domain) && path_matches(url.pathname, c.options.path);
			}).sort((a, b) => b.options.path.length - a.options.path.length)[0];
			if (best_match) return best_match.options.maxAge === 0 ? void 0 : best_match.value;
			return parse$1(header, { decode: opts?.decode })[name];
		},
		getAll(opts) {
			const cookies$1 = parse$1(header, { decode: opts?.decode });
			const lookup = /* @__PURE__ */ new Map();
			for (const c of new_cookies.values()) if (domain_matches(url.hostname, c.options.domain) && path_matches(url.pathname, c.options.path)) {
				const existing = lookup.get(c.name);
				if (!existing || c.options.path.length > existing.options.path.length) lookup.set(c.name, c);
			}
			for (const c of lookup.values()) cookies$1[c.name] = c.value;
			return Object.entries(cookies$1).map(([name, value]) => ({
				name,
				value
			}));
		},
		set(name, value, options$1) {
			const illegal_characters = name.match(INVALID_COOKIE_CHARACTER_REGEX);
			if (illegal_characters) console.warn(`The cookie name "${name}" will be invalid in SvelteKit 3.0 as it contains ${illegal_characters.join(" and ")}. See RFC 2616 for more details https://datatracker.ietf.org/doc/html/rfc2616#section-2.2`);
			validate_options(options$1);
			set_internal(name, value, {
				...defaults,
				...options$1
			});
		},
		delete(name, options$1) {
			validate_options(options$1);
			cookies.set(name, "", {
				...options$1,
				maxAge: 0
			});
		},
		serialize(name, value, options$1) {
			validate_options(options$1);
			let path = options$1.path;
			if (!options$1.domain || options$1.domain === url.hostname) {
				if (!normalized_url) throw new Error("Cannot serialize cookies until after the route is determined");
				path = resolve(normalized_url, path);
			}
			return serialize(name, value, {
				...defaults,
				...options$1,
				path
			});
		}
	};
	function get_cookie_header(destination, header$1) {
		const combined_cookies = { ...initial_cookies };
		for (const cookie of new_cookies.values()) {
			if (!domain_matches(destination.hostname, cookie.options.domain)) continue;
			if (!path_matches(destination.pathname, cookie.options.path)) continue;
			const encoder = cookie.options.encode || encodeURIComponent;
			combined_cookies[cookie.name] = encoder(cookie.value);
		}
		if (header$1) {
			const parsed = parse$1(header$1, { decode: (value) => value });
			for (const name in parsed) combined_cookies[name] = parsed[name];
		}
		return Object.entries(combined_cookies).map(([name, value]) => `${name}=${value}`).join("; ");
	}
	const internal_queue = [];
	function set_internal(name, value, options$1) {
		if (!normalized_url) {
			internal_queue.push(() => set_internal(name, value, options$1));
			return;
		}
		let path = options$1.path;
		if (!options$1.domain || options$1.domain === url.hostname) path = resolve(normalized_url, path);
		const cookie_key = generate_cookie_key(options$1.domain, path, name);
		const cookie = {
			name,
			value,
			options: {
				...options$1,
				path
			}
		};
		new_cookies.set(cookie_key, cookie);
	}
	function set_trailing_slash(trailing_slash) {
		normalized_url = normalize_path(url.pathname, trailing_slash);
		internal_queue.forEach((fn) => fn());
	}
	return {
		cookies,
		new_cookies,
		get_cookie_header,
		set_internal,
		set_trailing_slash
	};
}
function domain_matches(hostname, constraint) {
	if (!constraint) return true;
	const normalized = constraint[0] === "." ? constraint.slice(1) : constraint;
	if (hostname === normalized) return true;
	return hostname.endsWith("." + normalized);
}
function path_matches(path, constraint) {
	if (!constraint) return true;
	const normalized = constraint.endsWith("/") ? constraint.slice(0, -1) : constraint;
	if (path === normalized) return true;
	return path.startsWith(normalized + "/");
}
function add_cookies_to_headers(headers$1, cookies) {
	for (const new_cookie of cookies) {
		const { name, value, options: options$1 } = new_cookie;
		headers$1.append("set-cookie", serialize(name, value, options$1));
		if (options$1.path.endsWith(".html")) {
			const path = add_data_suffix(options$1.path);
			headers$1.append("set-cookie", serialize(name, value, {
				...options$1,
				path
			}));
		}
	}
}
function create_fetch({ event, options: options$1, manifest, state, get_cookie_header, set_internal }) {
	const server_fetch = async (info, init$1) => {
		const original_request = normalize_fetch_input(info, init$1, event.url);
		let mode = (info instanceof Request ? info.mode : init$1?.mode) ?? "cors";
		let credentials = (info instanceof Request ? info.credentials : init$1?.credentials) ?? "same-origin";
		return options$1.hooks.handleFetch({
			event,
			request: original_request,
			fetch: async (info$1, init$2) => {
				const request = normalize_fetch_input(info$1, init$2, event.url);
				const url = new URL(request.url);
				if (!request.headers.has("origin")) request.headers.set("origin", event.url.origin);
				if (info$1 !== original_request) {
					mode = (info$1 instanceof Request ? info$1.mode : init$2?.mode) ?? "cors";
					credentials = (info$1 instanceof Request ? info$1.credentials : init$2?.credentials) ?? "same-origin";
				}
				if ((request.method === "GET" || request.method === "HEAD") && (mode === "no-cors" && url.origin !== event.url.origin || url.origin === event.url.origin)) request.headers.delete("origin");
				if (url.origin !== event.url.origin) {
					if (`.${url.hostname}`.endsWith(`.${event.url.hostname}`) && credentials !== "omit") {
						const cookie = get_cookie_header(url, request.headers.get("cookie"));
						if (cookie) request.headers.set("cookie", cookie);
					}
					return fetch(request);
				}
				const prefix = assets || base;
				const decoded = decodeURIComponent(url.pathname);
				const filename = (decoded.startsWith(prefix) ? decoded.slice(prefix.length) : decoded).slice(1);
				const filename_html = `${filename}/index.html`;
				const is_asset = manifest.assets.has(filename) || filename in manifest._.server_assets;
				const is_asset_html = manifest.assets.has(filename_html) || filename_html in manifest._.server_assets;
				if (is_asset || is_asset_html) {
					const file = is_asset ? filename : filename_html;
					if (state.read) {
						const type = is_asset ? manifest.mimeTypes[filename.slice(filename.lastIndexOf("."))] : "text/html";
						return new Response(state.read(file), { headers: type ? { "content-type": type } : {} });
					} else if (read_implementation && file in manifest._.server_assets) {
						const length = manifest._.server_assets[file];
						const type = manifest.mimeTypes[file.slice(file.lastIndexOf("."))];
						return new Response(read_implementation(file), { headers: {
							"Content-Length": "" + length,
							"Content-Type": type
						} });
					}
					return await fetch(request);
				}
				if (has_prerendered_path(manifest, base + decoded)) return await fetch(request);
				if (credentials !== "omit") {
					const cookie = get_cookie_header(url, request.headers.get("cookie"));
					if (cookie) request.headers.set("cookie", cookie);
					const authorization = event.request.headers.get("authorization");
					if (authorization && !request.headers.has("authorization")) request.headers.set("authorization", authorization);
				}
				if (!request.headers.has("accept")) request.headers.set("accept", "*/*");
				if (!request.headers.has("accept-language")) request.headers.set("accept-language", event.request.headers.get("accept-language"));
				const response = await internal_fetch(request, options$1, manifest, state);
				const set_cookie = response.headers.get("set-cookie");
				if (set_cookie) for (const str of set_cookie_parser.splitCookiesString(set_cookie)) {
					const { name, value, ...options$2 } = set_cookie_parser.parseString(str, { decodeValues: false });
					set_internal(name, value, {
						path: options$2.path ?? (url.pathname.split("/").slice(0, -1).join("/") || "/"),
						encode: (value$1) => value$1,
						...options$2
					});
				}
				return response;
			}
		});
	};
	return (input, init$1) => {
		const response = server_fetch(input, init$1);
		response.catch(() => {});
		return response;
	};
}
function normalize_fetch_input(info, init$1, url) {
	if (info instanceof Request) return info;
	return new Request(typeof info === "string" ? new URL(info, url) : info, init$1);
}
async function internal_fetch(request, options$1, manifest, state) {
	if (request.signal) {
		if (request.signal.aborted) throw new DOMException("The operation was aborted.", "AbortError");
		let remove_abort_listener = () => {};
		const abort_promise = new Promise((_, reject) => {
			const on_abort = () => {
				reject(new DOMException("The operation was aborted.", "AbortError"));
			};
			request.signal.addEventListener("abort", on_abort, { once: true });
			remove_abort_listener = () => request.signal.removeEventListener("abort", on_abort);
		});
		const result = await Promise.race([respond(request, options$1, manifest, {
			...state,
			depth: state.depth + 1
		}), abort_promise]);
		remove_abort_listener();
		return result;
	} else return await respond(request, options$1, manifest, {
		...state,
		depth: state.depth + 1
	});
}
var body;
var etag;
var headers;
function get_public_env(request) {
	body ??= `export const env=${JSON.stringify(public_env)}`;
	etag ??= `W/${Date.now()}`;
	headers ??= new Headers({
		"content-type": "application/javascript; charset=utf-8",
		etag
	});
	if (request.headers.get("if-none-match") === etag) return new Response(void 0, {
		status: 304,
		headers
	});
	return new Response(body, { headers });
}
var default_transform = ({ html }) => html;
var default_filter = () => false;
var default_preload = ({ type }) => type === "js" || type === "css";
var page_methods = new Set([
	"GET",
	"HEAD",
	"POST"
]);
var allowed_page_methods = new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]);
const respond = propagate_context(internal_respond);
async function internal_respond(request, options$1, manifest, state) {
	const url = new URL(request.url);
	const is_route_resolution_request = has_resolution_suffix(url.pathname);
	const is_data_request = has_data_suffix(url.pathname);
	const remote_id = get_remote_id(url);
	{
		const request_origin = request.headers.get("origin");
		if (remote_id) {
			if (request.method !== "GET" && request_origin !== url.origin) return json({ message: "Cross-site remote requests are forbidden" }, { status: 403 });
		} else if (options$1.csrf_check_origin) {
			if (is_form_content_type(request) && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request_origin !== url.origin && (!request_origin || !options$1.csrf_trusted_origins.includes(request_origin))) {
				const message = `Cross-site ${request.method} form submissions are forbidden`;
				const opts = { status: 403 };
				if (request.headers.get("accept") === "application/json") return json({ message }, opts);
				return text(message, opts);
			}
		}
	}
	if (options$1.hash_routing && url.pathname !== base + "/" && url.pathname !== "/[fallback]") return text("Not found", { status: 404 });
	let invalidated_data_nodes;
	if (is_route_resolution_request) url.pathname = strip_resolution_suffix(url.pathname);
	else if (is_data_request) {
		url.pathname = strip_data_suffix(url.pathname) + (url.searchParams.get("x-sveltekit-trailing-slash") === "1" ? "/" : "") || "/";
		url.searchParams.delete(TRAILING_SLASH_PARAM);
		invalidated_data_nodes = url.searchParams.get(INVALIDATED_PARAM)?.split("").map((node) => node === "1");
		url.searchParams.delete(INVALIDATED_PARAM);
	} else if (remote_id) {
		url.pathname = request.headers.get("x-sveltekit-pathname") ?? base;
		url.search = request.headers.get("x-sveltekit-search") ?? "";
	}
	const headers$1 = {};
	const { cookies, new_cookies, get_cookie_header, set_internal, set_trailing_slash } = get_cookies(request, url);
	const event_state = {
		prerendering: state.prerendering,
		transport: options$1.hooks.transport,
		handleValidationError: options$1.hooks.handleValidationError,
		tracing: { record_span },
		is_in_remote_function: false
	};
	const event = {
		cookies,
		fetch: null,
		getClientAddress: state.getClientAddress || (() => {
			throw new Error(`@sveltejs/adapter-static does not specify getClientAddress. Please raise an issue`);
		}),
		locals: {},
		params: {},
		platform: state.platform,
		request,
		route: { id: null },
		setHeaders: (new_headers) => {
			for (const key$1 in new_headers) {
				const lower = key$1.toLowerCase();
				const value = new_headers[key$1];
				if (lower === "set-cookie") throw new Error("Use `event.cookies.set(name, value, options)` instead of `event.setHeaders` to set cookies");
				else if (lower in headers$1) if (lower === "server-timing") headers$1[lower] += ", " + value;
				else throw new Error(`"${key$1}" header is already set`);
				else {
					headers$1[lower] = value;
					if (state.prerendering && lower === "cache-control") state.prerendering.cache = value;
				}
			}
		},
		url,
		isDataRequest: is_data_request,
		isSubRequest: state.depth > 0,
		isRemoteRequest: !!remote_id
	};
	event.fetch = create_fetch({
		event,
		options: options$1,
		manifest,
		state,
		get_cookie_header,
		set_internal
	});
	if (state.emulator?.platform) event.platform = await state.emulator.platform({
		config: {},
		prerender: !!state.prerendering?.fallback
	});
	let resolved_path = url.pathname;
	if (!remote_id) {
		const prerendering_reroute_state = state.prerendering?.inside_reroute;
		try {
			if (state.prerendering) state.prerendering.inside_reroute = true;
			resolved_path = await options$1.hooks.reroute({
				url: new URL(url),
				fetch: event.fetch
			}) ?? url.pathname;
		} catch {
			return text("Internal Server Error", { status: 500 });
		} finally {
			if (state.prerendering) state.prerendering.inside_reroute = prerendering_reroute_state;
		}
	}
	try {
		resolved_path = decode_pathname(resolved_path);
	} catch {
		return text("Malformed URI", { status: 400 });
	}
	if (resolved_path !== url.pathname && !state.prerendering?.fallback && has_prerendered_path(manifest, resolved_path)) {
		const url$1 = new URL(request.url);
		url$1.pathname = is_data_request ? add_data_suffix(resolved_path) : is_route_resolution_request ? add_resolution_suffix(resolved_path) : resolved_path;
		const response = await fetch(url$1, request);
		const headers$2 = new Headers(response.headers);
		if (headers$2.has("content-encoding")) {
			headers$2.delete("content-encoding");
			headers$2.delete("content-length");
		}
		return new Response(response.body, {
			headers: headers$2,
			status: response.status,
			statusText: response.statusText
		});
	}
	let route = null;
	if (base && !state.prerendering?.fallback) {
		if (!resolved_path.startsWith(base)) return text("Not found", { status: 404 });
		resolved_path = resolved_path.slice(base.length) || "/";
	}
	if (is_route_resolution_request) return resolve_route(resolved_path, new URL(request.url), manifest);
	if (resolved_path === `/_app/env.js`) return get_public_env(request);
	if (!remote_id && resolved_path.startsWith(`/_app`)) {
		const headers$2 = new Headers();
		headers$2.set("cache-control", "public, max-age=0, must-revalidate");
		return text("Not found", {
			status: 404,
			headers: headers$2
		});
	}
	if (!state.prerendering?.fallback) {
		const matchers = await manifest._.matchers();
		for (const candidate of manifest._.routes) {
			const match = candidate.pattern.exec(resolved_path);
			if (!match) continue;
			const matched = exec(match, candidate.params, matchers);
			if (matched) {
				route = candidate;
				event.route = { id: route.id };
				event.params = decode_params(matched);
				break;
			}
		}
	}
	let resolve_opts = {
		transformPageChunk: default_transform,
		filterSerializedResponseHeaders: default_filter,
		preload: default_preload
	};
	let trailing_slash = "never";
	try {
		const page_nodes = route?.page ? new PageNodes(await load_page_nodes(route.page, manifest)) : void 0;
		if (route && !remote_id) {
			if (url.pathname === base || url.pathname === base + "/") trailing_slash = "always";
			else if (page_nodes) trailing_slash = page_nodes.trailing_slash();
			else if (route.endpoint) trailing_slash = (await route.endpoint()).trailingSlash ?? "never";
			if (!is_data_request) {
				const normalized = normalize_path(url.pathname, trailing_slash);
				if (normalized !== url.pathname && !state.prerendering?.fallback) return new Response(void 0, {
					status: 308,
					headers: {
						"x-sveltekit-normalize": "1",
						location: (normalized.startsWith("//") ? url.origin + normalized : normalized) + (url.search === "?" ? "" : url.search)
					}
				});
			}
			if (state.before_handle || state.emulator?.platform) {
				let config = {};
				let prerender = false;
				if (route.endpoint) {
					const node = await route.endpoint();
					config = node.config ?? config;
					prerender = node.prerender ?? prerender;
				} else if (page_nodes) {
					config = page_nodes.get_config() ?? config;
					prerender = page_nodes.prerender();
				}
				if (state.before_handle) state.before_handle(event, config, prerender);
				if (state.emulator?.platform) event.platform = await state.emulator.platform({
					config,
					prerender
				});
			}
		}
		set_trailing_slash(trailing_slash);
		if (state.prerendering && !state.prerendering.fallback && !state.prerendering.inside_reroute) disable_search(url);
		const response = await record_span({
			name: "sveltekit.handle.root",
			attributes: {
				"http.route": event.route.id || "unknown",
				"http.method": event.request.method,
				"http.url": event.url.href,
				"sveltekit.is_data_request": is_data_request,
				"sveltekit.is_sub_request": event.isSubRequest
			},
			fn: async (root_span) => {
				const traced_event = {
					...event,
					tracing: {
						enabled: false,
						root: root_span,
						current: root_span
					}
				};
				return await with_request_store({
					event: traced_event,
					state: event_state
				}, () => options$1.hooks.handle({
					event: traced_event,
					resolve: (event$1, opts) => {
						return record_span({
							name: "sveltekit.resolve",
							attributes: { "http.route": event$1.route.id || "unknown" },
							fn: (resolve_span) => {
								return with_request_store(null, () => resolve$1(merge_tracing(event$1, resolve_span), page_nodes, opts).then((response$1) => {
									for (const key$1 in headers$1) {
										const value = headers$1[key$1];
										response$1.headers.set(key$1, value);
									}
									add_cookies_to_headers(response$1.headers, new_cookies.values());
									if (state.prerendering && event$1.route.id !== null) response$1.headers.set("x-sveltekit-routeid", encodeURI(event$1.route.id));
									resolve_span.setAttributes({
										"http.response.status_code": response$1.status,
										"http.response.body.size": response$1.headers.get("content-length") || "unknown"
									});
									return response$1;
								}));
							}
						});
					}
				}));
			}
		});
		if (response.status === 200 && response.headers.has("etag")) {
			let if_none_match_value = request.headers.get("if-none-match");
			if (if_none_match_value?.startsWith("W/\"")) if_none_match_value = if_none_match_value.substring(2);
			const etag$1 = response.headers.get("etag");
			if (if_none_match_value === etag$1) {
				const headers$2 = new Headers({ etag: etag$1 });
				for (const key$1 of [
					"cache-control",
					"content-location",
					"date",
					"expires",
					"vary",
					"set-cookie"
				]) {
					const value = response.headers.get(key$1);
					if (value) headers$2.set(key$1, value);
				}
				return new Response(void 0, {
					status: 304,
					headers: headers$2
				});
			}
		}
		if (is_data_request && response.status >= 300 && response.status <= 308) {
			const location = response.headers.get("location");
			if (location) return redirect_json_response(new Redirect(response.status, location));
		}
		return response;
	} catch (e) {
		if (e instanceof Redirect) {
			const response = is_data_request || remote_id ? redirect_json_response(e) : route?.page && is_action_json_request(event) ? action_json_redirect(e) : redirect_response(e.status, e.location);
			add_cookies_to_headers(response.headers, new_cookies.values());
			return response;
		}
		return await handle_fatal_error(event, event_state, options$1, e);
	}
	async function resolve$1(event$1, page_nodes, opts) {
		try {
			if (opts) resolve_opts = {
				transformPageChunk: opts.transformPageChunk || default_transform,
				filterSerializedResponseHeaders: opts.filterSerializedResponseHeaders || default_filter,
				preload: opts.preload || default_preload
			};
			if (options$1.hash_routing || state.prerendering?.fallback) return await render_response({
				event: event$1,
				event_state,
				options: options$1,
				manifest,
				state,
				page_config: {
					ssr: false,
					csr: true
				},
				status: 200,
				error: null,
				branch: [],
				fetched: [],
				resolve_opts,
				data_serializer: server_data_serializer(event$1, event_state, options$1)
			});
			if (remote_id) return await handle_remote_call(event$1, event_state, options$1, manifest, remote_id);
			if (route) {
				const method = event$1.request.method;
				let response$1;
				if (is_data_request) response$1 = await render_data(event$1, event_state, route, options$1, manifest, state, invalidated_data_nodes, trailing_slash);
				else if (route.endpoint && (!route.page || is_endpoint_request(event$1))) response$1 = await render_endpoint(event$1, event_state, await route.endpoint(), state);
				else if (route.page) if (!page_nodes) throw new Error("page_nodes not found. This should never happen");
				else if (page_methods.has(method)) response$1 = await render_page(event$1, event_state, route.page, options$1, manifest, state, page_nodes, resolve_opts);
				else {
					const allowed_methods$1 = new Set(allowed_page_methods);
					if ((await manifest._.nodes[route.page.leaf]())?.server?.actions) allowed_methods$1.add("POST");
					if (method === "OPTIONS") response$1 = new Response(null, {
						status: 204,
						headers: { allow: Array.from(allowed_methods$1.values()).join(", ") }
					});
					else response$1 = method_not_allowed([...allowed_methods$1].reduce((acc, curr) => {
						acc[curr] = true;
						return acc;
					}, {}), method);
				}
				else throw new Error("Route is neither page nor endpoint. This should never happen");
				if (request.method === "GET" && route.page && route.endpoint) {
					const vary = response$1.headers.get("vary")?.split(",")?.map((v) => v.trim().toLowerCase());
					if (!(vary?.includes("accept") || vary?.includes("*"))) {
						response$1 = new Response(response$1.body, {
							status: response$1.status,
							statusText: response$1.statusText,
							headers: new Headers(response$1.headers)
						});
						response$1.headers.append("Vary", "Accept");
					}
				}
				return response$1;
			}
			if (state.error && event$1.isSubRequest) {
				const headers$2 = new Headers(request.headers);
				headers$2.set("x-sveltekit-error", "true");
				return await fetch(request, { headers: headers$2 });
			}
			if (state.error) return text("Internal Server Error", { status: 500 });
			if (state.depth === 0) return await respond_with_error({
				event: event$1,
				event_state,
				options: options$1,
				manifest,
				state,
				status: 404,
				error: new SvelteKitError(404, "Not Found", `Not found: ${event$1.url.pathname}`),
				resolve_opts
			});
			if (state.prerendering) return text("not found", { status: 404 });
			const response = await fetch(request);
			return new Response(response.body, response);
		} catch (e) {
			return await handle_fatal_error(event$1, event_state, options$1, e);
		} finally {
			event$1.cookies.set = () => {
				throw new Error("Cannot use `cookies.set(...)` after the response has been generated");
			};
			event$1.setHeaders = () => {
				throw new Error("Cannot use `setHeaders(...)` after the response has been generated");
			};
		}
	}
}
function load_page_nodes(page, manifest) {
	return Promise.all([...page.layouts.map((n) => n == void 0 ? n : manifest._.nodes[n]()), manifest._.nodes[page.leaf]()]);
}
function propagate_context(fn) {
	return async (req, ...rest) => {
		return fn(req, ...rest);
	};
}
function filter_env(env, allowed, disallowed) {
	return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith(allowed) && (disallowed === "" || !k.startsWith(disallowed))));
}
function set_app(value) {}
var init_promise;
var current = null;
var Server = class {
	#options;
	#manifest;
	constructor(manifest) {
		this.#options = options;
		this.#manifest = manifest;
		if (IN_WEBCONTAINER) {
			const respond$1 = this.respond.bind(this);
			this.respond = async (...args) => {
				const { promise, resolve: resolve$1 } = with_resolvers();
				const previous = current;
				current = promise;
				await previous;
				return respond$1(...args).finally(resolve$1);
			};
		}
		set_manifest(manifest);
	}
	async init({ env, read }) {
		const { env_public_prefix, env_private_prefix } = this.#options;
		set_private_env(filter_env(env, env_private_prefix, env_public_prefix));
		set_public_env(filter_env(env, env_public_prefix, env_private_prefix));
		if (read) {
			const wrapped_read = (file) => {
				const result = read(file);
				if (result instanceof ReadableStream) return result;
				else return new ReadableStream({ async start(controller) {
					try {
						const stream = await Promise.resolve(result);
						if (!stream) {
							controller.close();
							return;
						}
						const reader = stream.getReader();
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;
							controller.enqueue(value);
						}
						controller.close();
					} catch (error$1) {
						controller.error(error$1);
					}
				} });
			};
			set_read_implementation(wrapped_read);
		}
		await (init_promise ??= (async () => {
			try {
				const module = await get_hooks();
				this.#options.hooks = {
					handle: module.handle || (({ event, resolve: resolve$1 }) => resolve$1(event)),
					handleError: module.handleError || (({ status, error: error$1, event }) => {
						const error_message = format_server_error(status, error$1, event);
						console.error(error_message);
					}),
					handleFetch: module.handleFetch || (({ request, fetch: fetch$1 }) => fetch$1(request)),
					handleValidationError: module.handleValidationError || (({ issues }) => {
						console.error("Remote function schema validation failed:", issues);
						return { message: "Bad Request" };
					}),
					reroute: module.reroute || (() => {}),
					transport: module.transport || {}
				};
				set_app({ decoders: module.transport ? Object.fromEntries(Object.entries(module.transport).map(([k, v]) => [k, v.decode])) : {} });
				if (module.init) await module.init();
			} catch (e) {
				throw e;
			}
		})());
	}
	async respond(request, options$1) {
		return respond(request, this.#options, this.#manifest, {
			...options$1,
			error: false,
			depth: 0
		});
	}
};
export { Server };
