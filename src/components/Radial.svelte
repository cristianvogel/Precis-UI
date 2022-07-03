<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper, PointsArray} from "../types/precisUI";
    import type {DialTag, Tint} from "../lib/PrecisControllers";
    import {
        Palette as C,
        Radial,
        Rect,
        Taper
    } from "../lib/PrecisControllers";
    import {radialTickMarkAt, remap, roundTo, toNumber} from "../lib/Utils";
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {PointerPlotStore, WidgetStore} from './stores.js'
    import read_script from "svelte/types/compiler/parse/read/script";

    let gearedValue;
    let offsetMap;
    let sinMap;
    let marks;
    let numericalReadout = true;
    let pointerPlot:PointsArray
    let pointerLength:number
    let registrySize
    let roundedReadout:string

    export let
        min:number = DefaultTaper.MIN,
        max:number = DefaultTaper.MAX,
        fineStep:number = DefaultTaper.FINE,
        x:number = Default.X,
        y:number = Default.Y,
        width:number = Default.DIAL_SQUARE,
        background:Tint = C.dim,
        scale:number = Default.DIAL_SCALE_FACTOR,
        rx:number = Default.RX,
        id:DialTag = 'dial.0',
        label:string = '',
        value:number = 0,
        pointer:boolean = true,
        tickMarks:boolean = true,
        animatedReadout:boolean = true

    const rect:Rect = {
        x: toNumber(x),
        y: toNumber(y),
        width: toNumber(width),
        height: toNumber(width)
    }
    const taper:Taper = {
        min: toNumber(min),
        max: toNumber(max),
        fineStep: toNumber(fineStep)
    };

    const settings = {
        currentValue: value,
        id,
        label,
        pointer: true,
        rect,
        rx,
        scale,
        taper,
        tickMarks: true,
    }

    // Construct a new instance of a Radial
    let dial:Radial = new Radial(settings)

    const initialise = function () {
        // add self to a layout group registry
        function addSelfToRegistry() {
            $WidgetStore.set(dial.id, dial)
        }
        // this is the transform which renders the container DIV element
        const containerTransform = function (s?:number) {
            return `${dial.getCSSforRect()};
                  transform: scale(${ s || dial.scale});
                  background: ${dial.background};`
        }
        // the Svelte reactive assigment
        function reactiveAssignment() {
            dial=dial
        }
        return {
            addSelfToRegistry,
            containerTransform,
            reactiveAssignment
        };
    };
    // compute the current PointsArray used to plot the radial polyline
    function addPointerPlotToStore( ) {
       const plotPoints:PointsArray =  dial.spinPointer()
        $PointerPlotStore.set( dial.id, plotPoints)
        dial=dial // reactive assignment
    }

    const { addSelfToRegistry, containerTransform, reactiveAssignment } = initialise();

    addPointerPlotToStore()

    $:scale, reactiveAssignment()
    $:pointerPlot =  dial.radialPoints
    $:roundedReadout =
        roundTo(dial.getMappedValue(), dial.precis ? 1.0e-4 : 1.0e-2)
        .toFixed(dial.precis ? 3 : 1)

    onMount( () => {
        addSelfToRegistry()
        pointerLength = dial.radialPoints.length
        registrySize = $WidgetStore.size
        dial.dispatchOutput( dial.id, dial.getMappedValue(),);
    });
</script>


<div class='dialContainer'
     id='{dial.id}-container'
     on:contextmenu|preventDefault={ (e)=>{dial.componentMouseDown(e,dial)} }
     on:mousedown|preventDefault={ (e)=>{dial.componentMouseDown(e, dial)} }
     on:mouseenter|preventDefault={ (e)=>{dial.componentMouseEnter(e, dial)} }
     on:mouseleave={ (e)=>{reactiveAssignment(); dial.componentMouseLeave(e, dial)} }
     on:mousemove={addPointerPlotToStore}
     on:mouseup={()=>(dial.stateFlags={changing: false, focussed: true, precis: false})}
     style={containerTransform(scale)}
>
    <!-- animated numerical readout mojo-->
    {#if dial.changing && animatedReadout}
        {@const value = dial.getNormValue()}
        {@const gearedValue = (value * -200) % 20}
        {@const offsetMap = remap(gearedValue, -10, 10, -0.25, 0.25) + 0.5}
        {@const sinMap = Math.sin(Math.PI * offsetMap)}
        <div id='{dial.id}-animatedReadout'
             class="animatedReadout"
             style="transform: translate( 30%, 60%)" >
            <svg in:fade out:fade >
                <g stroke-width='1px'
                   opacity={Math.abs(sinMap) + 0.1}
                   transform="translate ( {-dial.width * 0.5} {-100 + (gearedValue * 2)} )
                                scale(1, {Math.abs(sinMap)  + 0.125} )"
                > <text fill={C.aquaLight}>{roundedReadout}</text>
                </g>
            </svg>
        </div>
    {/if}

    <svg transform=scale(0.9)>
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
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan ].at(registrySize%4)}/>
                />
                <stop offset="99%" stop-color="aquamarine"/>
            </radialGradient>
        </defs>

<!-- circle body -->
        <g id='{dial.id}-circleBody' stroke-width=8>
            <circle id='{dial.id}-circleFigure'
                    cx=50%
                    cy=50% fill=#112211
                    r={(dial.rx * 0.9) +'rem'} />
        </g>

<!-- circle ring   -->
            <g id='{dial.id}-colourRing' stroke-width=8>
                <circle id='{dial.id}-circleRingFigure'
                        cx=50%
                        cy=50% fill=transparent
                        r={(dial.rx * 0.9) +'rem'}
                        stroke="url('#{dial.id}-grad')"/>
            </g>

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
                          stroke = {i<(dial.getNormValue()*10) ? `aquamarine` : 'grey'}
                    />
                {/each}
            </g>
            {/if}
<!-- pointer plot -->
            <g id="pointerPlot" stroke-width=8>
            {#each pointerPlot as {x, y}, i}
                {@const width = dial.precis ? 10 : 5}
                {#if (i < pointerLength - 4)}
                    <polyline id='{dial.id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              stroke-width={width - (i/2)}
                              stroke='rgba(250,250,250,0.5)'/>
                {/if}
<!-- LED indicator-->
                {#if (i === pointerLength - 1) && dial.focussed || dial.changing}
                    {@const value = dial.getNormValue()}
                    {@const gearedValue = ((value * 100) % 10) - 10 }
                    <circle id='{id}-LED'
                            cx=90% cy=90% r= 3
                            fill=aqua
                            opacity={Math.abs(gearedValue / 10) - 0.1}
                            in:fade out:fade/>
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
            <g id='{dial.id}-label'>
                <text class:label={dial.label}
                      x="50%" y="5%"
                      dominant-baseline="middle"
                      text-anchor="middle">
                    {dial.label}
                </text>
            </g>
            {/if}
    </svg>
</div>


<style>
    svg {
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
