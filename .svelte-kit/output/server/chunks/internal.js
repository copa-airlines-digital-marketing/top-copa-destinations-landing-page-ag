import { n as tick } from "./index-server.js";
import { t as false_default } from "./false.js";
import { C as escape_html, E as noop, i as render, p as setContext, w as async_mode_flag, x as asClassComponent$1 } from "./server.js";
let public_env = {};
let fix_stack_trace = (error) => error?.stack;
function set_private_env(environment) {}
function set_public_env(environment) {
	public_env = environment;
}
let read_implementation = null;
function set_read_implementation(fn) {
	read_implementation = fn;
}
function set_manifest(_) {}
function asClassComponent(component) {
	const component_constructor = asClassComponent$1(component);
	const _render = (props, { context, csp } = {}) => {
		const result = render(component, {
			props,
			context,
			csp
		});
		const munged = Object.defineProperties({}, {
			css: { value: {
				code: "",
				map: null
			} },
			head: { get: () => result.head },
			html: { get: () => result.body },
			then: { value: (onfulfilled, onrejected) => {
				if (!async_mode_flag) {
					const user_result = onfulfilled({
						css: munged.css,
						head: munged.head,
						html: munged.html
					});
					return Promise.resolve(user_result);
				}
				return result.then((result$1) => {
					return onfulfilled({
						css: munged.css,
						head: result$1.head,
						html: result$1.body,
						hashes: result$1.hashes
					});
				}, onrejected);
			} }
		});
		return munged;
	};
	component_constructor.render = _render;
	return component_constructor;
}
function Root($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { stores, page, constructors, components = [], form, data_0 = null, data_1 = null } = $$props;
		setContext("__svelte__", stores);
		stores.page.set(page);
		const Pyramid_1 = constructors[1];
		if (constructors[1]) {
			$$renderer$1.push("<!--[-->");
			const Pyramid_0 = constructors[0];
			$$renderer$1.push(`<!---->`);
			Pyramid_0($$renderer$1, {
				data: data_0,
				form,
				params: page.params,
				children: ($$renderer$2) => {
					$$renderer$2.push(`<!---->`);
					Pyramid_1($$renderer$2, {
						data: data_1,
						form,
						params: page.params
					});
					$$renderer$2.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[!-->");
			const Pyramid_0 = constructors[0];
			$$renderer$1.push(`<!---->`);
			Pyramid_0($$renderer$1, {
				data: data_0,
				form,
				params: page.params
			});
			$$renderer$1.push(`<!---->`);
		}
		$$renderer$1.push(`<!--]--> `);
		$$renderer$1.push("<!--[!-->");
		$$renderer$1.push(`<!--]-->`);
	});
}
var root_default = asClassComponent(Root);
const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {
		"mode": "auto",
		"directives": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		},
		"reportOnly": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		}
	},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: "PUBLIC_",
	env_private_prefix: "",
	hash_routing: false,
	hooks: null,
	preload_strategy: "modulepreload",
	root: root_default,
	service_worker: false,
	service_worker_options: void 0,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\r\n<html lang=\"en\">\r\n  <head>\r\n    <meta charset=\"UTF-8\" />\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\r\n    <meta name=\"description\" content=\"Descubre los mejores destinos de Copa Airlines para 2026. Conecta con América a través del Hub de las Américas en Panamá.\" />\r\n    <title>Copa Airlines - Top Destinations 2026</title>\r\n    " + head + "\r\n  </head>\r\n  <body data-sveltekit-preload-data=\"hover\">\r\n    <div style=\"display: contents\">" + body + "</div>\r\n  </body>\r\n</html>\r\n",
		error: ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n	<head>\n		<meta charset=\"utf-8\" />\n		<title>" + message + "</title>\n\n		<style>\n			body {\n				--bg: white;\n				--fg: #222;\n				--divider: #ccc;\n				background: var(--bg);\n				color: var(--fg);\n				font-family:\n					system-ui,\n					-apple-system,\n					BlinkMacSystemFont,\n					'Segoe UI',\n					Roboto,\n					Oxygen,\n					Ubuntu,\n					Cantarell,\n					'Open Sans',\n					'Helvetica Neue',\n					sans-serif;\n				display: flex;\n				align-items: center;\n				justify-content: center;\n				height: 100vh;\n				margin: 0;\n			}\n\n			.error {\n				display: flex;\n				align-items: center;\n				max-width: 32rem;\n				margin: 0 1rem;\n			}\n\n			.status {\n				font-weight: 200;\n				font-size: 3rem;\n				line-height: 1;\n				position: relative;\n				top: -0.05rem;\n			}\n\n			.message {\n				border-left: 1px solid var(--divider);\n				padding: 0 0 0 1rem;\n				margin: 0 0 0 1rem;\n				min-height: 2.5rem;\n				display: flex;\n				align-items: center;\n			}\n\n			.message h1 {\n				font-weight: 400;\n				font-size: 1em;\n				margin: 0;\n			}\n\n			@media (prefers-color-scheme: dark) {\n				body {\n					--bg: #222;\n					--fg: #ddd;\n					--divider: #666;\n				}\n			}\n		</style>\n	</head>\n	<body>\n		<div class=\"error\">\n			<span class=\"status\">" + status + "</span>\n			<div class=\"message\">\n				<h1>" + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
	},
	version_hash: "xn49ei"
};
async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	let reroute;
	let transport;
	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}
export { set_read_implementation as a, set_private_env as c, set_manifest as i, set_public_env as l, options as n, fix_stack_trace as o, read_implementation as r, public_env as s, get_hooks as t };
