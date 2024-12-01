<script lang="ts">
    import { run, preventDefault } from 'svelte/legacy';

/**
 * Precis-UI © Cristian Vogel 2022
 * No unauthorised use or derivatives!
 * @neverenginelabs
 */

    import {Default, DEFAULT_TAPER} from './Precis-UI-Defaults';
    import {
        BasicController,
        Radial
    } from "../lib/PrecisControllers";
    import {radialTickMarkAt, remap, toNumber} from "../lib/Utils";
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {PointerPlotStore, WidgetStore} from '../stores/stores.js'
import type {DialTag, Rect, Taper, PointsArray, Point} from '../types/Precis-UI-TypeDeclarations';
    import {Palette as C} from "../types/Precis-UI-TypeDeclarations";

    
    interface Props {
        // ingest props from caller
        min?: number;
        // ingest props from caller
        max?: number;
        // ingest props from caller
        fineStep?: number;
        // ingest props from caller
        taper?: Taper;
        // ingest props from caller
        rect?: Rect;
        // ingest props from caller
        x?: number;
        // ingest props from caller
        y?: number;
        // ingest props from caller
        width?: number;
        // ingest props from caller
        height?: number;
        // ingest props from caller
        background?: any;
        // ingest props from caller
        scale?: number;
        // ingest props from caller
        rx?: number;
        // ingest props from caller
        id?: DialTag;
        // ingest props from caller
        label?: string;
        // ingest props from caller
        value?: number;
        // ingest props from caller
        dialPointer?: boolean;
        // ingest props from caller
        tickMarks?: boolean;
        // ingest props from caller
        animatedReadout?: boolean;
    }

    let {
        min = DEFAULT_TAPER.min,
        max = DEFAULT_TAPER.max,
        fineStep = DEFAULT_TAPER.fineStep,
        taper = $bindable({} as Taper),
        rect = $bindable({} as Rect),
        x = Default.X,
        y = Default.Y,
        width = Default.SQUARE,
        height = Default.SQUARE,
        background = Default.DIAL_BACKGROUND,
        scale = Default.DIAL_SCALE_FACTOR,
        rx = Default.FADER_rX,
        id = 'dial.0',
        label = '',
        value = 0,
        dialPointer = true,
        tickMarks = true,
        animatedReadout = true
    }: Props = $props();

    // assert that we do actually have a rect and a taper
    rect = {
            x: toNumber(rect.x || x),
            y: toNumber(rect.y || y),
            width: toNumber(rect.width || width),
            height: toNumber(rect.height || height)
    }

    taper = {
        min: toNumber( taper.min || min),
        max: toNumber(taper.max || max),
        fineStep: toNumber(taper.fineStep || fineStep)
    }

    // initialise with these settings
    const settings = {
        currentValue: value,
        id,
        label,
        dialPointer,
        rect,
        rx: (rx > 0 ? rx : 1),
        scale,
        taper,
        tickMarks,
        background
    }

    // Construct a new instance of a Radial
    let dial:Radial = $state(new Radial(settings))
    BasicController.initialise(dial)

    // a Svelte reactive assigment if needed
    const refresh = ()=> {dial = dial}

    // Hoisted function: Compute and store radial points for the dial overlays
    addPointerPlotToStore()

    onMount( () => {
        // set pointer 'length'
        pointerLength = dial.radialPoints.length
        // send out an initial value message once
        BasicController.dispatchOutput(dial);
    });



    /** addPointerPlotToStore()
     * compute and store PointsArray used to plot the radial polyline
     */
    function addPointerPlotToStore() {
        const plotPoints:PointsArray =  dial.spinPointer()
        $PointerPlotStore.set( dial.id, plotPoints)
        refresh()
    }

    // initialisations needed for parsing Svelte {@const} assignments
    let gearedValue
    let offsetMap
    let sinMap
    let marks
    let numericalReadout = true
    let pointerPlot:PointsArray = $derived(dial.radialPoints)
    let pointerLength:number = $state()
    let roundedReadout:string = $derived(dial.getRoundedReadout())
    let ovrX:number
    let tip:Point
    let adjust;

        // Reactive
    run(() => {
        rect , refresh
    });
    
    
    let registrySize = $derived($WidgetStore.size)

</script>

<!-- Here begins computational graphic design in Svelte/HTML/SVG

Please be aware that this style of graphic design
is accomplished through many hours of iterative design.
I try not to rely too much on oddball magic constants,
but there are places that have required some magic
looking nudges and transforms.

Different graphical components of the SVG are contained
in <g>....</g> with an id to help readability or to further reference
using DOM selectors if needed

-->

<!-- container and functionality -->
<div class='dialContainer'
     id='{dial.id}-container'
     oncontextmenu={preventDefault((e)=>{dial.componentMouseDown(e,dial)})}
     onmousedown={preventDefault((e)=>{dial.componentMouseDown(e, dial)})}
     onmouseenter={preventDefault((e)=>{dial.componentMouseEnter(e, dial)})}
     onmouseleave={(e)=>{refresh(); dial.componentMouseLeave(e, dial)}}
     onmousemove={addPointerPlotToStore}
     onmouseup={()=>(dial.stateFlags={changing: false, focussed: true, precis: false})}
     style={dial.containerTransform(dial, scale, rect )}
