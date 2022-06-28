<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper} from "../types/precisUI";
    import { RadialSettings} from "../lib/Radial";
    import type {CommonSettings, DialTag, Tint} from "../lib/PrecisController";
    import {radialPoints, radialTickMarkAt, remap, toNumber} from "../lib/utils";
    import {Taper, Rect, C, PrecisUI, Radial} from "../lib/PrecisController";
    import {afterUpdate, getContext, onMount} from "svelte";
    import {fade} from 'svelte/transition';

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
        value:number = 0,
        id:DialTag = 'dial.0',
        label:string = '',
        touchedID:DialTag = '',
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
    const settings:CommonSettings & RadialSettings = {
        currentValue: value,
        id,
        label,
        pointer: false,
        rect,
        rx,
        scale,
        taper,
        tickMarks: false
    }

    const dial:Radial = new Radial(settings)

    const containerTransform = function () {
        const newStyle =`${dial.generateRectCSS()};
                          transform: scale(${dial.scale});
                          background: ${dial.background};`
        return newStyle
    };

    afterUpdate(() => {
        dial.resize(dial.scale)
    });

    onMount( () => {
        dial.dispatchOutput(dial.getMappedValue(), dial.id);
    })

    $: dialPointer = radialPoints(dial.radialTrack(), 50, 50, 10, 55, 20)
</script>

<div class='dialContainer'
     id='{dial.id}-container'
     on:contextmenu|preventDefault={dial.handleMouseDown}
     on:mousedown|preventDefault={dial.handleMouseDown}
     on:mouseenter|preventDefault='{(e)=>{e.target.focus();  dial.stateFlags.changing=true}}'
     on:mouseleave='{()=>{dial.stateFlags.changing=(dial.selected !== null)}}'
     style={containerTransform()}
>

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
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan ].at(1)}/> //at(dial.index%4)
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
            <g id='{dial.id}-ticks'>
                {#each Array(Default.DIAL_TICKMARKS_COUNT) as tick, i}
                    {@const tickMarks = radialTickMarkAt(i)}
                    <line x1={tickMarks.x1}
                          x2={tickMarks.x2}
                          y1={tickMarks.y1}
                          y2={tickMarks.y2}
                          stroke-width='2px'
                          stroke = {i<(dial.getNormValue()*10) ? `aquamarine` : 'grey'}
                    />
                {/each}
            </g>
            {#each dialPointer as {x, y}, i}
                {@const width = dial.stateFlags.precis ? 10 : 5}
                {#if (i < dialPointer.length - 4)}
                    <polyline id='{dial.id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              stroke-width={width - (i/2)}
                              stroke='rgba(250,250,250,0.5)'/>
                {/if}
                {#if (i === dialPointer.length - 1) && dial.stateFlags.changing}
                    <circle id='{id}-LED'
                            cx=90% cy=90% r=2
                            fill=aqua
                            in:fade out:fade/>
                {/if}
            {/each}
            <text id='{dial.id}-readout'
                  class={ dial.precis ? 'readout dial precis' : 'readout dial' }
                  style={dial.changing ? 'fill: aqua;' : ''}>
                {dial.getMappedValue().toPrecision(dial.precis ? 6 : 3)}{dial.stateFlags.precis ? '⋯' : ' ▹'}
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
