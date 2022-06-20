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

	let faderUID:number = 0;
	let dialUID:number = 0;
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
		Optionally, hold shift during drag.

	</p>
</div>

<div class='footer'>
	<svg style="height: 0.1rem;">
		<line x1="0.5rem" y1="5%" x2="200%" y2="5%" stroke='antiqueWhite'/>
	</svg>
	<h3>
		𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
	<Fader id="fader.{faderUID++}" x="100" y="250" />
	<Fader id="fader.{faderUID++}" x="150" y="250" />
	<Fader id="fader.{faderUID++}" x="200" y="250" />
	<Fader id="fader.{faderUID++}" x="250" y="250" />
	<Dial id="dial.{dialUID++}" x="350" y="250" width="100" height="100"/>
	<Dial id="dial.{dialUID++}" x="450" y="250" width="100" height="100" />
	<Dial id="dial.{dialUID++}" x="350" y="350" width="100" height="100" />
	<Dial id="dial.{dialUID++}" x="450" y="350" width="100" height="100" />
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
