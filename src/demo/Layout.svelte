
<script lang="ts">
    /**
     * Precis-UI © Cristian Vogel 2022
     * No unauthorised use or derivatives!
     * @neverenginelabs
     */
    import Radial from "../components/Radial.svelte";
    import Fader from '../components/Fader.svelte'
    import {toFixed} from "../lib/Utils.svelte";
    import {Palette as C} from "../types/Precis-UI-TypeDeclarations.js";
    import Toggle from '../components/Toggle.svelte'
    import {Dirty} from '../stores/stores.js'
    import type { WidgetOutput } from '../lib/PrecisControllers.svelte';

    let {
        readout = $bindable(),
        touchedID = $bindable(),
        rescaleFaders = $bindable(),
        rescaleDials = $bindable()
    } = $props();

    function handleOutputValue(output: WidgetOutput) {
        readout = Number(toFixed(output.value, 6))
        touchedID = output.id
        if (output.id === 'toggle.1') {
            Dirty.resetTo(rescaleDials)
            Dirty.trigger()
            return
        }
        resizeWidgets(output)

    }
    /**
     * This handler is an example of a Svelte use() action
     * assigned to the <main> container of the layout
     * it runs the function in update() when 'changing'
     * changes. Experimentally, try 'changing' as a store
     * signalling that some graphical update is requested
     * @param node
     * @param changing
     */
    function handleRefresh(node: HTMLElement, changing: number) {
        return {
            update(changing: number) {
                manipulateLayout()
            },
            destroy() {
                // the node has been removed
            }
        };
    }

    function manipulateLayout() {
        rescaleDials =  (rescaleDials * -1)
        rescaleFaders = (rescaleFaders * -1)
    }

    function resizeWidgets(output: WidgetOutput) {
        //rescale/redraw with stepped throttle
        //todo: make this a feature
        const throttle = 10
        let { id } = output
        switch (id) {
            case ('fader.rescale') :
                rescaleFaders = ((Math.round(output.value * throttle)) / throttle)
                break;
            case ('dial.rescale') :
                rescaleDials = (Math.round(output.value * throttle)) / throttle
                break;
            default:
        }
    }



    // Test: Define some dials for scaling the other components
    const dialScaler = {
        id:'dial.rescale' as const,
        rect: { x:100, y:600,  width: 100, height: 100},
        background: C.clear,
        scale: 0.5,
        value: 40, // initial value as percentage?
        label:"Scale Dials",
        min:0,
        max:2 }
    const faderScaler = {
        id:'fader.rescale' as const,
        rect: { x:300, y:600,  width: 100, height: 100 },
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
    let oddEvenSpreadF;
    let oddEvenSpreadD;

</script>
<main use:handleRefresh={$Dirty} >

    <!-- render dials to scale the other widgets -->
    <Radial {...dialScaler} output={handleOutputValue} />
    <Radial {...faderScaler} output={handleOutputValue} />

    <!--
        render a group of dials
        to get fixed positioning use props x= and y=
            example: x={posX} y={posY}
        or pass a new Rect for dynamic transform
            example: rect={{x: posX * rescaleDials, y: posY, width: 100, height: 100}}
    -->

        {#each Array(8) as _, i ('key-d-' + i)}
            <!-- aesthetically, skip the first dial -->
            {#if (i>0)}
                {@const posX = 450 + ((i % 2) * 50)}
                {@const oddEvenSpreadD = rescaleDials * ([-1, 1][i % 2] ?? 1)}
                {@const posY = (((i / 3) % 8) + 1) * 150}
                {@const rangeTest = [1, 10, 100, 16000, 0.1, 1000, 50, 20][i] ?? 1}
                <Radial id="dial.{i}"
                        rect={{  x: posX + (50 * oddEvenSpreadD),
                             y: posY
                            }}
                        min={0}
                        max={rangeTest}
                        scale={rescaleDials}
                        dialPointer={true}
                        background='rgba(127,127,127,{i * 0.1})'
                        output={handleOutputValue}
                />
            {/if}
        {/each}

    <!-- render some vert faders -->
    {#each Array(6) as _, i ('key-f-'+i)}
        {@const posX = 100+(i*50)}
        {@const oddEvenSpreadF = rescaleFaders * ([-1, 1][i % 2] ?? 1)}
        {@const rangeTest = [1, 10, 100, 16000, 0.1, 1000, 50, 20][i] ?? 1}
        <Fader id="fader.{i}"
               rect={{ x: posX,
                       y: 250 }}
               min={0}
               max={rangeTest}
               scale={rescaleFaders}
               label={'Precis-UI ◠◡ '}
               output={handleOutputValue}
        />
    {/each}

    <!--- a few groovy buttons -->
    {#each Array(4) as _, i ('key-t-'+i)}
        {@const posX = 100+(i*90)}
        <Toggle x={posX}
                y={700}
                width={81}
                height={50}
                graphicStyle={i%2}
                label= { ['▷' , '⚠︎' , '⏏︎︎︎' , '𝌺' ].at(i) }
                min={0}
                max={i+1}
                id="toggle.{i}"
                output={handleOutputValue}
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
