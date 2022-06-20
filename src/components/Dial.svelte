<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, radialPoints, remap, toNumber } from '../lib/utils.ts';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import type {BoundingClientRec, Dial, ControlRect, DialTaper, DialTag} from "../types/precisUI";
    import {DefaultRectDial, C} from "../types/precisUI";

    export let
        x = DefaultRectDial.X,
        y = DefaultRectDial.Y,
        width = DefaultRectDial.WIDTH,
        height = DefaultRectDial.HEIGHT,
        w = DefaultRectDial.WIDTH,
        h = DefaultRectDial.HEIGHT,
        rx = DefaultRectDial.RX

    export let rect:ControlRect = { x, y , width: (width | w) , height: (height | h) }
    export let value:number = 0
    export let id:DialTag = 'dial.0'
    export let taper:DialTaper  = { min: 0, max: 10, fineStep: 0.1, curve:'LINEAR'}

    let clientRect;
    let selected = null;
    rx = toNumber(rx) //todo: improve type assertion

    const dial:Dial = {
        currentValue: value,
        id,
        geometry: rect,
        rx,
        x: toNumber(x) - rx,
        y: toNumber(y) - rx,
        width: toNumber(width) + rx,
        height: toNumber(height),
        label: 'hold shift for fine tuning',
        precis: false,
        changing: false,
        taper,
        background: C.clear,
        get radialTrack() { return (this.normValue * 270) + 230}, //todo: make configurable
        set rect(rect: ControlRect) {
            this.geometry = rect
            this.x = rect.x
            this.y = rect.y
            this.width = rect.width
            this.height = rect.height
            return this.geometry
        },
        get index(): number {
            return (Number.parseInt(Array.from(this.id).at(-1))) //todo: what if id >10 ?
        },
        get h(): number {
            return this.geometry.height | this.height
        },
        get w(): number {
            return this.geometry.width | this.width
        },
        get clientRect() {
            return <BoundingClientRec>
                `top:${this.y}px;left:${this.x}px;width:${this.width}px;height:${this.height}px;`
        },
        get normValue() {
            return this.currentValue / this.height
        }
    }

    function handleModifier (ev) {
        const shift = ev.shiftKey && ev.type==='keydown';
        dial.precis= shift
        if (shift){
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
        const {currentValue, taper, h} = dial
        if (dy === 0) return
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                dial.currentValue = clamp( currentValue+((dy*dy)*(Math.sign(dy)/-2)) * taper.fineStep, [0, h] )
                break;
            case 'fader' :
                dial.currentValue = clamp( currentValue+ -dy * taper.fineStep, [0, h] )
                break;
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
        const {currentValue, h, normValue } = dial
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                dial.currentValue = clamp( currentValue + (-dy* (remap(normValue,0,1,3,0.25))), [0, h] )
                break;
            case 'fader' :
                dial.currentValue = clamp( currentValue + -dy, [0, h] )
                break;
        }
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
    $: dialPointer = radialPoints( dial.radialTrack, 50,50,10,55,10)

    onMount(() => {
        // TODO: turn into a setRectFromParent method
        const dialContainer = document.getElementById(`${id}-box`)
        dialContainer.setAttribute('style', dial.clientRect)
        // console.log('dial:'+dialContainer.getAttribute('style'))
    })
</script>


<div class='dialContainer'
     id='{id}-box'
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); dial.changing=true}}'
     on:mouseleave='{()=>{dial.changing=(selected !== null)}}'
     on:mousedown|preventDefault={handleMouseDownJump}
     on:contextmenu|preventDefault={handleMouseDownPrecision}
>
    <svg>
        <defs id='{id}-textures'>
            <radialGradient id='{id}-grad'
                            cx=50%
                            cy=50%
                            r={remap(dial.normValue,0,1,2,0.75)}
                            fx=100%
                            gradientTransform=rotate({270/12})
            >
                <stop offset="5%"  stop-color="darkblue" />
                <stop offset="80%" stop-color={[ C.aquaLight, C.pink, C.aquaDark, C.tan ].at(dial.index%4)}/>
                />
                <stop offset="99%"  stop-color="aquamarine" />
            </radialGradient>
        </defs>

        <g id='{id}-radial' stroke-width=8 >
            <circle id='{id}-circle'
                    cx=50% cy=50% r=2.5rem
                    fill=#112211 stroke="url('#{id}-grad')" />

            {#each dialPointer as {x,y}, i}
                {@const width = 10}
                {#if (i < dialPointer.length-2)}
                    <polyline id='{id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              fill="none"
                              stroke-width={width - (i/2)}
                              stroke=rgba(250,250,250,0.5) />
                {/if}
                {#if (i === dialPointer.length-1) && dial.changing}
                    <circle id='{id}-led' cx=10% cy=16.1% r=2 fill=aqua in:fade out:fade/>
                {/if}
            {/each}
            <text id = '{id}-readout'
                  class='readout dial'
                  style="{
										 dial.precis ?
										  'font-size: large; fill: aqua; transform: translate(1rem, -0.5rem);'
										  : `${dial.changing ? 'fill: aqua; ':''}`
										}">
                {dial.normValue.toPrecision(dial.precis ? 5 : 3)}{dial.precis ? '⋯' : '▹'}
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
        transform: scale(0.75);
        border-radius: 25px;
        background: grey;
    }

    .readout {
        font-family: 'Roboto', sans-serif;
        font-size: x-small;
        transform: translate(-3rem, 0.5rem);
        stroke-width: 0;
        fill: grey;
        cursor: grab;
    }

    .readout.dial {
        transform: translate(0rem, -0.5rem);
        pointer-events: none;
    }
</style>
