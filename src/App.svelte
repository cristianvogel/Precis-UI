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
	<svg style="height: 0.1rem;">
		<line x1="0.5rem" y1="5%" x2="200%" y2="5%" stroke='antiqueWhite'/>
	</svg>
	<h3>
		𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
	{#each Array(4) as _, i }
		<Fader id="fader.{i}"
			   x={100+(i*50)}
			   y="250"
			   min=0
			   max={Math.pow(i + 1, 2)}/>
	{/each}
	{#each Array(4) as _, i}
		<Dial id="dial.{i}"
			  x={300+((i%2)*100)}
			  y={i < 2 ? 250 : 350}
			  min=0
			  max={Math.pow(i + 1, 2)}
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
