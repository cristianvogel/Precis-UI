// Base class

import {addListeners, removeListeners} from "./Listeners";
import {clamp, remap, toNumber} from "./utils";
import {createEventDispatcher} from "svelte";

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

export class BasicController implements PrecisController, SharedEventHandlers {
    protected  dispatch
    private _stateFlags: StateFlags = {precis: false , changing: false}
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
    protected value: number
    protected touchedID: string

    constructor(  ) {
        this.dispatch = createEventDispatcher()
    }

    get precis(): boolean {
        return this._stateFlags.precis
    }
    set precis( p:boolean) {
        this._stateFlags.precis = p
    }

    get changing(): boolean {
        return this._stateFlags.changing
    }
    set changing( p:boolean) {
        this._stateFlags.changing = p
    }

    get stateFlags(): StateFlags {
        return this._stateFlags;
    }

    set stateFlags(value: StateFlags) {
        this._stateFlags = {...value};
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
    handleModifier(event: KeyboardEvent): void {
    }
    handleMouseDown(event: MouseEvent): void {
        const mode = (event.type)
        this.precis = (mode === 'contextmenu')
        this.selected = event.target as HTMLElement
        this.selected.focus()
        addListeners(this)
        this.dispatch(this.getMappedValue(), this.id)
    }

    handleMouseMove(event: MouseEvent): void {
        this.clientRect = (this.selected as Element).getBoundingClientRect()
        const dy = event.movementY
        if (dy === 0) {return}
        const {currentValue, height,  taper} = this
        const normValue = this.getNormValue()
        if (this._stateFlags.precis) {
            this.currentValue =
                clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
        } else {
            this.currentValue =
                clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
        }
        // component bound variables, will I need to dispatch these?
        this.value = this.getMappedValue()
        this.touchedID = this.id
    }

    handleMouseUp(): void {
        this.selected = null
        this._stateFlags = {precis: false, changing: false}
        removeListeners(this)
    }
}


export class Radial extends BasicController implements BasicController {
    background = C.dim
    pointer = true
    tickMarks = true
    id:DialTag = 'dial.0'

    constructor(initialSettings) {
        super();
        Object.assign(this, initialSettings)
        super.id = this.id
        console.log( Object.entries(this))
        super.handleMouseDown = super.handleMouseDown.bind(this)
        super.handleMouseMove = super.handleMouseMove.bind(this)
        super.handleMouseUp = super.handleMouseUp.bind(this)
    }
    radialTrack = () => { return (this.getNormValue() * 270) + 230}
    resize(scale: number): void {
    }
}


class Slider extends BasicController implements PrecisController {
     background = C.clear
}

// 👀 https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862
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


export interface SharedEventHandlers {
    handleMouseDown(event: MouseEvent, widget: WidgetTypes): void
    handleMouseMove(event: MouseEvent): void
    handleMouseUp(): void
    handleModifier(event: KeyboardEvent): void
}

export type StateFlags = {
    precis: boolean, changing: boolean
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

export enum C {
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
export type Tint = RGB | C | RGBA | HEX

