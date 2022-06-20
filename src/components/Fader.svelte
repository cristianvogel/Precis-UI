<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, remap, toNumber} from '../lib/utils.ts';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import type {BoundingClientRec, Fader, ControlRect, FaderTaper, FaderTag} from "../types/precisUI";
    import {DefaultRectFader, C} from "../types/precisUI";

    let
        clientRect,
        selected = null;

    export let
        x = DefaultRectFader.X,
        y = DefaultRectFader.Y,
        width = DefaultRectFader.WIDTH,
        height = DefaultRectFader.HEIGHT,
        w = DefaultRectFader.WIDTH,
        h = DefaultRectFader.HEIGHT,
        rx = DefaultRectFader.RX,
        rect:ControlRect = { x, y , width: (width | w) , height: (height | h) },
        value:number = 0,
        id:FaderTag = 'fader.0',
        taper:FaderTaper  = { min: 0, max: 10, fineStep: 0.1, curve:'LINEAR'};

    //todo: improve type assertion
        rx = toNumber(rx)

    const fader: Fader = {
        currentValue: value,
        id,
        geometry: rect,
        rx: rx,
        x: toNumber(x) - rx,
        y: toNumber(y) - rx,
        width: toNumber(width) + rx,
        height: toNumber(height),
        label: 'hold shift for fine tuning',
        precis: false,
        changing: false,
        taper,
        background: C.clear,
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
        const {currentValue, taper, h} = fader
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

    function handleMouseUp() {
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
        // TODO: turn into a setRectFromParent method
        const faderContainer = document.getElementById(`${id}-box`)
        faderContainer.setAttribute('style', fader.clientRect)
        // console.log('fader:'+faderContainer.getAttribute('style'))
    })

</script>

<div class='faderContainer'
     id='{id}-box'
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); fader.changing=true}}'
     on:mouseleave='{()=>{fader.changing=(selected !== null)}}'
     style={fader.clientRect}
>

    <svg >
        <defs id='{id}-textures'>
            <linearGradient id='{id}-grad'
                            x1=0
                            x2=0
                            y1=0
                            y2={remap(fader.normValue, 0, 1, 3, 0)}>
                <stop offset="0" stop-color={C.black}/>
                <stop offset="80%"
                      stop-color={[ C.red, C.sky, C.pink, C.aquaDark ].at(fader.index%4)}/>
            </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="0.4" stdDeviation="0.2"/>
            </filter>
        </defs>

        <g fill="url('#{id}-grad')" stroke={C.whiteBis} stroke-width="0.0625rem">
            <rect height={fader.h + fader.rx}
                  id='#{id}-track'
                  on:contextmenu|preventDefault={handleMouseDownPrecision}
                  on:mousedown|preventDefault={(ev)=>{fader.currentValue= fader.h - ev.offsetY}}
                  rx=4px
                  width={fader.w}
                  x=0rem
            />
            <g id='{id}-handle+readout'
               on:contextmenu|preventDefault={handleMouseDownPrecision}
               on:mousedown|preventDefault={handleMouseDownJump}
               stroke={C.offWhite}
               transform="translate({-fader.rx},{fader.h - fader.currentValue})">
                <rect fill={C.whiteBis}
                      height={fader.rx * 3.14}
                      id='{id}-handle'
                      stroke=none
                      style="filter:url(#shadow);" width={Math.exp(fader.rx)}
                />

                <g id='{id}-readout' class='readoutBox rotated' style='opacity:{fader.changing ? 1 : 0.7}'>
                    <rect class={fader.precis ? 'readoutBox zoom' : 'readoutBox'}
                          height=1.25rem
                          id='{id}-readoutbox'
                          rx=3px
                          width=2.75rem
                          x=-0.5rem
                          y=-0.5rem />
                    <text class='readout'
                          id='{id}-readouttext'
                          style={fader.precis ? 'font-size: large; transform: translate(0.75rem, -1rem)' : '' }>
                        {fader.normValue.toPrecision(fader.precis ? 5 : 3)}{fader.precis ? '⋯' : '▹'}</text>

                </g>
            </g>
        </g>
    </svg>
</div>
{#if fader.changing }
    <div id='{id}-label'
         class='faderContainer'
         style={fader.clientRect + 'z-index: -1000'}>
        <svg in:fade out:fade>
            <g id='{id}-ledTexture'
               stroke="green" fill=none stroke-width="1px"
               transform="translate({fader.w/2})">
                <circle id='{id}-active' cy=-10 cx=-0.5 r=2 fill='aqua'/>
                <text id='{id}-labeltext'
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
        width: 100px;
        height: 100px;
        top: 25%;
        left: 55%;
        transform: scale(1.5);
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
        /*transform: translate(-3rem, 0.5rem);*/
        transform: translate(-3rem, -0.25rem);
        stroke-width: 0;
        fill: aqua;
        cursor: grab;
    }

    .readout.rotated {
        transform: rotate(90deg)
    }

    .readoutBox {
        /*transform: translate(-2.75rem, 0.2rem);*/
        transform: translate(-3rem, -0.55rem) scaleY(0.5);
        stroke-width: 0;
        fill: darkcyan;
        pointer-events: none;
    }

    .readoutBox.rotated {
        transform: rotate(90deg)
    }

    .readoutBox.zoom {
        transform: translate(1.5rem, -1.5rem) scaleX(225%) scaleY(110%);
    }
</style>
