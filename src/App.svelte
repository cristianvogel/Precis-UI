<!-- App.svelte
	// Precision Audio UI © Cristian Vogel 2022
	// No unauthorised use or derivatives!
	// contact @neverenginelabs
-->

<!-- prevent default mouse actions but allow key events through -->
<svelte:body
		on:mousedown|preventDefault={ ()=>{ window.focus()} }
		on:contextmenu|preventDefault={ ()=>{window.focus()} }
/>

<script lang="ts">
	import Fader from "./components/Fader.svelte";
	import Dial from "./components/Dial.svelte";
	import {C, Default} from "./types/precisUI";
	import { writable } from 'svelte/store';

	let readout;
	let rescale = writable( Default.DIAL_SCALE_FACTOR )

	const scaleDial = {
		id:"dial.rescale",
		x:500, y:250,
		background: C.clear,
		scale: 0.55,
		value: 50, // initial value as percentage!
		label:"Graphic Scale",
		min:0.125,
		max:0.875 }

	function handleOutputValue(ev){
		//rescale/redraw with stepped throttle
		//todo: make this a feature
		const throttle = 10
		$rescale =( Math.round((ev.detail.value) * throttle))  / throttle

		console.log( `Output value receive: ${ev.detail.value}\n
		from dial: ${ev.detail.id}`)
	};

</script>

<main>
<div id='header'>
	<h1>
		Precision UI Controls
	</h1>
	<h2>
		for <a href='https://svelte.dev'>Svelte</a>
	</h2>
	<p>
		Mouse buttons for changing gear.<br>
		Optionally, hold shift during drag.<br>
		Double click to jump.
	</p>
</div>

<div class='footer'>
	<svg style="height: 1rem;">
		<text style="transform:translate(5%, 100%); font-size: xx-small" fill="cyan"> {readout}</text>
		<line x1="0.5rem" y1="7.5%" x2="200%" y2="7.5%" stroke='antiqueWhite'/>
	</svg>
	<h3>
		𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
	<Dial {...scaleDial} on:output={handleOutputValue}/>
	{#each Array(4) as _, i ('key-'+i)}
		{@const posX = 100+(i*50)}
		{@const ranges = Math.pow(i + 1, 2) }
		<Fader id="fader.{i}"
			   x={posX}
			   y="250"
			   min=0
			   max={ranges}
		/>
	{/each}
	{#key $rescale}
		{#each Array(4) as _, i ('key-'+i)}
			{@const posX = 300+((i%2)*100)}
			{@const posY = i < 2 ? 250 : 350}
			{@const rangeTest = [1,10,100,16000].at(i)}
			<Dial id="dial.{i}"
				  x={posX}
				  y={posY}
				  min=0
				  max={rangeTest}
				  bind:value={readout}
				  scale={$rescale}
			/>
		{/each}
	{/key}
</main>


<style>
	main {
		text-align: left;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

</style>
