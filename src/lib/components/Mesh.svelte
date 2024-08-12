<script lang="ts">
	import type { Function } from '$lib/expr';
	import { T } from '@threlte/core';
	import {
		BufferAttribute,
		BufferGeometry,
		DoubleSide,
		EdgesGeometry,
		Vector2,
		Vector3,
	} from 'three';

	export let f: Function;
	export let color: string;

	export let precision = 50;

	export let min = new Vector2(-5, -5); // .y = .z
	export let max = new Vector2(5, 5); // .y = .z
	export let yScale = 1;

	let geometry = new BufferGeometry();

	$: {
		const vertices = new Float32Array(precision * precision * 12);
		const indices = [];

		const range = max.clone().sub(min);
		const inc = range.clone().divideScalar(precision);

		for (let i = 0; i < precision * precision; ++i) {
			const x = min.x + Math.floor(i / precision) * inc.x;
			const z = min.y + ((i * inc.y) % range.y);

			const y1 = f(x, z + inc.y);
			const y2 = f(x + inc.x, z + inc.y);
			const y3 = f(x + inc.x, z);
			const y4 = f(x, z);

			if ([y1, y2, y3, y4].find((y) => typeof y !== 'number' || Number.isNaN(y))) continue;

			vertices[i * 12] = x;
			vertices[i * 12 + 1] = y1;
			vertices[i * 12 + 2] = z + inc.y;

			vertices[i * 12 + 3] = x + inc.x;
			vertices[i * 12 + 4] = y2;
			vertices[i * 12 + 5] = z + inc.y;

			vertices[i * 12 + 6] = x + inc.x;
			vertices[i * 12 + 7] = y3;
			vertices[i * 12 + 8] = z;

			vertices[i * 12 + 9] = x;
			vertices[i * 12 + 10] = y4;
			vertices[i * 12 + 11] = z;

			indices.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 2, i * 4 + 3, i * 4);
		}

		geometry.setAttribute('position', new BufferAttribute(vertices, 3));
		geometry.setIndex(indices);

		const offset = new Vector3();
		geometry.computeBoundingBox();
		geometry.boundingBox!.getCenter(offset).negate();
		geometry.translate(offset.x, 0, offset.z);

		geometry.computeVertexNormals();
		geometry = geometry;
	}
</script>

<T.Mesh {geometry} scale={[-1 / max.x, yScale / Math.max(max.x, max.y), -1 / max.y]}>
	<T.MeshLambertMaterial {color} side={DoubleSide} flatShading={false} />
	<T.LineSegments geometry={new EdgesGeometry(geometry, Infinity)}>
		<T.LineBasicMaterial {color} linewidth={3} />
	</T.LineSegments>
</T.Mesh>
