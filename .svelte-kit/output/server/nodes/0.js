import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.CGxfW1J8.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/chunks/DntX99I9.js","_app/immutable/chunks/DwIIHIkP.js"];
export const stylesheets = ["_app/immutable/assets/0.BYnmv9Mi.css"];
export const fonts = [];
