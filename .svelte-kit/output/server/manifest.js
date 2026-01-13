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
		client: {start:"_app/immutable/entry/start.ZZDuNAIn.js",app:"_app/immutable/entry/app.CLcuCuyO.js",imports:["_app/immutable/entry/start.ZZDuNAIn.js","_app/immutable/chunks/D5IQE9ee.js","_app/immutable/chunks/BPN5g-7O.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/entry/app.CLcuCuyO.js","_app/immutable/chunks/D5IQE9ee.js","_app/immutable/chunks/sCIM5R7d.js","_app/immutable/chunks/DntX99I9.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
