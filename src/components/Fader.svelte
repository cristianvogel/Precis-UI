<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper} from "../types/Precis-UI-Defaults";
    import {BasicController, Fader} from "../lib/PrecisControllers";
    import {remap, toNumber} from "../lib/Utils";
    import { onMount} from "svelte";
    import {fade} from 'svelte/transition';
    import {WidgetStore} from './stores.js'
    import {FaderTag, Palette as C, Rect, Taper} from "../types/Precis-UI-TypeDeclarations";

    export let
        min:number = DefaultTaper.MIN,
        max:number = DefaultTaper.MAX,
        fineStep:number = DefaultTaper.FINE,
        x:number = Default.X,
        y:number = Default.Y,
        width:number = Default.FADER_WIDTH,
        height:number = Default.FADER_HEIGHT,
        scale:number = Default.FADER_SCALE_FACTOR,
        rx:number = Default.RX,
        id:FaderTag = 'fader.0',
        tickMarks:boolean = true, //todo: Fader tickmarks
        label:string = '',
        value:number = 0,
        rect:Rect = {
            x: toNumber(x),
            y: toNumber(y),
            width: toNumber(width),
            height: toNumber(height)
        },
        taper:Taper = {
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
        tickMarks,
    }

    // Construct a new instance of a vertical fader
    let fader:Fader = new Fader(settings)
    BasicController.initialise(fader)
    const refresh = ()=> {fader = fader}

    onMount( () => {
        fader.dispatchOutput( fader.id, fader.getMappedValue());
    })

    let animatedReadout = true;
    let gearedValue;
    let offsetMap;
    let sinMap;

    $:roundedReadout = fader.getRoundedReadout()
    $:registrySize = $WidgetStore.size

</script>

<div class='faderContainer'
     id='{fader.id}-container'
     on:contextmenu|preventDefault={ (e)=>{fader.componentMouseDown(e,fader)} }
     on:mousedown|preventDefault={ (e)=>{fader.componentMouseDown(e, fader)} }
     on:mouseenter|preventDefault={ (e)=>{fader.componentMouseEnter(e, fader)} }
     on:mouseleave={ (e)=>{refresh(); fader.componentMouseLeave(e, fader)} }
     on:mousemove={refresh}
     on:mouseup={()=>(fader.stateFlags={changing: false, focussed: true, precis: false})}
     style={BasicController.containerTransform(fader, scale)}
>

    <!-- animated numerical readout mojo-->
    {#if fader.changing && animatedReadout}
        {@const value = fader.getNormValue()}
        {@const gearedValue = (value * -200) % 20}
        {@const offsetMap = remap(gearedValue, -10, 10, -0.25, 0.25) + 0.5}
        {@const sinMap = Math.sin(Math.PI * offsetMap)}
        <div id='{fader.id}-animatedReadout'
             class="animatedReadout"
             style="transform: translate( {1.1 - roundedReadout.length * 0.25}em, 3em )">
            <svg in:fade out:fade >
                <g stroke-width='1px'
                   opacity={Math.abs(sinMap) + 0.1}
                   transform="translate ( {-fader.width * 0.5} {-100 + (gearedValue * 2)} )
                                scale(1, {Math.abs(sinMap)  + 0.125} )"
                > <text fill={C.aquaLight}>{roundedReadout}</text>
                </g>
            </svg>
        </div>
    {/if}
    <!-- SVG defs -->
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
<!-- fader track -->
        <g fill="url('#{id}-grad')" stroke={C.whiteBis} stroke-width="0.0625rem">
            <rect id='#{id}-track'
                  width={fader.width}
                  height={fader.height + fader.rx}
                  rx=4px
                  x=0rem
                  on:dblclick|preventDefault={(ev)=>{fader.currentValue= fader.height - ev.offsetY}}
            />
<!-- handle and inner readout -->
            <g id='{id}-handle+readout'
               on:contextmenu|preventDefault={(e)=>{fader.componentMouseDown(e, fader)} }
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
                          class='readout'>
                        {roundedReadout}
                        {fader.precis ? '⋯' : ' ▹'}
                    </text>
                </g>
            </g>
        </g>
    </svg>
<!-- label -->
    {#if fader.focussed }
        <div id='{id}-label'
             class='faderContainer'
             style={'z-index: -1000'}>

<!-- LED indicator -->
            <svg in:fade out:fade>
                <g id='{id}-LED'
                   stroke="aqua" fill=none stroke-width="2px"
                   transform="translate({fader.width/2})">
<!--                    <circle id='{id}-LED' cy=-25 cx=-0.5 r=2 fill='aqua'/>-->
                    <line id='{id}-LED' x1="-0.5" x2="-0.5" y1="-5" y2="-25"></line>
                    <line x1="-20" x2="20" y1="-25" y2="-25" in:fade="{{duration: 2000}}"></line>
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

    .animatedReadout {
        position: absolute;
        background-color: transparent;
        font-size: x-large;
        z-index: 100;
    }
</style>
