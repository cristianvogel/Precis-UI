import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisControllers'
import type {PointsArray} from "../types/Precis-UI-TypeDeclarations";

export type WidgetRegister = Map<string, BasicController> // widget.id , instance
export const WidgetStore:Writable<WidgetRegister>  =
    writable( new Map() )

type PointerPlot = Map<string,PointsArray> // widget.id , array of points
export const PointerPlotStore:Writable<PointerPlot> =
    writable( new Map() )

export const ListeningWidget:Writable<BasicController> =
    writable()

export const ListeningElement:Writable<HTMLElement> =
    writable()

export const touchedID: Writable<string> = writable('')
export const readout: Writable<number> = writable(0)
