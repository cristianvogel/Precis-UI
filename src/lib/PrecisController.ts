// Base class
import {remap, toNumber} from "./utils";
import {createEventDispatcher} from "svelte";
import {Palette as C} from "../lib/PrecisController";

type ControlRegistry = Set<WidgetTypes>

interface Unique {
    createUniqueID(): number
}

interface View {
    addControl(control: WidgetTypes): ControlRegistry;
    removeControl(control: WidgetTypes): ControlRegistry;
    getAll(): ControlRegistry;

    // todo: hideAll? scaleAll? disableAll?
}


export class PrecisUI implements View, Unique{
    private registry: ControlRegistry;
    createUniqueID(): number {
        return Math.floor(new Date().valueOf() * Math.random())
    };

    addControl(control: WidgetTypes): ControlRegistry {
        return this.getAll();
    }

    getAll(): ControlRegistry {
        return this.registry;
    }

    removeControl(control: WidgetTypes): ControlRegistry {
        return this.getAll();
    }
}
 interface CommonSettings {
    currentValue: number;
    rect:Rect
    rx:number
    taper:Taper
    scale:number
    label:string
    background?: Tint
    boundingRectCSS?: BoundingRectCSS
}

interface PrecisController {
    /** Used to place the widget on the page by returning inline style of container (div) element
     * @param boundingRectCSS
     * @param scale  ...transform: scale(${scale});
     */
    generateRectCSS(): BoundingRectCSS
    resize(scale:number, id:string): void;
    dispatchOutput(value: Output, id: string): void
    getNormValue(): number
    getMappedValue(): number
    get x():number
    get y():number
    set x( number:number )
    set y( number:number )
    get width():number
    get height():number
    set width(w:number)
    set height(h:number)
}

export class BasicController implements PrecisController {
    protected dispatch
    private _stateFlags: StateFlags = {precis: false , focussed: false, changing: false}
    selected:(HTMLElement | null) = null
    protected clientRect: DOMRect;
    protected currentValue: number;
    protected rect:Rect
    protected boundingRectCSS: BoundingRectCSS
    protected rx:number
    protected taper:Taper
    scale:number
    label:string
    protected background: Tint
    protected id: string

    constructor(  ) {
        this.dispatch = createEventDispatcher()
    }
    get changing(): boolean {
        return this._stateFlags.changing
    }
    set changing( b:boolean ) {
        this._stateFlags.changing = b
    }
    get precis(): boolean {
        return this._stateFlags.precis
    }
    set precis( b:boolean ) {
        this._stateFlags.precis = b
    }
    get focussed(): boolean {
        return this._stateFlags.focussed
    }
    set focussed( b:boolean ) {
        this._stateFlags.focussed = b
    }
    get stateFlags(): StateFlags {
        return this._stateFlags;
    }
    set stateFlags(settings: StateFlags) {
        this._stateFlags = {...settings};
    }

    dispatchOutput(value: Output, id: string): void {
        console.log( `dispatch out ${value} ${id}`)
        this.dispatch('output', {
            value,
            id,
        })
    }
    generateRectCSS(): BoundingRectCSS {
        const aRect:BoundingRectCSS =
            `top:${this.rect.y}px;left:${this.rect.x}px;width:${this.rect.width}px;height:${this.rect.height}px;`
        return aRect
    }
    getMappedValue(): number {
        return remap( this.getNormValue(), 0 ,1, this.taper.min, this.taper.max)
    }
    getNormValue(): number {
        return this.currentValue / this.height
    }
    resize(scale: number, id: string): void {
        const el = document.getElementById(`${id}-container`)
        if (!el) return
        const newStyle = `transform: scale(${scale});`
        el.setAttribute('style', el.getAttribute('style') + newStyle)
    }
    get x():number { return this.rect.x }
    get y():number {return this.rect.y}
    set x( number:number ) { this.rect.x = number }
    set y( number:number ) { this.rect.y = number }
    get width():number {return this.rect.width}
    get height():number {return this.rect.height}
    set width(w:number) { this.rect.width = toNumber(w) + this.rx }
    set height(h:number) { this.rect.height = toNumber(h) }

}


export class Radial extends BasicController {
    background = C.dim
    pointer = true
    tickMarks = true
    id:DialTag = 'dial.0'

    constructor(initialSettings) {
        super();
        Object.assign(this, initialSettings)
        super.id = this.id
        console.log( 'Constructor -> ' + this.id )
    }

    get radialTrack() {
        return (this.getNormValue() * 270) + 230
    }
}


class Slider extends BasicController implements PrecisController {
     background = C.clear
}

// 👀 https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862

const widgetMap = {
    dial: Radial,
    fader: Slider
}
type WidgetMap = typeof widgetMap
type WidgetTypes = keyof WidgetMap

/**
const widgetMap = {
    dial: Radial,
    fader: Slider
}
type WidgetMap = typeof widgetMap
type WidgetTypes = keyof WidgetMap
type Tuples<T> = T extends WidgetTypes ? [T, InstanceType<WidgetMap[T]>] : never;
type SingleKeys<K> = [K] extends (K extends WidgetTypes ? [K] : never) ? K : never;
type ClassType<A extends WidgetTypes> = Extract<Tuples<WidgetTypes>, [A, any]>[1];
class WidgetFactory {
    static getWidget<K extends WidgetTypes>(k: SingleKeys<K>): ClassType<K>{
        return widgetMap[k]
    }
}
**/


// Widget agnostic types
export type BoundingRectCSS = `top:${number}px;left:${number}px;width:${number}px;height:${number}px;`
export type Output = number | boolean | string


export type StateFlags = {
    precis: boolean, focussed: boolean, changing: boolean
}

// Name Rules
export type SliderTag = `slider.${number}` | ''
export type DialTag = `dial.${number}` | ''
export type SelectorTag = `selector.${number}` | ''

// Shared Geometry
type TransformElementCSS = `${BoundingRectCSS};transform: scale(${number});`
type ClientRect = DOMRect | null

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
} //todo: improve color palette stuff
export type Tint = RGB | Palette | RGBA | HEX

