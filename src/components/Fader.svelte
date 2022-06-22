<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, remap, toNumber} from '../lib/utils.ts';
    import {afterUpdate, createEventDispatcher, onMount} from 'svelte';
    import { fade } from 'svelte/transition';
    import type {BoundingRectCSS, Fader, Rect, FaderTag, Taper} from "../types/precisUI";
    import {C, DefaultTaper, Default, WidgetType } from "../types/precisUI";
    import {addListenersFor, removeListenersFor} from "../lib/Events";

    let
        selected:(HTMLElement | null) = null,
        clientRect:(DOMRect | null) = null;


    export let
        min = DefaultTaper.MIN,
        max = DefaultTaper.MAX,
        fineStep = DefaultTaper.FINE,
        x = Default.X,
        y = Default.Y,
        width = Default.FADER_WIDTH,
        height = Default.FADER_HEIGHT,
        scale = Default.FADER_SCALE_FACTOR,
        rx = Default.RX,
        value:number = 0,
        id:FaderTag = 'fader.0',
        touchedID:FaderTag = ''


    //todo: improve type assert checks or work with DOM units like %, px etc
        rx = rx as number
        const taper: Taper = {
            min: toNumber(min),
            max: toNumber(max),
            fineStep: toNumber(fineStep),
            curve: 'LINEAR'
        };

    const rect:Rect = {
        x: toNumber(x),
        y: toNumber(y),
        width: toNumber(width),
        height: toNumber(height)
    }

    const dispatch = createEventDispatcher()

    const fader: Fader = {
        draw: ():void => {
            containerTransform()
        },
        handleMouseDown: (event: MouseEvent) => {
            const mode = (event.type)
            fader.precis = (mode === 'contextmenu')
            selected = event.target as HTMLElement
            selected.focus()
            addListenersFor(fader, WidgetType.FADER)
        },
        handleMouseMove: (event:MouseEvent) => {
            clientRect = (selected as Element).getBoundingClientRect()
            const dy = event.movementY
            if (dy === 0) {return}
            const {currentValue, height, normValue} = fader
            if (fader.precis) {
                fader.currentValue =
                    clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
            } else {
                fader.currentValue =
                    clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
            }
            value = fader.mappedValue
            touchedID = fader.id
        },
        handleMouseUp: () => {
            selected = null
            fader.precis = false
            fader.changing = false
            removeListenersFor(fader, WidgetType.FADER)
        },
        handleModifier(ev: KeyboardEvent) {
            fader.precis = (ev.shiftKey && ev.type === 'keydown' )
        },

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
        get normValue() {
            return this.currentValue / this.rect.height
        },
        get mappedValue():number {
            return remap( this.normValue, 0 ,1, this.taper.min, this.taper.max)
        }
    }

    $: output(fader.mappedValue, fader.id)

    function output(value, id)  {
        // console.log( `Output value send: ${value}`)
        dispatch('output', {
            value,
            id,
        })
    }

    const containerTransform = function () {
        const newStyle =`${fader.boundingBoxCSS};
                         transform: scale(${scale})`
        return newStyle
    };

    const resize = function () {
        const el = document.getElementById(`${id}-container`)
        const newStyle = `transform: scale(${scale});`
        el.setAttribute('style', el.getAttribute('style') + newStyle)
    }

    afterUpdate(() => {
        resize()
    });

    onMount( () => {
        output(fader.mappedValue, fader.id)
    })

</script>

<div class='faderContainer'
     id='{id}-container'
     on:contextmenu|preventDefault={fader.handleMouseDown}
     on:mousedown|preventDefault={fader.handleMouseDown}
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); fader.changing=true}}'
     on:mouseleave='{()=>{fader.changing=(selected !== null)}}'
     style={containerTransform()}
