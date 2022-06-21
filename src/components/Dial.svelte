<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, radialPoints, remap, toNumber} from '../lib/utils.ts';
    import {onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import type {BoundingRectCSS, Dial, Rect, Taper, DialTag} from "../types/precisUI";
    import { C, DefaultTaper, Default} from "../types/precisUI";

    let
        selected = null,
        clientRect = null;

    export let
        min = DefaultTaper.MIN,
        max = DefaultTaper.MAX,
        fineStep = DefaultTaper.FINE,
        x = Default.X,
        y = Default.Y,
        width = Default.DIAL_SQUARE,

        scale:number = Default.DIAL_SCALE_FACTOR,
        rx:number = Default.RX,
        value:number = 0,
        id:DialTag = 'dial.0'

    //todo: improve type assert checks to work with DOM units like %, px etc
        rx = rx as number
        const taper:Taper = {
            min: toNumber(min),
            max: toNumber(max),
            fineStep: toNumber(fineStep),
            curve: 'LINEAR'
        };
        const rect:Rect = {
            x: toNumber(x),
            y: toNumber(y),
            width: toNumber(width),
            height: toNumber(width)
        }

    const dial: Dial = {
        currentValue: value,
        id,
        rect,
        rx,
        taper,
        scale,
        get x():number { return this.rect.x },
        get y():number {return this.rect.y},
        set x( number:number ) { this.rect.x = number },
        set y( number:number ) { this.rect.y = number },
        get width():number {return this.rect.width},
        get height():number {return this.rect.height},
        set width(w:number) { this.rect.width = toNumber(w) + rx },
        set height(h:number) { this.rect.height = toNumber(h) },
        label: 'hold shift for fine tuning',
        precis: false,
        changing: false,
        background: C.clear,
        get radialTrack() {
            //todo: make configurable
            return (this.normValue * 270) + 230
        },
        get index(): number {
            return (Number.parseInt(<string>Array.from(this.id).at(-1))) //todo: what if id >10 ?
        },
        get boundingBoxCSS():BoundingRectCSS {
            return <BoundingRectCSS>
                    `top:${this.rect.y}px;
                    left:${this.rect.x}px;
                    width:${this.rect.width}px;
                    height:${this.rect.height}px;`
        },
        get normValue():number {
            return this.currentValue / this.rect.height
        },
        get mappedValue():number {
            return remap( this.normValue, 0 ,1, this.taper.min, this.taper.max)
        }
    }

    function handleModifier(ev) {
        const shift = ev.shiftKey && ev.type === 'keydown';
        dial.precis = shift
        if (shift) {
            removeEventListener('mousemove', handleMouseMoveJump)
            addEventListener('mousemove', handleMouseMovePrecision)
        } else {
            removeEventListener('mousemove', handleMouseMovePrecision)
            addEventListener('mousemove', handleMouseMoveJump)
        }
    }

    function handleMouseDownPrecision(event) {
        selected = event.target
        dial.precis = true
        removeEventListener('mousemove', handleMouseMoveJump)
        addEventListener('mousemove', handleMouseMovePrecision)
        addEventListener('mouseup', handleMouseUp)
    }

    function handleMouseMovePrecision(event) {
        clientRect = selected.getBoundingClientRect()
        const dy = event.movementY
        if (dy === 0) {return}
        const {currentValue, taper, height} = dial
        if (taper) {
            dial.currentValue = clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
        }
    }

    function handleMouseDownJump(event) {
        selected = event.target
        if (dial.precis) return
        selected.focus()
        addEventListener('mousemove', handleMouseMoveJump)
        addEventListener('mouseup', handleMouseUp)
        addEventListener('keydown', handleModifier)
        addEventListener('keyup', handleModifier)
    }

    function handleMouseMoveJump(event) {
        clientRect = selected.getBoundingClientRect()
        const dy = event.movementY
        if (dy === 0) {return}
        const {currentValue, height, normValue} = dial
        dial.currentValue = clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
    }

    function handleMouseUp() {
        selected = null
        dial.precis = false
        dial.changing = false
        removeEventListener('mousemove', handleMouseMovePrecision)
        removeEventListener('mousemove', handleMouseMoveJump)
        removeEventListener('mouseup', handleMouseUp)
        removeEventListener('keydown', handleModifier)
        removeEventListener('keyup', handleModifier)
    }

    let dialPointer;
    $: dialPointer = radialPoints(dial.radialTrack, 50, 50, 10, 55, 10)

    onMount(() => {
        // TODO: turn into a setRectFromParent method
        const dialContainer = document.getElementById(`${id}-container`)
        dialContainer.setAttribute('style', `${dial.boundingBoxCSS};transform: scale(${dial.scale})`)
        console.log('dial:'+dialContainer.getAttribute('style'))
    })
</script>

<div class='dialContainer'
     id='{id}-container'
     on:contextmenu|preventDefault={handleMouseDownPrecision}
     on:mousedown|preventDefault={handleMouseDownJump}
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); dial.changing=true}}'
     on:mouseleave='{()=>{dial.changing=(selected !== null)}}'
>
    <svg>
        <defs id='{id}-gradients'>
            <radialGradient cx=50%
                            cy=50%
                            fx=100%
                            gradientTransform=rotate({270/12})
                            id='{id}-grad'
                            r={remap(dial.normValue,0,1,2,0.75)}
            >
                <stop offset="5%" stop-color="darkblue"/>
                    <!-- todo: abstract out the colour assign -->
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan ].at(dial.index%4)}/>
                />
                <stop offset="99%" stop-color="aquamarine"/>
            </radialGradient>
        </defs>

        <g id='{id}-radial' stroke-width=8>
            <circle cx=50%
                    cy=50% fill=#112211 id='{id}-circle'
                    r=2.5rem stroke="url('#{id}-grad')"/>

            {#each dialPointer as {x, y}, i}
                {@const width = 10}
                {#if (i < dialPointer.length - 2)}
                    <polyline id='{id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              fill="none"
                              stroke-width={width - (i/2)}
                              stroke='rgba(250,250,250,0.5)'/>
                {/if}
                {#if (i === dialPointer.length - 1) && dial.changing}
                    <circle id='{id}-LED'
                            cx=10% cy=16.1% r=2
                            fill=aqua
                            in:fade out:fade/>
                {/if}
            {/each}
            <text class={ dial.precis ? 'readout dial precis' : 'readout dial' }
                  id='{id}-readout'
                  style={dial.changing ? 'fill: aqua;' : ''}>
                    {dial.mappedValue.toPrecision(dial.precis ? 5 : 3)}{dial.precis ? '⋯' : '▹'}
            </text>
        </g>
    </svg>
</div>

<style>
    svg {
        width: 100%;
        height: 100%;
        overflow: visible
    }

    .dialContainer {
        position: absolute;
        border-radius: 25px;
        background: grey;
    }

    .readout {
        font-family: 'Roboto', sans-serif;
        font-size: small;
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
        font-size: large;
        fill: aqua;
        transform: translate(1rem, -0.5rem);
    }
</style>
