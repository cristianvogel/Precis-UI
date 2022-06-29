import { Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisController'
import type {PointsArray} from "../types/precisUI";

export const widgetStore:Writable<Map<string, BasicController>>  =
    writable( new Map() );

export let dialPointer:Writable<PointsArray> =
    writable([])
