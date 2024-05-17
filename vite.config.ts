import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig({
	optimizeDeps: {
		esbuildOptions: {
			plugins: [NodeGlobalsPolyfillPlugin()]
		}
	},
	server: {
		host: 'rev.absk.io',
		port: 443,
		https: {
			key: 'D:/tools/mkcert/_wildcard.absk.io+1-key.pem',
			cert: 'D:/tools/mkcert/_wildcard.absk.io+1.pem'
		},
		proxy: {}
	},
	plugins: [sveltekit(), purgeCss()]
});
