import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisController'
import type {PointsArray} from "../types/precisUI";

type WidgetEntry = Map<string, BasicController> // widget.id , instance
export const WidgetStore:Writable<WidgetEntry>  =
    writable( new Map() )

type PointerPlot = Map<string,PointsArray> // widget.id , array of points
export const PointerPlotStore:Writable<PointerPlot> =
    writable( new Map() )
