import "../../chunks/false.js";
import { a as slot } from "../../chunks/server.js";
function _layout($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]-->`);
}
export { _layout as default };
