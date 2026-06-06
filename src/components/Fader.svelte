<script lang="ts">
  /**
   * Precis-UI © Cristian Vogel 2022
   * No unauthorised use or derivatives!
   * @neverenginelabs
   */

  import { Default, DEFAULT_TAPER } from "./Precis-UI-Defaults.js";
  import { BasicController, Fader } from "../lib/PrecisControllers.svelte.js";
  import type { WidgetOutputHandler } from "../lib/PrecisControllers.svelte.js";
  import { remap, toNumber } from "../lib/Utils.svelte.js";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { WidgetStore } from "../stores/stores.js";
  import type {
    Rect,
    Taper,
  } from "../types/Precis-UI-TypeDeclarations.js";
  import { Palette as C } from "../types/Precis-UI-TypeDeclarations.js";

  interface Props {
    min?: number;
    max?: number;
    fineStep?: number;
    taper?: Taper;
    rect?: Rect;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scale?: number;
    rx?: number;
    background?: any;
    id?: string;
    tickMarks?: boolean;
    label?: string;
    value?: number;
    animatedReadout?: boolean;
    output?: WidgetOutputHandler;
  }

  let {
    min = DEFAULT_TAPER.min,
    max = DEFAULT_TAPER.max,
    fineStep = DEFAULT_TAPER.fineStep,
    taper = $bindable({} as Taper),
    rect = $bindable({} as Rect),
    x = Default.X,
    y = Default.Y,
    width = Default.FADER_WIDTH,
    height = Default.FADER_HEIGHT,
    scale = Default.FADER_SCALE_FACTOR,
    rx = Default.FADER_rX,
    background = Default.FADER_BACKGROUND,
    id = "fader.0",
    tickMarks = true,
    label = "",
    value = 0,
    animatedReadout = true,
    output,
  }: Props = $props();

  // assert that we do actually have a rect and a taper
  // svelte-ignore state_referenced_locally
  rect = {
    x: toNumber(rect.x || x),
    y: toNumber(rect.y || y),
    width: toNumber(rect.width || width),
    height: toNumber(rect.height || height),
  };

  // svelte-ignore state_referenced_locally
  taper = {
    min: toNumber(taper.min || min),
    max: toNumber(taper.max || max),
    fineStep: toNumber(taper.fineStep || fineStep),
  };

  // initialise with these settings
  // svelte-ignore state_referenced_locally
  const settings = {
    currentValue: value,
    id,
    label,
    rect,
    rx,
    scale,
    taper,
    tickMarks,
    background,
  };

  // Construct a new instance of a vertical fader
  let fader: Fader = new Fader(settings);
  let container: HTMLDivElement | null = null;
  let track: SVGRectElement | null = null;
  let handle: SVGGElement | null = null;

  onMount(() => {
    BasicController.initialise(fader, { output });
    // how to use the registry index of this instance
    // to add a unique suffix to the fader's label
    fader.label += fader.registryIndex.toString();

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      fader.componentMouseDown(e, fader);
    };
    const onEnter = (e: MouseEvent) => {
      fader.componentMouseEnter(e, fader);
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      fader.componentMouseDown(e, fader);
    };
    const onDoubleClick = (ev: MouseEvent) => {
      ev.preventDefault();
      fader.currentValue = fader.height - ev.offsetY;
    };

    container?.addEventListener("mousedown", onMouseDown);
    container?.addEventListener("contextmenu", onContextMenu);
    container?.addEventListener("mouseenter", onEnter);
    handle?.addEventListener("contextmenu", onContextMenu);
    track?.addEventListener("dblclick", onDoubleClick);

    // send out an initial value message once
    BasicController.dispatchOutput(fader);

    return () => {
      container?.removeEventListener("mousedown", onMouseDown);
      container?.removeEventListener("contextmenu", onContextMenu);
      container?.removeEventListener("mouseenter", onEnter);
      handle?.removeEventListener("contextmenu", onContextMenu);
      track?.removeEventListener("dblclick", onDoubleClick);
    };
  });

  // Reactive
  let upperBand = $derived(fader.getNormValue() > 0.75);
  let roundedReadout = $derived(fader.getRoundedReadout());
  let registrySize = $derived($WidgetStore.size);
</script>

<!-- Here begins the computational graphic design in Svelte/HTML/SVG
Please be aware that this style of graphic design
is accomplished through many hours of iterative design.
I try not to rely too much on oddball magic constants,
but there are places that have required some magic
looking nudges and transforms.

Different graphical components of the SVG are contained
in <g>....</g> with an id to help readability or to further reference
using DOM selectors if needed
-->

