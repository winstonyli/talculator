<script>
	import 'mathlive';
	import { onMount } from 'svelte';

	/** @type {HTMLCanvasElement} */
	let canvas;

	onMount(async () => {
		if (!navigator.gpu) {
			throw Error('WebGPU not supported.');
		}

		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			throw Error("Couldn't request WebGPU adapter.");
		}

		const device = await adapter.requestDevice();

		const shaders = `
            struct Uniforms {
                resolution: vec2f,
                min: vec3f,
                max: vec3f,
                rotation: vec4f,
            };

            @group(0) @binding(0) var<uniform> uni: Uniforms;
            
            const scale = 
   
            const vertices = array(

            );

            @vertex
            fn vertex_main(@builtin(vertex_index) vi: u32) -> @builtin(position) {
                let pos = array(
                    vec2f(0, 1),  // top left
                    vec2f(1, 1),  // top right
                    vec2f(0, 0),  // bottom left
                    vec2f(1, 0),  // bottom right
                );

                return vec4f(pos[vi], 0, 1);
            }

            @fragment
            fn fragment_main(pos: @builtin(position)) -> @location(0) vec4f {
                return vec4f(0, 0, 1, f32(pos.xyz));
            }
            
            fn func(x: f32, y: f32, z: f32) -> bool {
                return y == sin(x);
            }`;

		const shaderModule = device.createShaderModule({
			code: shaders,
		});

		// `ctx` will only be `null` if another type of context has already been requested.
		const ctx = /** @type {GPUCanvasContext} */ (canvas.getContext('webgpu'));

		ctx.configure({
			device,
			format: navigator.gpu.getPreferredCanvasFormat(),
			alphaMode: 'premultiplied',
		});

		// offset is 2 32bit floats (4bytes each)
		const uniformBufferSize = 4 * 4;

		const uniformValues = new Float32Array(uniformBufferSize / 4);

		uniformValues.set([0, 0, 0, 1], 0);

		const uniformBuffer = device.createBuffer({
			size: uniformBufferSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const renderPipeline = device.createRenderPipeline({
			vertex: {
				module: shaderModule,
				entryPoint: 'vertex_main',
			},
			fragment: {
				module: shaderModule,
				entryPoint: 'fragment_main',
				targets: [
					{
						format: navigator.gpu.getPreferredCanvasFormat(),
					},
				],
			},
			primitive: {
				topology: 'triangle-strip',
			},
			layout: 'auto',
		});

		const commandEncoder = device.createCommandEncoder();

		const passEncoder = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					clearValue: { r: 0, g: 0, b: 1, a: 0.1 },
					loadOp: 'clear',
					storeOp: 'store',
					view: ctx.getCurrentTexture().createView(),
				},
			],
		});

		passEncoder.setPipeline(renderPipeline);
		passEncoder.end();

		device.queue.submit([commandEncoder.finish()]);
	});
</script>

<div class="flex">
	<math-field></math-field>

	<canvas bind:this={canvas} class="w-full"></canvas>
</div>
