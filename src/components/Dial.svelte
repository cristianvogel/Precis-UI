<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, radialPoints, remap} from '../lib/utils.ts';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';


    let clientRect;
    let selected = null;
    const radial = ()=>(fader.normValue * 270) + 230

    let fader = {
        x: 200,
        y: 50,
        w: 8,
        h: 200,
        rx: 3,
        value: 0,
        label: 'hold shift for fine tuning',
        precis: false,
        changing: false,
        taper: { min: 0, max: 10, fineStep: 0.1, curve:'LINEAR'},
        bg: 'transparent',
        set rect( options ) {
            const {x,y,width,height} = options
            this.x=x; this.y=y; this.w=width; this.h=height;
        },
        get radialPoints() { return (this.normValue * 270) + 230},
        get boundingBox() {
            return `top:${this.y}px;
			left:${this.x}px;
			width:${this.w + this.rx}px;
			height:${this.h + this.rx}px;
			background: ${this.bg};`
        },
        get normValue() {return (this.value /  this.h)}
    }

    function handleModifier (ev) {
        const shift = ev.shiftKey && ev.type==='keydown';
        fader.precis= shift
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
        fader.precis = true
        removeEventListener('mousemove', handleMouseMoveJump)
        addEventListener('mousemove', handleMouseMovePrecision)
        addEventListener('mouseup', handleMouseUp)
    }

    function handleMouseMovePrecision(event) {
        clientRect = selected.getBoundingClientRect()
        const dy = event.movementY
        const {value, taper, h, y} = fader
        if (dy === 0) return
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                fader.value = clamp( value+((dy*dy)*(Math.sign(dy)/-2)) * taper.fineStep, [0, h] )
                break;
            case 'fader' :
                fader.value = clamp( value+ -dy * taper.fineStep, [0, h] )
                break;
        }
    }

    function handleMouseDownJump(event) {
        selected = event.target
        if (fader.precis) return
        selected.focus()
        addEventListener('mousemove', handleMouseMoveJump)
        addEventListener('mouseup', handleMouseUp)
        addEventListener('keydown', handleModifier)
        addEventListener('keyup', handleModifier)
    }

    function handleMouseMoveJump(event) {
        clientRect = selected.getBoundingClientRect()
        const dy = event.movementY
        const {value, taper, h, y, normValue } = fader
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                fader.value = clamp( value + (-dy* (remap(normValue,0,1,3,0.25))), [0, h] )
                break;
            case 'fader' :
                fader.value = clamp( value + -dy, [0, h] )
                break;
        }
    }

    function handleMouseUp(event) {
        selected = null
        fader.precis = false
        fader.changing = false
        removeEventListener('mousemove', handleMouseMovePrecision)
        removeEventListener('mousemove', handleMouseMoveJump)
        removeEventListener('mouseup', handleMouseUp)
        removeEventListener('keydown', handleModifier)
        removeEventListener('keyup', handleModifier)
    }

    $: dialPointer = radialPoints( fader.radialPoints, 50,50,10,55,10)

    onMount(() => {
// 		 this was a temporary psuedo constructor
// 		 allows the widget to be scaled and positioned by CSS
// 		 which is actually quite cool?
        const faderRect = document.getElementById('fader.box')
        const {top, left, width, height} = faderRect.getBoundingClientRect()
        fader.rect = {top: top, left: left, width: width, height: height}
    })
</script>


<div class='dialContainer'
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); fader.changing=true}}'
     on:mouseleave='{()=>{fader.changing=(selected !== null)}}'
     on:mousedown|preventDefault={handleMouseDownJump}
     on:contextmenu|preventDefault={handleMouseDownPrecision}
>
    <svg>
        <defs id='dial.textures'>
            <radialGradient id='dial.grad'
                            cx=50%
                            cy=50%
                            r={remap(fader.normValue,0,1,2,0.75)}
                            fx=100%
                            gradientTransform=rotate({270/12})
            >
                <stop offset="5%"  stop-color="darkblue" />
                <stop offset="80%" stop-color="aqua" />
                <stop offset="99%"  stop-color="aquamarine" />
            </radialGradient>
        </defs>

        <g id='dial.radial' stroke-width=8>
            <circle id='dial.circle'
                    cx=50% cy=50% r=2.5rem
                    fill=#112211 stroke="url('#dial.grad')" />

            {#each dialPointer as {x,y}, i}
                {@const width = 10}
                {#if (i < dialPointer.length-2)}
                    <polyline id='dial.pointer'
                              points={`${x},${y} 50,50 `}
                              fill="none"
                              stroke-width={width - (i/2)}
                              stroke=rgba(250,250,250,0.5) />
                {/if}
                {#if (i === dialPointer.length-1) && fader.changing}
                    <circle id='dial.led' cx=10% cy=16.1% r=2 fill=aqua in:fade out:fade/>
                {/if}
            {/each}
            <text id = 'dial.readout'
                  class='readout dial'
                  style="{
										 fader.precis ?
										  'font-size: large; fill: aqua; transform: translate(1rem, -0.5rem);'
										  : `${fader.changing ? 'fill: aqua; ':''}`
										}">
                {fader.normValue.toPrecision(fader.precis ? 5 : 3)}{fader.precis ? 'ï' : '¹'}
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
        width: 100px;
        height: 100px;
        top: 35%;
        left: 15%;
        transform: scale(1);
    }

    .readout {
        font-family: 'Roboto', sans-serif;
        font-size: x-small;
        transform: translate(-3rem, 0.5rem);
        stroke-width: 0;
        fill: grey;
        cursor: grab;
        z-index: -1
    }

    .readout.dial {
        transform: translate(0rem, -0.5rem);
        pointer-events: none;
    }
</style>
