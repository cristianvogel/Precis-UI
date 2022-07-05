<!-- App.svelte -->

<!-- prevent default mouse actions but allow key events through -->
<svelte:body
        on:mousedown|preventDefault={ ()=>{ window.focus()} }
        on:contextmenu|preventDefault={ ()=>{window.focus()} }
/>

<script lang="ts">
/**
 * Precis-UI © Cristian Vogel 2022
 * No unauthorised use or derivatives!
 * @neverenginelabs
 */
    import Radial from "./components/Radial.svelte";
	import Fader from './components/Fader.svelte'
    import {toFixed} from "./lib/Utils";
    import {readout, touchedID} from "./stores/stores";
    import {Palette as C} from "./types/Precis-UI-TypeDeclarations";
    import Toggle from './components/Toggle.svelte'
    import {Default} from './components/Precis-UI-Defaults'

    function handleOutputValue(event: CustomEvent) {
        readout.set(Number(toFixed(event.detail.value, 6)))
        touchedID.set(event.detail.id)
    }

    function resizeWidgets(ev:CustomEvent) {
        //rescale/redraw with stepped throttle
        //todo: make this a feature
        const throttle = 10
        switch (ev.detail.id) {
            case ('fader.rescale') :
                rescaleFaders = ((Math.round((ev.detail.value) * throttle)) / throttle)
                break;
            case ('dial.rescale') :
                rescaleDials = (Math.round((ev.detail.value) * throttle)) / throttle
                break;
        }

    }

    // Test: Define some dials for scaling the other components
    const dialScaler = {
        id:"dial.rescale",
        rect: { x:100, y:600,  width: 100, height: 100},
        background: C.clear,
        scale: 0.5,
        value: 40, // initial value as percentage?
        label:"Scale Dials",
        min:0,
        max:2 }
    const faderScaler = {
        id:"fader.rescale",
        rect: { x:200, y:600,  width: 100, height: 100 },
        background: C.clear,
        scale: 0.5,
        value: 50, // initial value as percentage?
        label:"Scale Faders",
        min:0,
        max:2
    }

    let posX;
    let posY;
    let rangeTest;
    let rescaleDials, rescaleFaders = 1
    let oddEvenSpreadF;
    let oddEvenSpreadD;

</script>

<main>
    <div id='header'>
        <h1>
            Precision UI
        </h1>
        <h2>
            Made with <a href='https://svelte.dev'>Svelte</a>
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
            <line x1="0.5rem" y1="7.5%" x2="225%" y2="7.5%" stroke='antiqueWhite'/>
        </svg>
        <h3>
            𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
        </h3>
    </div>

<!-- render dials to scale the other widgets -->
    <Radial {...dialScaler} on:output={(e)=>{handleOutputValue(e); resizeWidgets(e)}}/>
    <Radial {...faderScaler} on:output={(e)=>{handleOutputValue(e); resizeWidgets(e)}}/>

<!--
    render a group of dials
    to get fixed positioning use props x= and y=
        example: x={posX} y={posY}
    or pass a new Rect for dynamic transform
        example: rect={{x: posX * rescaleDials, y: posY, width: 100, height: 100}}
-->

    <div style="transform: translateY(-14em)" >
    {#each Array(8) as _, i ('key-d-' + i)}
        <!-- aesthetically, skip the first dial -->
        {#if (i>0)}
            {@const posX = 450 + ((i % 2) * 50)}
            {@const oddEvenSpreadD = rescaleDials * [-1, 1].at(i%2) }
            {@const posY = (((i / 3) % 8) + 1) * 200}
            {@const rangeTest = [1, 10, 100, 16000, 0.1, 1000, 50, 20].at(i)}
            <Radial id="dial.{i}"
                    rect={{  x: posX + (50 * oddEvenSpreadD),
                             y: posY
                           }}
                    min=0
                    max={rangeTest}
                    scale={rescaleDials}
                    on:output={handleOutputValue}
                    dialPointer={true}
                    background='rgba(127,127,127,{i * 0.1})'
            />
        {/if}
    {/each}
    </div>
<!-- render some vert faders -->
	{#each Array(6) as _, i ('key-f-'+i)}
		{@const posX = 100+(i*50)}
        {@const oddEvenSpreadF = rescaleFaders * [-1, 1].at(i%2) }
		{@const rangeTest = [1, 10, 100, 16000, 0.1, 1000, 50, 20].at(i)}
		<Fader id="fader.{i}"
               rect={{ x: posX,
                       y: 250 }}
			   min=0
			   max={rangeTest}
               scale={rescaleFaders}
               label={'Precis-UI ◠◡ '}
			   on:output={handleOutputValue}
        />
	{/each}

<!--- a few groovy buttons -->
    {#each Array(4) as _, i ('key-t-'+i)}
        {@const posX = 100+(i*90)}
        <Toggle x={posX}
                y="700"
                width="81"
                height="50"
                graphicStyle={i%2}
                label= { ['▷' , '⚠︎' , '⏏︎︎︎' , '𝌺' ].at(i) }
                min="0"
                max={i+1}
                id="toggle.{i}"
                on:output={(e)=>{handleOutputValue(e); resizeWidgets(e)}}
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
