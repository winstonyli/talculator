<script lang="ts">
	import { colors } from '$lib/color';
	import { defaultExpr, type Expr } from '$lib/expr';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	export let expr: Expr;
	export let valid: boolean;
	export let color: string;

	const dispatch = createEventDispatcher();
</script>

<div class="flex gap-3">
	<math-field
		transition:fly={{ x: -30 }}
		on:input={() => dispatch('input')}
		id={expr.id}
		class="input input-primary flex-1"
		class:input-error={!valid}
	>
		{defaultExpr}
	</math-field>
	<details class="dropdown dropdown-right">
		<summary
			class="btn btn-circle tooltip tooltip-bottom"
			style="background-color: {color}"
			data-tip={color}
		></summary>
		<ul class="dropdown-content z-[1] flex gap-3 rounded-box bg-neutral p-3 shadow-lg">
			{#each Object.keys(colors) as k}
				{#if k !== color}
					<li class="tooltip tooltip-bottom" data-tip={k}>
						<button
							class="btn btn-circle"
							style="background-color: {k}"
							on:click={() => (color = k)}
						/>
					</li>
				{/if}
			{/each}
		</ul>
	</details>
</div>
