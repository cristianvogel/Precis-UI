<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper} from "../types/precisUI";
    import type {FaderTag} from "../lib/PrecisController";
    import {Fader, Palette as C, Rect, Taper} from "../lib/PrecisController";
    import {remap, toNumber} from "../lib/utils";
    import { onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {WidgetStore} from './stores.js'
    import {addListeners} from "../lib/Listeners";

    let registrySize

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
        id:FaderTag = 'fader.0',
        label:string = '',
        value:number = 0

    const rect:Rect = {
        x: toNumber(x),
        y: toNumber(y),
        width: toNumber(width),
        height: toNumber(height)
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
        rect,
        rx,
        scale,
        taper,
        tickMarks: true,
    }

    // Construct a new instance of a vertical fader
    let fader:Fader = new Fader(settings)

    // these initialise functions are working fine like this for now
    // 😖 I have tried to refactor, but seems to get complicated
    // with the reactivity.
    const initialise = function () {

        function addSelfToRegistry() {
            $WidgetStore.set(fader.id, fader)
        }

        // this is the transform which renders the container DIV element
        const containerTransform = function () {
            return `${fader.generateRectCSS()};
                  transform: scale(${fader.scale});
                  background: ${fader.background};`
        }

        function componentMouseDown(event: MouseEvent): void {
            if (!event.target) return
            console.info('Element ◻︎ ' + event.target + ' ⇢ ' + fader.id)
            const mode = (event.type)
            fader.stateFlags = {
                changing: true,
                precis: (mode === 'contextmenu'),
                focussed: true
            }
            fader.selected = event.target as HTMLElement
            addListeners(fader.selected, fader)
        }

        function componentMouseLeave() {
            if (fader.changing) return
            fader.focussed = false
        }

        function componentMouseEnter(event: MouseEvent) {
            fader.selected = event.target as HTMLElement
            fader.selected.focus()
            fader.focussed = true
        }
        return {
            addSelfToRegistry,
            containerTransform,
            componentMouseDown,
            componentMouseLeave,
            componentMouseEnter
        };
    };

    function reactiveAssignment() {
        fader=fader
    }

    const { addSelfToRegistry,
        containerTransform,
        componentMouseDown,
        componentMouseLeave,
        componentMouseEnter } = initialise();

    onMount( () => {
        addSelfToRegistry()
        $: registrySize = $WidgetStore.size
        console.log( 'Widget Store size ▷ ' + $WidgetStore.size)
        fader.dispatchOutput( fader.id, fader.getMappedValue(),);
    })

</script>

<div class='faderContainer'
     id='{fader.id}-container'
     on:contextmenu|preventDefault={componentMouseDown}
     on:mousedown|preventDefault={componentMouseDown}
     on:mouseenter|preventDefault={componentMouseEnter }
     on:mouseleave={componentMouseLeave}
     on:mousemove={reactiveAssignment}
     style={containerTransform()}
>

    <svg >
        <defs id='{id}-gradients'>
            <linearGradient id='{id}-grad'
                            x1=0
                            x2=0
                            y1=0
                            y2={remap(fader.getNormValue(), 0, 1, 3, 0)}>
                <stop offset="0" stop-color={C.black}/>
                <!-- todo: abstract out the colour assign -->
                <stop offset="80%"
                      stop-color={[ C.red, C.sky, C.pink, C.aquaDark ].at(registrySize%4)}/>
            </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="0.4" stdDeviation="0.2"/>
            </filter>
        </defs>
<!-- todo: double click on track is broken -->
        <g fill="url('#{id}-grad')" stroke={C.whiteBis} stroke-width="0.0625rem">
            <rect id='#{id}-track'
                  width={fader.width}
                  height={fader.height + fader.rx}
                  rx=4px
                  x=0rem
                  on:dblclick|preventDefault={(ev)=>{fader.currentValue= fader.height - ev.offsetY}}
            />
            <g id='{id}-handle+readout'
               on:contextmenu|preventDefault={componentMouseDown}
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
                        {fader.getMappedValue().toPrecision(fader.precis ? 5 : 3)}
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
