<script lang="ts">
	import _ from 'lodash';
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
	<button
		class="btn btn-circle tooltip tooltip-bottom hover:z-10"
		style:background-color={color}
		data-tip={color}
		on:click={() => (color = _.sample(Object.keys(colors)) ?? 'blue')}
	/>
</div>
