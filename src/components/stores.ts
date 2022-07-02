import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisControllers'
import type { PointsArray} from "../types/precisUI";
import {Default} from "../types/precisUI";


type WidgetEntry = Map<string, BasicController> // widget.id , instance
export const WidgetStore:Writable<WidgetEntry>  =
    writable( new Map() )

type PointerPlot = Map<string,PointsArray> // widget.id , array of points
export const PointerPlotStore:Writable<PointerPlot> =
    writable( new Map() )

export const ListeningWidget:Writable<BasicController> =
    writable()

export const ListeningElement:Writable<HTMLElement> =
    writable()

export const rescaleDials: Writable<number> = writable( Default.DIAL_SCALE_FACTOR as number )
export const rescaleFaders: Writable<number> = writable( Default.FADER_SCALE_FACTOR as number )
export const touchedID: Writable<string> = writable('')
export const readout: Writable<number> = writable(0)
