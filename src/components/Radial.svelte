<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper, Point, PointsArray} from "../types/precisUI";
    import type { DialTag, Tint} from "../lib/PrecisController";
    import { radialTickMarkAt, remap, toNumber} from "../lib/utils";
    import {Taper, Rect, Palette as C, Radial, BasicController} from "../lib/PrecisController";
    import {afterUpdate, onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {PointerPlotStore, WidgetStore, MouseLocationStore} from './stores.js'
    import {addListeners} from "../lib/Listeners";


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
        touchedID:string = '',
        value:number = 0,
        pointer:boolean = true,
        tickMarks:boolean = true

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
        pointer: false,
        rect,
        rx,
        scale,
        taper,
        tickMarks: true,
    }



    // Construct a new instance and compute the current PointsArray
    // used to plot the radial pointer
    let dial:Radial | BasicController = new Radial(settings)
    let pointerPlot:PointsArray
    let pointerLength:number
    let lockedMousePoint:Point
    let registrySize

    function addSelfToRegistry() {
        $WidgetStore.set(dial.id, dial)
    }

    function addPointerPlotToStore( ) {
       const plotPoints:PointsArray =  dial.spinPointer()
        $PointerPlotStore.set( dial.id, plotPoints)
        dial=dial
      //  lockedMousePoint=lockedMousePoint
    }

    addPointerPlotToStore()
    $:pointerPlot =  dial._radialPoints
    $:pointerLength = dial._radialPoints.length
    $:lockedMousePoint =  $MouseLocationStore

    // this is the transform that places the container DIV element
    const containerTransform = function () {
        const newStyle =`${dial.generateRectCSS()};
                          transform: scale(${dial.scale});
                          background: ${dial.background};`
        return newStyle
    };

     function componentMouseDown(event: MouseEvent ): void {
        if (!event.target) return
        console.info('Element ◻︎ ' + event.target + ' ⇢ ' + dial.id)
         const mode = (event.type)
         dial.stateFlags = {
             changing: true,
             precis: (mode === 'contextmenu'),
             focussed: true
        }
         dial.selected = event.target as HTMLElement
         addListeners(dial.selected, dial)
    }

    function componentMouseLeave() {
         if (dial.changing) return
         dial.focussed= false
    }

    function componentMouseEnter(event: MouseEvent) {
        dial.selected = event.target as HTMLElement
        dial.selected.focus()
        dial.focussed=true
    }

    afterUpdate(() => {
         // maybe widget needs to update itself in the registry
        // after changes?
      //  dial.resize(dial.scale, dial.id)
     //   addSelfToRegistry()
    });

    onMount( () => {
        addSelfToRegistry()
       $: registrySize = $WidgetStore.size
        console.log( 'Widget Store size ▷ ' + $WidgetStore.size)
        dial.dispatchOutput( dial.id, dial.getMappedValue(),);
    })

</script>
{#if dial.changing}
<div in:fade out:fade style="z-index:1000;position: absolute;
top:{lockedMousePoint.y}px;
left:{lockedMousePoint.x}px;
background-color: transparent; color:whitesmoke; opacity:0.5;
transform:
translateY( {(((dial.getNormValue()*-400)%dial.height) / 16)}px)
scale(2)">
       ⦿
</div>{/if}
<div class='dialContainer'
     id='{dial.id}-container'
     on:contextmenu|preventDefault={componentMouseDown}
     on:mousedown|preventDefault={componentMouseDown}
     on:mouseenter|preventDefault={componentMouseEnter }
     on:mouseleave={componentMouseLeave}
     on:mousemove={addPointerPlotToStore}
     style={containerTransform()}
>
    <!--{@debug dial}-->
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
                <!-- todo: abstract out the colour assign -->
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan ].at(registrySize%4)}/>
                />
                <stop offset="99%" stop-color="aquamarine"/>
            </radialGradient>
        </defs>

        <g id='{dial.id}-dialBody' stroke-width=8>
            <circle id='{dial.id}-circleFigure'
                    cx=50%
                    cy=50% fill=#112211
                    r={(dial.rx * 0.9) +'rem'} stroke="url('#{dial.id}-grad')"
            />
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
            {#each pointerPlot as {x, y}, i}
                {@const width = dial.precis ? 10 : 5}
                {#if (i < pointerLength - 4)}
                    <polyline id='{dial.id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              stroke-width={width - (i/2)}
                              stroke='rgba(250,250,250,0.5)'/>
                {/if}
                {#if (i === pointerLength - 1) && dial.focussed}
                    <circle id='{id}-LED'
                            cx=90% cy=90% r=3
                            fill=aqua
                            in:fade out:fade/>
                {/if}
            {/each}
            <text id='{dial.id}-readout'
                  class={ dial.precis ? 'readout dial precis' : 'readout dial' }
                  style={ dial.focussed ? 'fill: aqua;' : '' }>
                  {dial.getMappedValue().toPrecision(dial.precis ? 6 : 3)}{dial.precis ? '⋯' : ' ▹'}
            </text>
            <g id='{dial.id}-label'>
                <text class:label={dial.label}
                      x="50%" y="5%"
                      dominant-baseline="middle"
                      text-anchor="middle">
                    {dial.label}
                </text>
            </g>
        </g>
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
</style>
