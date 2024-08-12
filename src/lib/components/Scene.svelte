<script lang="ts">
	import { ignoreErr } from '$lib/util';
	import { T, Canvas } from '@threlte/core';
	import { Grid, OrbitControls } from '@threlte/extras';
	import { Vector2 } from 'three';
	import Mesh from './Mesh.svelte';
	import type { Expr } from '$lib/expr';

	export let exprs: Expr[];

	export let precision = 50;

	export let min = new Vector2(-5, -5); // .y = .z
	export let max = new Vector2(5, 5); // .y = .z
	export let yScale = 1;

	let zoom = 300;
</script>

<Canvas>
	<T.OrthographicCamera makeDefault position={[5, 5, -5]} bind:zoom>
		<OrbitControls
			enableDamping
			dampingFactor={0.5}
			target.y={0}
			enablePan={false}
			autoRotateSpeed={3}
		/>
	</T.OrthographicCamera>

	<T.DirectionalLight position.x={1} position.y={1} position.z={-1} />
	<T.AmbientLight intensity={1 / 3} />

	{#each ['xz', 'xy', 'zy'] as plane}
		<Grid
			plane={ignoreErr(plane)}
			cellThickness={0}
			sectionColor="#ffffff"
			sectionThickness={1}
			gridSize={2}
		/>
	{/each}

	{#each exprs as { f, color }}
		{#if f}
			<Mesh {f} {color} {precision} {min} {max} {yScale} />
		{/if}
	{/each}
</Canvas>
