// Base class
import {radialPoints, remap, roundTo, toNumber} from "./utils";
import {createEventDispatcher} from "svelte";
import {Palette as C} from "../lib/PrecisController";
import type {PointsArray} from "../types/precisUI";


abstract class PrecisController {

    protected dispatch
    selected: (HTMLElement | null) = null
    clientRect: DOMRect;
    boundingRectCSS: BoundingRectCSS
    rect: Rect
    rx: number
    scale: number
    label: string
    background: Tint
    protected _stateFlags: StateFlags = {precis: false, focussed: false, changing: false}

    protected constructor() {
        this.dispatch = createEventDispatcher()
    }

    abstract getNormValue(): number
    abstract getMappedValue(): number

    set stateFlags(settings: StateFlags) {
        this._stateFlags = {...settings};
    }
    get changing(): boolean {
        return this._stateFlags.changing
    }
    set changing(b: boolean) {
        this._stateFlags.changing = b
    }
    get precis(): boolean {
        return this._stateFlags.precis
    }
    set precis(b: boolean) {
        this._stateFlags.precis = b
    }
    get focussed(): boolean {
        return this._stateFlags.focussed
    }
    set focussed(b: boolean) {
        this._stateFlags.focussed = b
    }
    get x(): number {
        return this.rect.x
    }
    set x(number: number) {
        this.rect.x = number
    }
    get y(): number {
        return this.rect.y
    }
    set y(number: number) {
        this.rect.y = number
    }
    get width(): number {
        return this.rect.width
    }
    set width(w: number) {
        this.rect.width = toNumber(w) + this.rx
    }
    get height(): number {
        return this.rect.height
    }
    set height(h: number) {
        this.rect.height = toNumber(h)
    }
    dispatchOutput(id: string, value: Output,): void {
        this.dispatch('output', {
            value,
            id,
        })
    }
    generateRectCSS(): BoundingRectCSS {
        const aRect: BoundingRectCSS =
            `top:${this.rect.y}px;left:${this.rect.x}px;width:${this.rect.width}px;height:${this.rect.height}px;`
        return aRect
    }
    resize(scale: number, id: string): void {
        const el = document.getElementById(`${id}-container`)
        if (!el) return
        const newStyle = `transform: scale(${scale});`
        el.setAttribute('style', el.getAttribute('style') + newStyle)
    }
}

export class BasicController extends PrecisController {
    currentValue: number;
    taper: Taper
    id: string

    constructor() {
        super()
    }
    getMappedValue(): number {
        return roundTo(remap(this.getNormValue(), 0, 1, this.taper.min, this.taper.max), 0.0001)
    }
    getNormValue(): number {
        return this.currentValue / this.height
    }
}

export class Radial extends BasicController {
    background = C.dim
    pointer = true
    tickMarks = true
    id: DialTag = 'dial.0'
    radialPoints:PointsArray;

    constructor(initialSettings) {
        super();
        Object.assign(this, initialSettings)  // don't do this lazy move on a server, very insecure!
        super.id = this.id
        console.log('Constructed -> ' + this.id)
    }
    spinPointer() {
        this.radialPoints = radialPoints(this.getRadialTrack(), 50, 50, 10, 55, 20)
        return this.radialPoints
    }
    getRadialTrack(): number {
        return (this.getNormValue() * 270) + 230
    }
}
export class Fader extends BasicController {
    background = C.dim
    id:FaderTag = 'fader.0'

    constructor(initialSettings) {
        super();
        Object.assign(this, initialSettings)  // don't do this lazy move on a server, very insecure!
        super.id = this.id
        console.log('Constructed -> ' + this.id)
    }
}


// Widget agnostic types
export type BoundingRectCSS = `top:${number}px;left:${number}px;width:${number}px;height:${number}px;`
export type Output = number | boolean | string
export type StateFlags = {
    precis: boolean, focussed: boolean, changing: boolean
}

// Name Rules
export type FaderTag = `fader.${number}` | ''
export type DialTag = `dial.${number}` | ''
export type SelectorTag = `selector.${number}` | ''

// Shared Geometry
export interface Rect {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface Taper {
    min: number,
    max: number,
    fineStep: number,
    grid?: number
}

// Colours
// todo: improve color palette stuff
type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HEX = `#${string}`
export enum Palette {
    clear = 'transparent',
    black = 'black',
    sky = 'skyblue',
    cyan = 'cyan',
    aquaLight = 'aqua',
    red = 'mediumvioletred',
    blanco = 'white',
    silver = 'silver',
    pink = 'hotpink',
    offWhite = 'antiquewhite',
    dim = 'darkgrey',
    aquaDark = 'darkturquoise',
    pinkDark = 'deeppink',
    whiteBis = 'ghostwhite',
    frenchSilver = 'gainsboro',
    slate = 'slategray',
    tan = 'tan',
    deepBlue = 'midnightblue'
}
export type Tint = RGB | Palette | RGBA | HEX

