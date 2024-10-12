<script lang="ts">
	import Scene from '$lib/components/Scene.svelte';
	import { ComputeEngine, type BoxedExpression } from '@cortex-js/compute-engine';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import type { MathfieldElement } from 'mathlive';
	import { defaultExpr, type Expr } from '$lib/expr';
	import IconPlus from '~icons/mdi/water-plus';
	import Field from '$lib/components/Field.svelte';
	import { randomColor } from '$lib/color';

	let exprs: Expr[] = [];
	let ce: ComputeEngine;
	let valid = true;

	onMount(async () => {
		import('@cortex-js/compute-engine');
		import('mathlive');

		ce = new ComputeEngine();
	});

	function updateExpr(field: Expr) {
		let mf = document.getElementById(field.id) as MathfieldElement | null;

		let expr: BoxedExpression | undefined = ce.parse(mf?.value || defaultExpr);

		if (expr?.head === 'Equal') {
			const solved = expr.solve('y')?.[0];

			if (solved) {
				expr = solved;
			} else {
				// Try switching y = x to x = y; Compute Engine currently only solves for x on the left-hand side
				const exprJson = expr.json as any[];
				[exprJson[1], exprJson[2]] = [exprJson[2], exprJson[1]];
				expr = ce.box(exprJson).solve('y')?.[0];
			}
		}

		try {
			const compiledF = expr?.compile();
			if (compiledF) {
				field.f = (x, z) => {
					const value = compiledF({ x, z });
					return typeof value === 'number' ? value : NaN;
				};
				exprs = exprs;
				valid = true;
			}
		} catch (e) {
			valid = false;
			console.error(e);
		}
	}
</script>

<div class="flex h-screen w-screen">
	<div class="flex h-screen w-60 flex-col gap-3 bg-neutral p-3 shadow-lg">
		<div
			class="flex flex-col gap-3"
			class:hidden={!exprs.length}
			use:dndzone={{ items: exprs, flipDurationMs: 300 }}
			on:consider={(e) => {
				exprs = e.detail.items;
			}}
			on:finalize={(e) => {
				exprs = e.detail.items;
			}}
		>
			{#each exprs as expr (expr.id)}
				<div animate:flip={{ duration: 300 }}>
					<Field {expr} {valid} bind:color={expr.color} on:input={() => updateExpr(expr)} />
				</div>
			{/each}
		</div>
		<button
			class="btn btn-primary border-none bg-gradient-to-tr from-primary to-secondary"
			on:click={() => {
				const expr = { id: crypto.randomUUID(), color: randomColor() };
				exprs = [...exprs, expr];
				updateExpr(expr);
			}}
		>
			<IconPlus class="h-9 w-9" />
		</button>
	</div>

	<div class="flex-1 bg-gradient-to-b from-base-200 to-base-300">
		<Scene {exprs} />
	</div>
</div>
