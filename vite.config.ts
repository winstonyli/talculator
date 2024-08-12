import { sveltekit } from '@sveltejs/kit/vite';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte',
		}),
		copy({
			targets: [
				{
					src: [
						'node_modules/mathlive/dist/fonts',
						'node_modules/mathlive/dist/sounds',
						'node_modules/mathlive/dist/mathlive-fonts.css',
						'node_modules/mathlive/dist/mathlive-static.css',
					],
					dest: 'static/node_modules/.vite/deps',
				},
			],
		}),
	],
	ssr: {
		noExternal: ['three'],
	},
});
