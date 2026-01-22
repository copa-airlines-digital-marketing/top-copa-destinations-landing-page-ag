let base = "";
let assets = base;
const app_dir = "_app";
const relative = true;
var initial = {
	base,
	assets
};
initial.base;
function override(paths) {
	base = paths.base;
	assets = paths.assets;
}
function reset() {
	base = initial.base;
	assets = initial.assets;
}
function set_assets(path) {
	assets = initial.assets = path;
}
const version = "1769118666558";
let prerendering = false;
function set_building() {}
function set_prerendering() {
	prerendering = true;
}
export { app_dir as a, override as c, set_assets as d, version as i, relative as l, set_building as n, assets as o, set_prerendering as r, base as s, prerendering as t, reset as u };
