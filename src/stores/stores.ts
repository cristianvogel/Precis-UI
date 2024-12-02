import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisControllers.svelte.js'
import type {PointsArray} from "../types/Precis-UI-TypeDeclarations.js";

export type WidgetRegister = Map<string, BasicController> // widget.id , instance
export const WidgetStore:Writable<WidgetRegister>  =
    writable( new Map() )

export type PointerPlot = Map<string,PointsArray> // widget.id , array of points


export const ListeningWidget:Writable<BasicController> =
    writable()

export const ListeningElement:Writable<HTMLElement> =
    writable()

/**
 * this is an experimental implementation
 * of a Dirty flag in a store. When it is triggered, its value increments
 * by 1 and can then be used to trigger use() actions
 */
function createDirty() {
    const { subscribe, set, update } = writable(0);

    return {
        subscribe,
        resetTo: (v: number)=> {set(v)},
        trigger: ()=> update( n => (n+1) )
    }
}

export const Dirty = createDirty()
