<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DEFAULT_RECT, DEFAULT_TAPER} from './Precis-UI-Defaults';
    import {
        BasicController,
        Radial
    } from "../lib/PrecisControllers";
    import {radialTickMarkAt, remap, toNumber} from "../lib/Utils";
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {PointerPlotStore, WidgetStore} from '../stores/stores.js'
    import type {DialTag, Rect, Taper, PointsArray} from "../types/Precis-UI-TypeDeclarations";
    import {Palette as C} from "../types/Precis-UI-TypeDeclarations";

    export let
        min:number = DEFAULT_TAPER.min,
        max:number = DEFAULT_TAPER.max,
        fineStep:number = DEFAULT_TAPER.fineStep,
        taper:Taper = {} as Taper,
        rect:Rect = {} as Rect,
        x:number = Default.X,
        y:number = Default.Y,
        width:number = Default.SQUARE,
        height:number = Default.SQUARE,
        background = Default.DIAL_BACKGROUND,
        scale:number = Default.DIAL_SCALE_FACTOR,
        rx:number = Default.FADER_rX,
        id:DialTag = 'dial.0',
        label:string = '',
        value:number = 0,
        dialPointer:boolean = true,
        tickMarks:boolean = true,
        animatedReadout:boolean = true;

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
        background: C.dim
    }

    // Construct a new instance of a Radial
    let dial:Radial = new Radial(settings)
    BasicController.initialise(dial)
    const refresh = ()=> {dial = dial}

    addPointerPlotToStore()

    onMount( () => {
        pointerLength = dial.radialPoints.length
        dial.dispatchOutput( dial.id, dial.getMappedValue());
    });

    let gearedValue
    let offsetMap
    let sinMap
    let marks
    let numericalReadout = true
    let pointerPlot:PointsArray
    let pointerLength:number
    let roundedReadout:string
    let ovrX:number

    $:rect , refresh
    $:pointerPlot =  dial.radialPoints
    $:roundedReadout = dial.getRoundedReadout()
    $:registrySize = $WidgetStore.size
    // compute the current PointsArray used to plot the radial polyline
    function addPointerPlotToStore() {
        const plotPoints:PointsArray =  dial.spinPointer()
        $PointerPlotStore.set( dial.id, plotPoints)
        refresh() // reactive assignment
    }


</script>


<div class='dialContainer'
     id='{dial.id}-container'
     on:contextmenu|preventDefault={ (e)=>{dial.componentMouseDown(e,dial)} }
     on:mousedown|preventDefault={ (e)=>{dial.componentMouseDown(e, dial)} }
     on:mouseenter|preventDefault={ (e)=>{dial.componentMouseEnter(e, dial)} }
     on:mouseleave={ (e)=>{refresh(); dial.componentMouseLeave(e, dial)} }
     on:mousemove={addPointerPlotToStore}
     on:mouseup={()=>(dial.stateFlags={changing: false, focussed: true, precis: false})}
     style={dial.containerTransform(dial, scale, rect )}
>
    <!-- animated numerical readout mojo-->
    {#if dial.changing && animatedReadout}
        {@const value = dial.getNormValue()}
        {@const gearedValue = (value * -200) % 20}
        {@const offsetMap = remap(gearedValue, -10, 10, -0.25, 0.25) + 0.5}
        {@const sinMap = Math.sin(Math.PI * offsetMap)}
        <div id='{dial.id}-animatedReadout'
             class="animatedReadout"
             style="transform: translate( 30%, 55%)" >
            <svg in:fade out:fade >
                <g stroke-width='1px'
                   opacity={Math.abs(sinMap) + 0.1}
                   transform="translate ( {-dial.width * 0.5} {-100 + (gearedValue * 2)} )
                                scale(1, {Math.abs(sinMap)  + 0.125} )" >
                 <text fill={C.aquaLight}>{roundedReadout}</text>
                </g>
            </svg>
        </div>
    {/if}
<!-- SVG defs -->
    <svg transform="scale(0.9)">
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
                />
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
    <!-- tick marks -->
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
                {#each pointerPlot as {x, y}, i}
                    {@const width = dial.precis ? 10 : 5}
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
                    {#if (i === pointerLength - 1) && dial.focussed}
                        {@const value = dial.getNormValue()}
                        {@const gearedValue = ((value * 100) % 10) - 10 }
                        <line x1={x} y1={y} x2={ovrX} y2={ovrX}
                              stroke={C.cyan}
                              stroke-width="8"
                              opacity={Math.abs(gearedValue / 10) - 0.1}
                        />
                    {/if}
                {/each}
                </g>
    <!-- readouts -->
            {#if (numericalReadout && !dial.changing) }
                <g in:fade out:fade>
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
