import {Writable, writable} from 'svelte/store';
import type {BasicController} from '../lib/PrecisController'

export const dialStore:Writable<Map<string, BasicController>>  =
    writable( new Map );
