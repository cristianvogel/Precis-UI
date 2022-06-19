<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, radialPoints, remap} from '../lib/utils.ts';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import type {BoundingClientRec, Fader, FaderGeometry, FaderTaper, FaderTag} from "../types/precisUI";
    import {DefaultRect, PALETTE} from "../types/precisUI";


    let clientRect;
    let selected = null;
    export let
        x = DefaultRect.X,
        y = DefaultRect.Y,
        width = DefaultRect.WIDTH,
        height = DefaultRect.HEIGHT,
        w = DefaultRect.WIDTH,
        h = DefaultRect.HEIGHT,
        rx = DefaultRect.RX

    export let geometry:FaderGeometry = { x, y , width: (width | w) , height: (height | h) }
    export let value:number = 0
    export let id:FaderTag = 'fader.1'
    export let taper:FaderTaper  = { min: 0, max: 10, fineStep: 0.1, curve:'LINEAR'}

    const fader: Fader = {
        currentValue: value,
        id,
        geometry,
        rx,
        x: x - rx,
        y: y - rx,
        width: width + rx,
        height: height + rx,
        label: 'hold shift for fine tuning',
        precis: false,
        changing: false,
        taper,
        bg: PALETTE.clear,
        set rect(faderGeometry: FaderGeometry) {
            this.geometry = faderGeometry
            this.x = faderGeometry.x
            this.y = faderGeometry.y
            this.width = faderGeometry.width
            this.height = faderGeometry.height
            return this.geometry
        },
        get h(): number {
            return this.geometry.height | this.height
        },
        get w(): number {
            return this.geometry.width | this.width
        },
        get clientRect() {
            return <BoundingClientRec>
                `top:${this.y}px;
                left:${this.x}px;
                width:${this.width}px;
                height:${this.height}px;`
        },
        get normValue() {
            return this.currentValue / this.height
        }
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
        const {currentValue, taper, h, y} = fader
        if (dy === 0) return
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                fader.currentValue = clamp( currentValue+((dy*dy)*(Math.sign(dy)/-2)) * taper.fineStep, [0, h] )
                break;
            case 'fader' :
                fader.currentValue = clamp( currentValue+ -dy * taper.fineStep, [0, h] )
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
        const {currentValue, h, normValue } = fader
        switch (selected.id.split('.')[0]) {
            case 'dial' :
                fader.currentValue = clamp( currentValue + (-dy* (remap(normValue,0,1,3,0.25))), [0, h] )
                break;
            case 'fader' :
                fader.currentValue = clamp( currentValue + -dy, [0, h] )
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

    onMount(() => {
// 		 this was a temporary pseudo constructor
// 		 allows the widget to be scaled and positioned by CSS
// 		 which is actually quite cool?
  //       TODO: turn into a setRectFromParent method
  //       const faderRect = document.getElementById('fader.box')
  //       const {top, left, width, height} = faderRect.getBoundingClientRect()
  //       fader.rect = {x: left, y: top, width: width, height: height}
    })

</script>

<div class='faderContainer'
     id='fader.box'
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); fader.changing=true}}'
     on:mouseleave='{()=>{fader.changing=(selected !== null)}}'
     style={fader.clientRect}
>

    <svg>
        <defs id='fader.textures'>
            <linearGradient id="fader.grad"
                            x1=0
                            x2=0
                            y1=0
                            y2={remap(fader.normValue, 0, 1, 3, 0)}>
                <stop offset="0" stop-color={PALETTE.black}/>
                <stop offset="80%" stop-color={PALETTE.sky}/>
            </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="0.4" stdDeviation="0.2"/>
            </filter>
        </defs>

        <g fill="url('#fader.grad')" stroke={PALETTE.whiteBis} stroke-width="0.0625rem">
            <rect height={fader.h + fader.rx}
                  id='fader.track'
                  on:contextmenu|preventDefault={handleMouseDownPrecision}
                  on:mousedown|preventDefault={(ev)=>{fader.currentValue= fader.h - ev.offsetY}}
                  rx=4px
                  width={fader.w}
                  x=0rem
            />
            <g id='fader.handle+readout'
               on:contextmenu|preventDefault={handleMouseDownPrecision}
               on:mousedown|preventDefault={handleMouseDownJump}
               stroke={PALETTE.offWhite}
               transform="translate({-fader.rx},{fader.h - fader.currentValue})">
                <rect fill={PALETTE.whiteBis}
                      height={fader.rx * 3.14}
                      id='fader.handle'
                      stroke=none
                      style="filter:url(#shadow);" width={Math.exp(fader.rx)}
                />

                <g id='fader.readout' style='opacity:{fader.changing ? 1 : 0.7}'>
                    <rect class={fader.precis ? 'readoutBox zoom' : 'readoutBox'}
                          height=1.25rem
                          id='fader.readoutbox'
                          rx=3px
                          width=2.75rem
                          x=-0.5rem
                          y=-0.5rem />
                    <text class='readout'
                          id='fader.readouttext'
                          style={fader.precis ? 'font-size: large; transform: translate(0.75rem, -1rem)' : '' }>
                        {fader.normValue.toPrecision(fader.precis ? 5 : 3)}{fader.precis ? '⋯' : '▹'}</text>

                </g>
            </g>
        </g>
    </svg>
</div>
{#if fader.changing }
    <div id='fader.label'
         class='faderContainer'
         style={fader.clientRect + 'z-index: -1000'}>
        <svg in:fade out:fade>
            <g id='fader.ledTexture'
               stroke="green" fill=none stroke-width="1px"
               transform="translate({fader.w/2})">
                <circle id='fader.active' cy=-10 cx=-0.5 r=2 fill='aqua'/>
                <text id='fader.labeltext'
                      class='label rotated'
                      lengthAdjust='spacingAndGlyphs'
                      textLength={fader.h * 0.5}>{fader.label}
                </text>
            </g>
        </svg>
    </div>
{/if}

<style>
    svg {
        width: 100%;
        height: 100%;
        overflow: visible
    }

    .faderContainer {
        position: absolute;
        background: grey;
        width: 100px;
        height: 100px;
        top: 25%;
        left: 55%;
        transform: scale(1.25);
    }

    .label {
        font-family: 'Helvetica Neue', sans-serif;
        font-size: x-small;
        stroke: none;
        fill: grey;
        pointer-events: none;
    }

    .label.rotated {
        transform: rotate(90deg) translate(0.25rem, -0.75rem);
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

    .readoutBox {
        transform: translate(-2.75rem, 0.2rem);
        stroke-width: 0;
        z-index: -100;
        fill: ghostwhite;
        pointer-events: none;
    }

    .readoutBox.zoom {
        transform: translate(1.5rem, -1.5rem) scaleX(225%) scaleY(110%);
    }
</style>