>

    <svg >
        <defs id='{id}-gradients'>
            <linearGradient id='{id}-grad'
                            x1=0
                            x2=0
                            y1=0
                            y2={remap(fader.normValue, 0, 1, 3, 0)}>
                <stop offset="0" stop-color={C.black}/>
                <!-- todo: abstract out the colour assign -->
                <stop offset="80%"
                      stop-color={[ C.red, C.sky, C.pink, C.aquaDark ].at(fader.index%4)}/>
               </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="0.4" stdDeviation="0.2"/>
            </filter>
        </defs>

        <g fill="url('#{id}-grad')" stroke={C.whiteBis} stroke-width="0.0625rem">
            <rect id='#{id}-track'
                  width={fader.width}
                  height={fader.height + fader.rx}
                  rx=4px
                  x=0rem
                  on:dblclick|preventDefault={(ev)=>{fader.currentValue= fader.height - ev.offsetY}}
            />
            <g id='{id}-handle+readout'
               on:contextmenu|preventDefault={fader.handleMouseDown}
               stroke={C.offWhite}
               transform="translate(0,{fader.height - fader.currentValue}) scale(1.5)">
                <rect fill={C.whiteBis}
                      height={Math.pow(fader.rx, fader.precis ? 1 : 2)}
                      width=66%
                      id='{id}-handle'
                      stroke=none
                      style="filter:url(#shadow);"
                />

                <g id='{id}-readout'
                   class='readoutBox rotated'
                   style='opacity:{fader.changing ? 1 : 0.7}'>
                    <rect id='{id}-readout.Box'
                          class={fader.precis ? 'readoutBox zoom' : 'readoutBox'}
                          height=1.25rem
                          rx=3px
                          width=2.75rem
                          x=-0.5rem
                          y=-0.5rem />
                    <text id='{id}-readout.Text'
                          class={fader.precis ? 'readout zoom' : 'readout'}>
                          {fader.mappedValue.toPrecision(fader.precis ? 5 : 3)}
                          {fader.precis ? '⋯' : ' ▹'}
                    </text>
                </g>
            </g>
        </g>
    </svg>

{#if fader.changing }
    <div id='{id}-label'
         class='faderContainer'
         style={'z-index: -1000'}>
        <svg in:fade out:fade>
            <g id='{id}-LED'
               stroke="green" fill=none stroke-width="1px"
               transform="translate({fader.width/2})">
                <circle id='{id}-active' cy=-20 cx=-0.5 r=2 fill='aqua'/>
                <text id='{id}-label.Text'
                      class='label rotated'
                      lengthAdjust='spacingAndGlyphs'
                      textLength={fader.height * 0.5} >
                    {fader.label}
                </text>
            </g>
        </svg>
    </div>
{/if}
</div>

<style>
    svg {
        width: 100%;
        height: 100%;
        overflow: visible;
        transform-origin: center;
    }

    .faderContainer {
        position: absolute;
        background: none;
        top: 2.5%;
        left: 5%;
    }

    .label {
        font-family: 'Roboto', sans-serif;
        font-size: small;
        stroke: none;
        fill: grey;
        pointer-events: none;
    }

    .label.rotated {
        /*transform: rotate(90deg) translate(0.25rem, -0.75rem);*/
        transform: rotate(90deg) translate(0.25rem, -1rem);
    }

    .readout {
        font-family: 'Roboto', sans-serif;
        font-size: x-small;
        transform: translate(-2.5rem, -0.3rem);
        stroke-width: 0;
        fill: aqua;
        cursor: grab;
    }

    .readout.rotated {
        transform: rotate(90deg)
    }

    .readoutBox {
        transform: translate(-2.5rem, -0.6rem) scaleY(0.5);
        stroke-width: 0;
        fill: rgba(120,120,120,0.5);
        pointer-events: none;
    }

    .readout.zoom {
        font-size: large;
        transform: translate(-2.5rem, -0.15rem)
    }

    .readoutBox.rotated {
        transform: rotate(90deg)
    }

    .readoutBox.zoom {
        transform: translate(-1.5rem, -0.66rem) scaleX(225%) scaleY(110%);
    }
</style>
