<script lang="ts">
    // Precision Audio UI © Cristian Vogel 2022
    // No unauthorised use or derivatives!
    // @neverenginelabs

    import {Default, DefaultTaper} from "../types/precisUI";
    import {Radial, RadialSettings} from "../lib/Radial";
    import type {DialTag, WidgetType} from "../lib/PrecisController";
    import {toNumber} from "../lib/utils";
    import {PrecisControl, PrecisUI, Widgets, Taper, Rect} from "../lib/PrecisController";
    import {getContext} from "svelte";
    import Dial from "./Dial.svelte";

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

    const precis:PrecisUI = getContext('precis')

    const rect:Rect = {
        x: toNumber(x),
        y: toNumber(y),
        width: toNumber(width),
        height: toNumber(width)
    }

    const taper:Taper = {
        min: toNumber(min),
        max: toNumber(max),
        fineStep: toNumber(fineStep)
    };

    const dial:WidgetType = precis.create( Widgets.radial, {
        currentValue: value,
        label,
        rect,
        rx,
        scale,
        taper
    })





</script>
