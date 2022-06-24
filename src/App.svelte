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
	import {PrecisUI} from "./lib/PrecisController";
	import {setContext} from "svelte";

	let readout, touchedID;
	let rescaleDials = writable( Default.DIAL_SCALE_FACTOR )
	let rescaleFaders = writable( Default.FADER_SCALE_FACTOR)


	const dialScaler = {
		id:"dial.rescale.3",
		x:600, y:300,
		background: C.clear,
		scale: 0.5,
		value: 50, // initial value as percentage?
		label:"Scale Dials",
		min:0,
		max:2 }

	const faderScaler = {
		id:"fader.rescale.2",
		x:600, y:400,
		background: C.clear,
		scale: 0.5,
		value: 50, // initial value as percentage?
		label:"Scale Faders",
		min:0,
		max:2}

	function handleOutputValue(ev){

		//rescale/redraw with stepped throttle
		//todo: make this a feature
		const throttle = 10
		switch (ev.detail.id) {
			case ('fader.rescale.2') :
				$rescaleFaders = (Math.round((ev.detail.value) * throttle)) / throttle
				break;
			case ('dial.rescale.3') :
				$rescaleDials = (Math.round((ev.detail.value) * throttle)) / throttle
				break;
		}
	};

	const precis = new PrecisUI( 'TestApp' )
	setContext('precisUI', precis )

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
		<text style="transform:translate(5%, 100%);
				font-size: xx-small" fill="cyan">
			Output from: {touchedID} - {readout}
		</text>
		<line x1="0.5rem" y1="7.5%" x2="200%" y2="7.5%" stroke='antiqueWhite'/>
	</svg>
	<h3>
		𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
	<Dial {...dialScaler} on:output={handleOutputValue}/>
	<Dial {...faderScaler} on:output={handleOutputValue}/>
	{#each Array(4) as _, i ('key-'+i)}
		{@const posX = 100+(i*50)}
		{@const ranges = Math.pow(i + 1, 2) }
		<Fader id="fader.{i}"
			   x={posX}
			   y="250"
			   min=0
			   max={ranges}
			   scale={$rescaleFaders}
			   bind:touchedID={touchedID}
			   bind:value={readout}
		/>
	{/each}
		{#each Array(4) as _, i ('key-'+i)}
			{@const posX = 300+((i%2)*150)}
			{@const posY = i < 2 ? 250 : 450}
			{@const rangeTest = [1,10,100,16000].at(i)}
			<Dial id="dial.{i}"
				  x={posX}
				  y={posY}
				  min=0
				  max={rangeTest}
				  scale={$rescaleDials}
				  bind:value={readout}
				  bind:touchedID={touchedID}
			/>
		{/each}
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
