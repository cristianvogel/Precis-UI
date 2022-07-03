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

    import Radial from "./components/Radial.svelte";
	import Fader from './components/Fader.svelte'
    import {toFixed} from "./lib/Utils";
    import {Palette as C} from "./lib/PrecisControllers";
    import {readout, touchedID} from "./components/stores";

    function handleOutputValue(event: CustomEvent) {
        readout.set(Number(toFixed(event.detail.value, 6)))
        touchedID.set(event.detail.id)
    }

	let posX;
	let posY;
	let rangeTest;
    let scale;
    let rescaleDials, rescaleFaders = 1

    // Test: Two Dials for scaling the other components
    const dialScaler = {
        id:"dial.rescale",
        x:700, y:300,
        background: C.clear,
        scale: 0.5,
        value: 50, // initial value as percentage?
        label:"Scale Dials",
        min:0,
        max:2 }

    const faderScaler = {
        id:"fader.rescale",
        x:700, y:400,
        background: C.clear,
        scale: 0.5,
        value: 50, // initial value as percentage?
        label:"Scale Faders",
        min:0,
        max:2
    }

    function resizeWidgets(ev:CustomEvent) {
        //rescale/redraw with stepped throttle
        //todo: make this a feature
        const throttle = 10
        switch (ev.detail.id) {
            case ('fader.rescale') :
                rescaleFaders = (Math.round((ev.detail.value) * throttle)) / throttle
                break;
            case ('dial.rescale') :
                rescaleDials = (Math.round((ev.detail.value) * throttle)) / throttle
                break;
        }

    }

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
            Drag with left mouse and use right mouse for precision mode.<br>
        </p>
    </div>

    <div class='footer'>
        <svg style="height: 1rem;">
            <text style="transform:translate(5%, 100%);
				font-size: xx-small" fill="cyan">
                Output from: {$touchedID} - {$readout} - rescale: {rescaleDials} ◌ {rescaleFaders}
            </text>
            <line x1="0.5rem" y1="7.5%" x2="200%" y2="7.5%" stroke='antiqueWhite'/>
        </svg>
        <h3>
            𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
        </h3>
    </div>

    <Radial {...dialScaler} on:output={(e)=>{handleOutputValue(e); resizeWidgets(e)}}/>
    <Radial {...faderScaler} on:output={(e)=>{handleOutputValue(e); resizeWidgets(e)}}/>

<!-- render some dials -->
    {#each Array(4) as _, i ('key-d-' + i)}
        {@const posX = 400 + ((i % 2) * 150)}
        {@const posY = i < 2 ? 250 : 450}
        {@const rangeTest = [1, 10, 100, 16000].at(i)}
        <Radial id="dial.{i}"
                x={posX}
                y={posY}
                min=0
                max={rangeTest}
                scale={rescaleDials}
                on:output={handleOutputValue} />
    {/each}
<!-- render some vert faders -->
	{#each Array(4) as _, i ('key-f-'+i)}
		{@const posX = 100+(i*50)}
		{@const rangeTest = [1, 10, 100, 16000].at(i)}
		<Fader id="fader.{i}"
			   x={posX}
			   y="250"
			   min=0
			   max={rangeTest}
               scale={rescaleFaders}
			   on:output={handleOutputValue}/>
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