<!-- container and functionality -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="faderContainer"
    id="{fader.id}-container"
    bind:this={container}
    onmouseleave={(e) => {
      fader.componentMouseLeave(e, fader);
    }}
    onmouseup={() =>
      (fader.stateFlags = { changing: false, focussed: true, precis: false })}
    style={fader.containerTransform(fader, scale)}
 >
  <!-- animated numerical readout mojo-->
  {#if fader.changing && animatedReadout}
    {@const value = fader.getNormValue()}
    {@const gearedValue = (value * -200) % 20}
    {@const offsetMap =
      remap({
        n: gearedValue,
        start1: -10,
        stop1: 10,
        start2: -0.25,
        stop2: 0.25,
      }) + 0.5}
    {@const sinMap = Math.sin(Math.PI * offsetMap)}
    {@const adjust = {
      x: -Math.pow(roundedReadout.length, 1.6),
      y: -100 + gearedValue * 2,
      scale: { x: 1, y: Math.abs(sinMap) + 0.125 },
      opacity: Math.abs(sinMap) + 0.1,
    }}
    <div id="{fader.id}-animatedReadout" class="animatedReadout">
      <svg in:fade|global out:fade|global>
        <g
          stroke-width="1px"
          opacity={adjust.opacity}
          transform="translate( {adjust.x}, {adjust.y} )
                              scale({adjust.scale.x}, {fader.precis
            ? 1
            : adjust.scale.y} )"
        >
          <text
            fill={C.aquaLight}
            textLength={fader.width * (roundedReadout.length / 2)}
            >{roundedReadout}</text
          >
        </g>
      </svg>
    </div>
  {/if}

  <!-- SVG with many procedural transformations  -->
  <svg>
    <defs id="{id}-gradients">
      <!-- dynamically changing colours defined here -->
      <linearGradient
        id="{id}-grad"
        x1="0"
        x2="0"
        y1="0"
        y2={remap({
          n: fader.getNormValue(),
          start1: 0,
          stop1: 1,
          start2: 3,
          stop2: 0,
        })}
      >
        <stop offset="0" stop-color={C.black} />
        <!-- todo: abstract out the colour assign -->
        <stop
          offset="80%"
          stop-color={[C.red, C.sky, C.pink, C.aquaDark, C.slate].at(
            registrySize % 5
          )}
        />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="0.4" stdDeviation="0.2" />
      </filter>
    </defs>
    <!-- todo: double click on track is broken -->
    <!-- fader track -->
    <g fill="url('#{id}-grad')" stroke={C.whiteBis} stroke-width="0.0625rem">
      <rect
        id="#{id}-track"
        width={fader.width}
        height={fader.height + fader.rx}
        rx="4px"
        x="0rem"
        bind:this={track}
      />
      <!-- handle -->
      <g
        id="{id}-handle+readout"
        bind:this={handle}
        stroke={C.offWhite}
        transform="translate(0,{fader.height - fader.currentValue}) scale(1.5)"
      >
        <rect
          fill={C.whiteBis}
          height={Math.pow(fader.rx, fader.precis ? 1 : 2)}
          width="66%"
          id="{id}-handle"
          stroke="none"
          style="filter:url(#shadow);"
        />
        <!-- inner readout w/ some procedural transformations -->
        <g
          id="{id}-readout"
          class="readoutBox"
          class:rotated={true}
          style="opacity:{fader.changing ? 1 : 0.7}"
        >
          <rect
            id="{id}-readout.Box"
            class="readoutBox"
            class:zoom={fader.precis}
            class:flipped={upperBand}
            height="1.25rem"
            rx="3px"
            width="2.75rem"
            x="-0.5rem"
            y="-0.5rem"
          />
          {#if !fader.precis}
            <g transform="scale( {fader.precis ? 2 : 1} )" out:fade|global>
              <text
                id="{id}-readout.Text"
                class="readout"
                class:dial={true}
                class:flipped={upperBand}
                class:rotated={!upperBand}
              >
                {roundedReadout}
                {fader.precis ? "⋯" : " ▹"}
              </text>
            </g>
          {/if}
        </g>
      </g>
    </g>
  </svg>

  <!-- label -->
  {#if fader.focussed}
    <div id="{id}-label" class="faderContainer" style={"z-index: -1000"}>
      <!-- LED indicator -->
      <svg in:fade|global out:fade|global>
        <g
          id="{id}-LED"
          stroke="aqua"
          fill="none"
          stroke-width="2px"
          transform="translate({fader.width / 2})"
        >
          <line id="{id}-LED" x1="-0.5" x2="-0.5" y1="-5" y2="-25"></line>
          <line
            x1="-20"
            x2="20"
            y1="-25"
            y2="-25"
            in:fade|global={{ duration: 2000 }}
          ></line>
          <text
            id="{id}-label.Text"
            class="label rotated"
            textLength={fader.height * 0.25}
          >
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
    font-family: "Roboto", sans-serif;
    font-size: small;
    stroke: none;
    fill: grey;
    pointer-events: none;
  }

  .label.rotated {
    transform: rotate(90deg) translate(0.25rem, -1rem);
  }

  .readout {
    font-family: "Roboto", sans-serif;
    font-size: x-small;
    stroke-width: 0;
    fill: aqua;
    cursor: grab;
  }

  .readout.rotated {
    transform: translate(-8ex, -1ex);
  }

  .readout.flipped {
    transform: rotate(-180deg) translate(-8ex, 2ex);
  }

  .readoutBox {
    transform: translate(-2.5rem, -0.6rem) scale(1, 0.55);
    stroke-width: 0;
    fill: rgba(120, 120, 120, 0.5);
    pointer-events: none;
  }

  .readoutBox.rotated {
    transform: rotate(90deg);
  }

  .readoutBox.flipped {
    transform: rotate(-180deg) scale(-1, -0.5) translate(2ex, -2ex);
  }

  .readoutBox.zoom {
    transform: translate(-1.5rem, -0.66rem) scaleX(225%) scaleY(110%);
  }

  .animatedReadout {
    position: absolute;
    background-color: transparent;
    font-size: x-large;
    transform: translateY(3.25em);
    z-index: 100;
  }
</style>
