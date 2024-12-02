<script lang="ts">
    import { run, preventDefault } from 'svelte/legacy';

    // Precis-UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DEFAULT_TAPER} from './Precis-UI-Defaults';
    import {BasicController, Toggle} from '../lib/PrecisControllers.svelte';
    import {clamp, toNumber} from '../lib/Utils.svelte';
    import {onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import type {ToggleTag, Rect, Taper} from '../types/Precis-UI-TypeDeclarations';

    
    interface Props {
        // ingest props from caller
        graphicStyle?: number;
        // ingest props from caller
        min?: number;
        // ingest props from caller
        max?: number;
        // ingest props from caller
        taper?: Taper;
        // ingest props from caller
        rect?: Rect;
        // ingest props from caller
        x?: number;
        // ingest props from caller
        y?: number;
        // ingest props from caller
        width?: number;
        // ingest props from caller
        height?: number;
        // ingest props from caller
        scale?: number;
        // ingest props from caller
        rx?: number;
        // ingest props from caller
        id?: ToggleTag;
        // ingest props from caller
        label?: string;
        // ingest props from caller
        value?: number;
        // ingest props from caller
        background?: any;
    }

    let {
        graphicStyle = 1,
        min = DEFAULT_TAPER.min,
        max = DEFAULT_TAPER.max,
        taper = $bindable({} as Taper),
        rect = $bindable({} as Rect),
        x = Default.X,
        y = Default.Y,
        width = Default.BUTTON_WIDTH,
        height = Default.BUTTON_HEIGHT,
        scale = Default.BUTTON_SCALE_FACTOR,
        rx = Default.FADER_rX,
        id = 'toggle.0',
        label = 'Toggle',
        value = 0,
        background = Default.BUTTON_BACKGROUND
    }: Props = $props();

    // assert that we do actually have a rect and a taper
    rect = {
        x: toNumber(rect.x || x),
        y: toNumber(rect.y || y),
        width: toNumber(rect.width || width),
        height: toNumber(rect.height || height)
    }

    taper = {
        min: toNumber( taper.min || min),
        max: toNumber(taper.max || max),
        fineStep: 1
    }

    // initialise with these settings
    const settings = {
        currentValue: value,
        id,
        label,
        rect,
        rx,
        scale,
        taper
    }

    // Construct a new instance of a  toggle
    let toggle:Toggle = $state(new Toggle(settings))
    $effect ( ()=>
        {
            BasicController.initialise(toggle);
        }

    )


    let toggleState: number | boolean = $state(0);
    let toolTip:boolean = $state(false)
    const design = {
        designIndex: ()=>clamp(graphicStyle, [0,1], true),
        trimColour: [ 'coral' , 'green']
    }
    const {designIndex, trimColour} = design
    let toggleDesign:string|undefined =  [ 'toggle-alt', 'toggle' ].at(designIndex())

    

</script>
<!-- container and functionality -->
<div class='toggleContainer'
     id='{toggle.id}-container'
     onmouseenter={()=>toolTip = true}
     onmouseleave={()=>toolTip = false}
     onmousedown={preventDefault((e)=>{toggle.componentMouseDown(e,toggle)})}
     onmouseup={()=>(toggle.stateFlags={changing: false, focussed: true, precis: false})}
     style={toggle.containerTransform(toggle, scale)}
>
<!-- led and text -->
        <div class={toggleState ? `${toggleDesign} on` : `${toggleDesign}`}> 
        <div class={toggleState ? `${toggleDesign} led on` : `${toggleDesign} led`}></div>
<!-- button text -->
        <svg dominant-baseline="mathematical" text-anchor="middle">
            <g transform="translate({toggle.width/2} {(toggle.height/2) * 0.8})">
                <text class={`${toggleDesign} text`}
                      fill={toggleState ? trimColour.at(designIndex()): ''}
                >
                    {label}︎
                </text>
            </g>
<!-- simple tool tip -->
            {#if (toolTip)}
                <g transform="translate(0, 60)" in:fade|global out:fade|global>
                    <rect  width="{toggle.width}" height="20" fill="antiquewhite" rx="5" />
                    <text textLength="{toggle.width * 0.75}"
                          text-anchor="start"
                          alignment-baseline="hanging"
                          transform="translate(10 5)"
                          font-size="12">{toggle.label} widget {toggle.registryIndex} </text>
                </g>
            {/if}
        </svg>
    </div>

</div>

<style>
    svg {
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .toggleContainer {
        position: absolute;
        border-radius: 25px;
        z-index: 0;
    }

    .toggle {
        position: absolute;
        height: 100%;
        width: 100%;
        display: block;
        cursor: pointer;
        border-radius: 0.75em;
        transition: 100ms ease-in-out;
        /*background: linear-gradient(#eee 10%, #aaa);*/
        background: darkslategray;
        border: 1px solid #ddd
    }

    .toggle.on {
        /*background: linear-gradient(#aaa 10%, #eee);*/
        background: darkslategray;
        border: 1px solid springgreen;
    }

    .toggle.led {
        position: absolute;
        width: 0.75em;
        height: 0.75em;
        top: 0.25em;
        left: 0.25em;
        border-radius: 50%;
        transition: 150ms ease-in-out;
        background: linear-gradient(#5e4e3e 5%, #2e2e2e 33%, darkgreen 85%);
    }

    .toggle.led.on {
        transform: scale(0.95);
        background: radial-gradient(springgreen 5%, darkgreen 45%, #2e2e2e 75%);
    }


    .toggle.text {
        font-size: xx-large;
        fill: cyan;
    }

    .toggle-alt {
        position: absolute;
        height: 100%;
        width: 100%;
        display: block;
        cursor: pointer;
        border-radius: 0.75em;
        transition: 350ms;
       background: linear-gradient(white 5%, antiquewhite 33%, slategrey 85%);
        border: 1px solid darkgrey
    }

    .toggle-alt.on {
        border: 1px solid #ddd;
        background: linear-gradient(whitesmoke 5%, silver 33%, antiquewhite 85%);
    }

    .toggle-alt.led {
        position: absolute;
        width: 0.75em;
        height: 0.75em;
        top: 0.25em;
        left: 0.25em;
        border-radius: 50%;
        transition: 150ms ease-in-out;
        border: 1px solid #ddd;
        background: linear-gradient(#5e4e3e 5%, #2e2e2e 33%, orange 85%);
    }

    .toggle-alt.led.on {
        transform: scale(0.95);
        background: radial-gradient(whitesmoke 5%, orange 45%, #2e2e2e 75%);
    }

    .toggle-alt.text {
        font-size: xx-large;
        fill: darkslategray;
        stroke: #cccccc;
    }



</style>
