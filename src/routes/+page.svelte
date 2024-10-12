<script lang="ts">
	import Scene from '$lib/components/Scene.svelte';
	import { ComputeEngine, type BoxedExpression } from '@cortex-js/compute-engine';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import type { MathfieldElement } from 'mathlive';
	import { defaultExpr, type Expr } from '$lib/expr';
	import IconPlus from '~icons/mdi/water-plus';
	import IconMenu from '~icons/mdi/menu';
	import IconClose from '~icons/mdi/close';
	import Field from '$lib/components/Field.svelte';
	import { randomColor } from '$lib/color';
	import { fade } from 'svelte/transition';

	let exprs: Expr[] = [{ id: 'default', color: 'blue' }];
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

<div class="drawer h-[100dvh] overflow-hidden lg:drawer-open">
	<input id="equations-drawer" type="checkbox" class="drawer-toggle" />

	<label
		for="equations-drawer"
		aria-label="open sidebar"
		class="btn btn-circle fixed left-3 top-3 z-10 border-none bg-gradient-to-tr from-primary to-secondary shadow lg:hidden"
	>
		<IconMenu class="size-6 text-primary-content" />
	</label>

	<!-- Page content -->
	<div class="drawer-content fixed h-screen w-screen bg-gradient-to-b from-base-200 to-base-300">
		<Scene {exprs} />
	</div>

	<!-- Drawer content -->
	<div class="drawer-side h-full">
		<label for="equations-drawer" aria-label="close sidebar" class="drawer-overlay" />

		<div class="pointer-events-none flex h-full flex-col gap-3 p-3 *:pointer-events-auto">
			<button
				class="btn btn-circle w-24 border-none bg-gradient-to-tr from-primary to-secondary shadow lg:w-auto"
				on:click={() => {
					const expr = { id: crypto.randomUUID(), color: randomColor() };
					updateExpr(expr);
					exprs = [...exprs, expr];
				}}
			>
				<IconPlus class="ml-auto mr-3 size-9 text-primary-content lg:m-auto" />
			</button>

			<ul
				class="flex flex-1 flex-col gap-3 overflow-y-auto pr-3"
				use:dndzone={{ items: exprs, flipDurationMs: 300 }}
				on:consider={(e) => {
					exprs = e.detail.items;
				}}
				on:finalize={(e) => {
					exprs = e.detail.items;
				}}
			>
				{#each exprs as expr (expr.id)}
					<li class="flex" animate:flip={{ duration: 300 }}>
						<Field {expr} {valid} bind:color={expr.color} on:input={() => updateExpr(expr)} />
						<button
							class="btn btn-circle btn-error btn-xs z-10 -ml-6"
							on:click={() => {
								exprs = exprs.filter((e) => e.id !== expr.id);
							}}
							transition:fade
						>
							<IconClose />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
