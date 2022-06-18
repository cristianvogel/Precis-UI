<!--
	// Precision Audio UI © Cristian Vogel 2022
	// No unauthorised use or derivatives!
	// contact @neverenginelabs
-->

<!-- prevent default mouse actions but allow key events through -->
<svelte:body
		on:mousedown|preventDefault={ (e)=>{ window.focus()} }
		on:contextmenu|preventDefault={ (e)=>{window.focus()} }
/>

<script>
	// Precision Audio UI © Cristian Vogel 2022
	// No unauthorised use or derivatives!
	// @neverenginelabs

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
		Operate with both mouse buttons.<br>
		For precision mode, hold shift during drag.
	</p>
</div>

<div class='footer'>
	<h3>
		<a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
	<Fader/>
	<Dial/>
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
