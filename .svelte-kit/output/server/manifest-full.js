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
		client: {start:"_app/immutable/entry/start.Bv7KeARJ.js",app:"_app/immutable/entry/app.BlfM12Uz.js",imports:["_app/immutable/entry/start.Bv7KeARJ.js","_app/immutable/chunks/CADhQQw8.js","_app/immutable/chunks/yKKyXI3h.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/entry/app.BlfM12Uz.js","_app/immutable/chunks/CADhQQw8.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/chunks/DntX99I9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