>
    <!-- animated numerical readout mojo-->
    {#if dial.changing && animatedReadout}
        {@const value = dial.getNormValue()}
        {@const gearedValue = (value * -200) % 20}
        {@const offsetMap = remap(gearedValue, -10, 10, -0.25, 0.25) + 0.5}
        {@const sinMap = Math.sin(Math.PI * offsetMap)}
        {@const adjust = {
            x: -dial.width * 0.5,
            y: -100 + (gearedValue * 2),
            scale: { x: 1, y: Math.abs(sinMap)  + 0.125 },
            opacity: 0
        }}
        <div id='{dial.id}-animatedReadout'
             class="animatedReadout"
             style="transform: translate( 30%, 55%)" >
            <svg style="position: static;" in:fade|global out:fade|global >
                <g stroke-width='1px'
                   opacity={Math.abs(sinMap) + 0.1}
                   transform="translate ( {adjust.x} {adjust.y} )
                                scale({adjust.scale.x}, {dial.precis ? 1 : adjust.scale.y} )" >
                 <text fill={C.aquaLight}>{roundedReadout}</text>
                </g>
            </svg>
        </div>
    {/if}

<!-- SVG with many procedural transformations -->
    <svg transform="scale(0.9)">  <!-- slight shrinkage of dial within container -->

        <!-- dynamically changing colours defined here -->
        <defs id='{dial.id}-gradients'>
            <radialGradient cx=50%
                            cy=50%
                            fx=100%
                            gradientTransform=rotate({270/12})
                            id='{dial.id}-grad'
                            r={remap(dial.getNormValue(),0,1,2,0.75)}
            >
                <stop offset="5%" stop-color="darkblue"/>
                <!-- todo: pull up a colour assign method -->
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan, C.whiteBis ].at(registrySize%5)}/>
                <stop offset="99%" stop-color="aquamarine"/>
            </radialGradient>
        </defs>

<!-- circle body -->
        <g id='{dial.id}-circleBody' stroke-width="8"
           transform="translate( {dial.width * 0.5} {dial.height * 0.5} )" >
            <circle id='{dial.id}-circleFigure'
                    fill=#112211
                    r={ dial.width * (1/ dial.rx) } />
<!-- circle ring   -->
            <circle id='{dial.id}-circleRingFigure'
                    fill=transparent
                    r={ dial.width * (1/ dial.rx) }
                    stroke="url('#{dial.id}-grad')"/>
        </g>

<!-- label -->
        <g id='{dial.id}-label'>
            <text class:label={dial.label}
                  x="50%" y="5%"
                  dominant-baseline="middle"
                  text-anchor="middle">
                {dial.label}
            </text>
        </g>
    </svg>
    <svg transform="scale(0.9)" >
      <g id='{dial.id}-dialOverlays'
         transform="scale( {(dial.width / (Default.RADIAL_OVERLAY_rX * 2))} )" >

<!-- tick marks  -->
                {#if tickMarks}
                <g id='{dial.id}-ticks'>
                    {#each Array(Default.DIAL_TICKMARKS_COUNT) as tick, i}
                        {@const marks = radialTickMarkAt(i)}
                        <line x1={marks.x1}
                              x2={marks.x2}
                              y1={marks.y1}
                              y2={marks.y2}
                              stroke-width='2px'
                              stroke = {i<(dial.getNormValue()*10) ? C.cyan : C.clear}
                        />
                    {/each}
                </g>
                {/if}

 <!-- pointer plot -->
                <g id="pointerPlot" stroke-width=8>
                {#each pointerPlot.slice(4,14) as {x, y}, i}
                    {@const width = dial.precis ? 5 : 2}
                    {@const ovrX = Default.RADIAL_OVERLAY_rX}
                    {#if dialPointer}
                        {#if (i < pointerLength - 4)}
                            <polyline id='{dial.id}-pointer'
                                      points={`${x},${y},${ovrX},${ovrX}`}
                                      stroke-width={width - (i/2)}
                                      stroke='rgba(250,250,250,0.5)'
                            />
                        {/if}
                    {/if}

    <!-- LED indicator-->
                    {#if dial.focussed}
                        {@const value = dial.getNormValue()}
                        {@const tip = pointerPlot.at(-6)}
                        {@const gearedValue = ((value * 100) % 10) - 10}
                        <circle cx="80%" cy="80%" r = "4px"
                              stroke={C.cyan}
                                fill={C.clear}
                              stroke-width="2"
                              opacity={Math.abs(gearedValue / 10) - 0.1}
                        />
                    {/if}
                {/each}
                </g>
    <!-- readouts -->
            {#if (numericalReadout && !dial.changing)}
                <g in:fade|global out:fade|global>
                    <text id='{dial.id}-readout'
                          class={ dial.precis ? 'readout dial precis' : 'readout dial' }
                          style={ dial.focussed ? 'fill: aqua;' : '' }>
                            {roundedReadout}
                            {dial.precis ? '⋯' : ' ▹'}
                    </text>
                </g>
            {/if}
    </g>
    </svg>
</div>


<style>
    svg {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: visible;
        transform-origin: center;
    }

    .dialContainer {
        position: absolute;
        border-radius: 25px;
        z-index: 0
    }

    .readout {
        font-family: 'Roboto', sans-serif;
        font-size: medium;
        transform: translate(-3rem, 0.5rem);
        stroke-width: 0;
        fill: grey;
        cursor: grab;
    }

    .readout.dial {
        transform: translate(0rem, -0.5rem);
        pointer-events: none;
    }

    .readout.dial.precis {
        font-size: x-large;
        fill: aqua;
        transform: translate(-0.5rem, -0.5rem);
    }

    .label {
        font-size: 1.5rem;
        filL: aliceblue;
        transform: translateY(8rem);
    }

    .animatedReadout {
        position: absolute;
        background-color: transparent;
        font-size: xx-large;
        z-index: 100;
    }

</style>
