// Base class

import {addListeners, removeListeners} from "./Listeners";
import {clamp, remap, toNumber} from "./utils";
import {Radial, RadialSettings} from "./Radial";
import {Slider, SliderSettings} from "./Slider";
import {Selector, SelectorSettings} from "./Selector";
import type {Readout, ReadoutSettings} from "./Readout";

type ControlRegistry = Set<WidgetType>

interface Unique {
    createUniqueID(): number
}

interface View {
    addControl(control: WidgetType): ControlRegistry;
    removeControl(control: WidgetType): ControlRegistry;
    getAll(): ControlRegistry;
    // todo: hideAll? scaleAll? disableAll?
}

interface WidgetFactory {
    create(widget: Widgets, initialSettings: SharedSettings): WidgetType;
}

export enum Widgets { radial, slider, selector, readout }

export type WidgetType = Radial | Selector | Slider | Readout | unknown


export class PrecisUI implements Unique, View, WidgetFactory {

    app: string
    registry: Set<WidgetType>
    #UUid: number

    constructor(app?: string) {
        this.registry = new Set()
        this.app = app ?? 'PrecisUI'
        this.#UUid = this.createUniqueID()
    }

    create(widget: Widgets, initialSettings: (SharedSettings & RadialSettings)  ) {
        switch (widget) {
            case(Widgets.radial):
                return new Radial( initialSettings  )
            case(Widgets.slider):
                return new Slider( initialSettings )
            case(Widgets.selector):
                return new Selector( initialSettings )
            case(Widgets.readout):
                return new Selector( initialSettings )
            default:
                return 'unknown widget' as unknown
        }
    }

    addControl(control: WidgetType): ControlRegistry {
        this.registry.add(control)
        return this.registry
    }

    removeControl(control: WidgetType): ControlRegistry {
        this.registry.delete(control)
        return this.registry
    }

    getAll(): ControlRegistry {
        return this.registry
    }

    createUniqueID(): number {
        return Math.floor(new Date().valueOf() * Math.random())
    };

    getUUid(): number {
        return this.#UUid
    }
}

export interface SharedSettings {
    label: string,
    currentValue: number,
    rect: Rect,
    scale: number,
    rx: number,
    taper: Taper,
    background?: Tint | 'transparent'
}

// Widget agnostic types
export type BoundingRectCSS = `top:${number}px;
			 left:${number}px;
			 width:${number}px;
			 height:${number}px;`

export type Output = number | boolean | string

// Widget agnostic methods and events
export interface SharedMethods {
    /** Used to place the widget on the page by returning inline style of container (div) element
     * @param boundingRectCSS
     * @param scale  ...transform: scale(${scale});
     */
    generateRectCSS(): BoundingRectCSS
    /** Redraw newly scaled widgets
     * @param scale ...transform: scale(${scale});
     */
    resize(scale:number, id:string): void;
    /** Output dispatcher
     * @param value value to dispatch
     * @param id id of the widget that dispatched
     */
    dispatchOutput(value: Output, id: string): void
    getNormValue(): number
    getMappedValue(): number
}

export interface SharedEventHandlers extends SharedMethods {
    handleMouseDown(event: MouseEvent): void
    handleMouseMove(event: MouseEvent): void
    handleMouseUp(): void
    handleModifier(event: KeyboardEvent): void
}

export type StateFlags = {
    precis: boolean, changing: boolean
}

export class PrecisControl implements SharedEventHandlers, SharedMethods {
    private stateFlags: StateFlags = {precis: false , changing: false}
    private selected:(HTMLElement | null) = null
    private clientRect: DOMRect;
    private currentValue: number;
    private rect:Rect
    private boundingRectCSS: BoundingRectCSS
    private rx:number
    private taper:Taper
    private scale:number
    private label:string
    private background: Tint

    get x():number { return this.rect.x }
    get y():number {return this.rect.y}
    set x( number:number ) { this.rect.x = number }
    set y( number:number ) { this.rect.y = number }
    get width():number {return this.rect.width}
    get height():number {return this.rect.height}
    set width(w:number) { this.rect.width = toNumber(w) + this.rx }
    set height(h:number) { this.rect.height = toNumber(h) }

    generateRectCSS(): BoundingRectCSS {
        return this.boundingRectCSS
    }

    getMappedValue(): number {
        return remap( this.getNormValue(), 0 ,1, this.taper.min, this.taper.max)
    }

    getNormValue(): number {
        return this.currentValue / this.rect.height
    }

    resize(scale: number , id:string):void {
        const el = document.getElementById(`${id}-container`)
        if (!el) return
        const newStyle = `transform: scale(${scale});`
        el.setAttribute('style', el.getAttribute('style') + newStyle)
    }

    handleModifier(event: KeyboardEvent): void {
    }

    handleMouseDown(event: MouseEvent): void {
        const mode = (event.type)
        this.stateFlags.precis = (mode === 'contextmenu')
        this.selected = event.target as HTMLElement
        this.selected.focus()
        addListeners(this)
    }

    handleMouseMove(event: MouseEvent): void {
        this.clientRect = (this.selected as Element).getBoundingClientRect()
        const dy = event.movementY
        if (dy === 0) {return}
        const {currentValue, height,  taper} = this
        const normValue = this.getNormValue()
        if (this.stateFlags.precis) {
            this.currentValue =
                clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
        } else {
            this.currentValue =
                clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
        }
        // component bound variables, need to dispatch?
        // value = this.mappedValue
        // touchedID = this.id
    }

    handleMouseUp(): void {
        this.selected = null
        this.stateFlags = {precis: false, changing: false}
        removeListeners(this)
    }

    dispatchOutput(value: Output, id: string): void {
    }
}




// Name Rules
export type SliderTag = `slider.${number}` | ''
export type DialTag = `dial.${number}` | ''
export type SelectorTag = `selector.${number}` | ''

// Shared Geometry
type TransformElementCSS = `${BoundingRectCSS};
                          transform: scale(${number});`
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

