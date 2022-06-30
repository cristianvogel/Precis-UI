import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisController'
import type {Point, PointsArray} from "../types/precisUI";
import type {Postcss} from "svelte-preprocess/dist/types/options";

type WidgetEntry = Map<string, BasicController> // widget.id , instance
export const WidgetStore:Writable<WidgetEntry>  =
    writable( new Map() )

type PointerPlot = Map<string,PointsArray> // widget.id , array of points
export const PointerPlotStore:Writable<PointerPlot> =
    writable( new Map() )

// mouse location when locking
export const MouseLocationStore:Writable<Point> =
    writable( {x:0, y:0} )
