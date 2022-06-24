<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {clamp, radialPoints, remap, toNumber} from '../lib/utils.ts';
    import {afterUpdate, createEventDispatcher, onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import type {BoundingRectCSS, Dial, DialTag, Rect, Taper, Tint} from "../types/precisUI";
    import {C, Default, DefaultTaper, WidgetType} from "../types/precisUI";
    import {addListenersFor, removeListenersFor} from "../lib/Events";
    import {radialTickMarkAt} from "../lib/utils";

    let
        selected:(HTMLElement | null) = null,
        clientRect:(DOMRect | null) = null;

    export let
        min = DefaultTaper.MIN,
        max = DefaultTaper.MAX,
        fineStep = DefaultTaper.FINE,
        x = Default.X,
        y = Default.Y,
        width = Default.DIAL_SQUARE,
        background = Default.DIAL_BACKGROUND,
        scale:number = Default.DIAL_SCALE_FACTOR,
        rx:number = Default.RX,
        value:number = 0,
        id:DialTag = 'dial.0',
        label:string = '',
        touchedID:DialTag = ''


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
    const dispatch = createEventDispatcher()

    const dial: Dial = {
        draw: ():void => {
            containerTransform()
        },
        handleMouseDown: (event: MouseEvent) => {
            const mode = (event.type)
            dial.precis = (mode === 'contextmenu')
            selected = event.target as HTMLElement
            selected.focus()
            addListenersFor(dial)
        },
        handleMouseMove: (event:MouseEvent) => {
                clientRect = (selected as Element).getBoundingClientRect()
                const dy = event.movementY
                if (dy === 0) {return}
                const {currentValue, height, normValue} = dial
                if (dial.precis) {
                    dial.currentValue =
                        clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
                } else {
                    dial.currentValue =
                        clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
                }
            value = dial.mappedValue
            touchedID = dial.id
        },
        handleMouseUp: () => {
            selected = null
            dial.precis = false
            dial.changing = false
            removeListenersFor(dial)
        },
        handleModifier(ev: KeyboardEvent) {
            dial.precis = (ev.shiftKey && ev.type === 'keydown')
        },
        currentValue: value,
        id,
        rect,
        rx,
        taper,
        scale,
        background,
        label,
        get x():number { return this.rect.x },
        get y():number {return this.rect.y},
        set x( number:number ) { this.rect.x = number },
        set y( number:number ) { this.rect.y = number },
        get width():number {return this.rect.width},
        get height():number {return this.rect.height},
        set width(w:number) { this.rect.width = toNumber(w) + rx },
        set height(h:number) { this.rect.height = toNumber(h) },
        precis: false,
        changing: false,
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

    $: dialPointer = radialPoints(dial.radialTrack, 50, 50, 10, 55, 20)
    $: output(dial.mappedValue, dial.id)

    function output(value, id)  {
       // console.log( `Output value send: ${value}`)
        dispatch('output', {
            value,
            id,
        })
    }

    const containerTransform = function () {
        const newStyle =`${dial.boundingBoxCSS};
                          transform: scale(${scale});
                          background: ${background};`
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
        output(dial.mappedValue, dial.id);
    })

</script>

<div class='dialContainer'
     id='{id}-container'
     on:contextmenu|preventDefault={dial.handleMouseDown}
     on:mousedown|preventDefault={dial.handleMouseDown}
     on:mouseenter|preventDefault='{(e)=>{e.target.focus(); dial.changing=true}}'
     on:mouseleave='{()=>{dial.changing=(selected !== null)}}'
     style={containerTransform()}
>

    <svg transform=scale(0.9)>
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

        <g id='{id}-dialBody' stroke-width=8>
            <circle id='{id}-circleFigure'
                    cx=50%
                    cy=50% fill=#112211
                    r={(dial.rx * 0.9) +'rem'} stroke="url('#{id}-grad')"
            />
            <g id='{id}-ticks'>
                {#each Array(Default.DIAL_TICKMARKS_COUNT) as tick, i}
                    {@const tickMarks = radialTickMarkAt(i)}
                    <line x1={tickMarks.x1}
                          x2={tickMarks.x2}
                          y1={tickMarks.y1}
                          y2={tickMarks.y2}
                          stroke-width='2px'
                          stroke = {i<(dial.normValue*10) ? `aquamarine` : 'grey'}
                    />
                {/each}
            </g>
            {#each dialPointer as {x, y}, i}
                {@const width = dial.precis ? 10 : 5}
                {#if (i < dialPointer.length - 4)}
                    <polyline id='{id}-pointer'
                              points={`${x},${y}, 50,50 `}
                              stroke-width={width - (i/2)}
                              stroke='rgba(250,250,250,0.5)'/>
                {/if}
                {#if (i === dialPointer.length - 1) && dial.changing}
                    <circle id='{id}-LED'
                            cx=90% cy=90% r=2
                            fill=aqua
                            in:fade out:fade/>
                {/if}
            {/each}
            <text id='{id}-readout'
                  class={ dial.precis ? 'readout dial precis' : 'readout dial' }
                  style={dial.changing ? 'fill: aqua;' : ''}>
                {dial.mappedValue.toPrecision(dial.precis ? 6 : 3)}{dial.precis ? '⋯' : ' ▹'}
            </text>
            <g id='{id}-label'>
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
