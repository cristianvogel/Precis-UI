<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DEFAULT_TAPER} from './Precis-UI-Defaults';
    import {BasicController, Fader, Toggle} from '../lib/PrecisControllers';
    import {clamp, toNumber} from '../lib/Utils';
    import {onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import {WidgetStore} from '../stores/stores.js'
    import {ToggleTag, Rect, Taper} from '../types/Precis-UI-TypeDeclarations';

    export let
        graphicStyle: number = 1,
        min: number = DEFAULT_TAPER.min,
        max: number = DEFAULT_TAPER.max,
        x: number = Default.X,
        y: number = Default.Y,
        width: number = Default.BUTTON_WIDTH,
        height: number = Default.BUTTON_HEIGHT,
        scale: number = Default.BUTTON_SCALE_FACTOR,
        rx: number = Default.FADER_rX,
        id: ToggleTag = 'toggle.0',
        label: string = 'Toggle',
        value: number = 0,
        rect: Rect = {
            x: toNumber(x),
            y: toNumber(y),
            width: toNumber(width),
            height: toNumber(height)
        },
        taper: Taper = {
            min: toNumber(min),
            max: toNumber(max),
            fineStep: 0.5
        },
        background = Default.BUTTON_BACKGROUND


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
    let toggle:Toggle = new Toggle(settings)
    BasicController.initialise(toggle)
    const refresh = ()=> {toggle = toggle}

    onMount(() => {
        toggle.dispatchOutput(toggle.id, toggle.getMappedValue());
    })

    let position: number | boolean = 0;
    const design = {
        designIndex: ()=>clamp(graphicStyle, [0,1], true),
        trimColour: [ 'coral' , 'green']
    }
    const {designIndex, trimColour} = design
    let toggleDesign:string|undefined =  [ 'toggle-alt', 'toggle' ].at(designIndex())

    $:registrySize = $WidgetStore.size
    $:position = toggle.state

</script>

<div class='toggleContainer'
     id='{toggle.id}-container'
     on:mousedown|preventDefault={(e)=>{toggle.componentMouseDown(e, toggle)}}
     on:mouseup={()=>(toggle.stateFlags={changing: false, focussed: true, precis: false})}
     style={toggle.containerTransform(toggle, scale)}
>
    <div class={position ? `${toggleDesign} on` : `${toggleDesign}`}>
        <div class={position ? `${toggleDesign} led on` : `${toggleDesign} led`}>
        </div>
        <div id='{toggle.id}-button-text'>
        <svg>
            <g transform="translate({toggle.width/2} {(toggle.height/2) * 0.8})">
                <text class="toggle-text"
                      fill={position ? trimColour.at(designIndex()): 'darkslategray'}
                      text-anchor="middle"
                      dominant-baseline="mathematical">
                    {label}︎
                </text>
            </g>
        </svg>
        </div>
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
        border-radius: 0.5em;
        transition: 150ms ease-in-out;
        background: linear-gradient(#eee 10%, #fff);
        border: 1px solid #ddd
    }

    .toggle.on {
        background: linear-gradient(#fff 10%, #eee);
        border: 1px solid darkgrey;
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


    .toggle-text {
        font-size: xx-large;
        color: darkslategray;
        stroke: white;
    }

    .toggle-alt {
        position: absolute;
        height: 100%;
        width: 100%;
        display: block;
        cursor: pointer;
        border-radius: 0.5em;
        transition: 350ms;
        background: linear-gradient(white 5%, silver 33%, antiquewhite 85%);
        border: 1px solid darkgrey
    }

    .toggle-alt.on {
        border: 1px solid #ddd;
        background: linear-gradient(whitesmoke 5%, silver 33%, whitesmoke 85%);
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



</style>
