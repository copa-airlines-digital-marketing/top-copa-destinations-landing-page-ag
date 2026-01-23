export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.sK3ObiBz.js",app:"_app/immutable/entry/app.CIIwX3x5.js",imports:["_app/immutable/entry/start.sK3ObiBz.js","_app/immutable/chunks/B75HBG2K.js","_app/immutable/chunks/Bk4hrr2J.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/entry/app.CIIwX3x5.js","_app/immutable/chunks/B75HBG2K.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/chunks/DntX99I9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
