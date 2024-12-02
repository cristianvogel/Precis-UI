/**
 *  Precis-UI © Cristian Vogel 2022
 *  No unauthorised use or derivatives!
 *  @neverenginelabs
 *
 * __PrecisControllers__
 *
 * Annotates and implements Base classes and all derived controller classes
 */
import { asLogicValue, radialPoints, remap, roundTo, toNumber } from './Utils.svelte.js';
import { createEventDispatcher } from "svelte";
import { addListeners } from "./Listeners.svelte.js";
import { Dirty, WidgetRegister, WidgetStore } from '../stores/stores.js';
import { get } from 'svelte/store';
import { Palette as C } from "../types/Precis-UI-TypeDeclarations.js";
import { Default, DEFAULT_RECT } from '../components/Precis-UI-Defaults.js';
import type {
    PointsArray,
    RoundedReadout,
    BoundingRectCSS,
    DialTag,
    FaderTag,
    Rect,
    StateFlags,
    Taper,
    Tint,
    ToggleTag,
    PositiveNumber
} from '../types/Precis-UI-TypeDeclarations.js';




/**
 * __Precis UI__
 *
 * Base class. For layout and global specifications.
 */
export class PrecisUI {
    protected static dispatch: any;

    constructor() { 
        PrecisUI.dispatch = createEventDispatcher()
    }

    static dispatchRefresh() {
        console.log('layout refresh event')
        PrecisUI.dispatch('refresh')
    }

    static getRegistry(): WidgetRegister { return get(WidgetStore) }
    static getWidgetByTag(tag: string) { return get(WidgetStore).get(tag) || undefined }
    static scaleAllWidgets(scaleFactor: PositiveNumber) {
        get(WidgetStore).forEach((e) => {
            e.scale = scaleFactor
        })
        Dirty.trigger()
    }

}
/**
 * __PrecisController__
 *
 * Base architecture for a controller.
 *
 * Dispatcher, geometry, state flags, label etc
 */
abstract class PrecisController extends PrecisUI {
    selected: HTMLElement | null = null;
    rect: Rect = { x: 0, y: 0, width: 0, height: 0 };
    rx: number = 0;
    scale: number = 1;
    label: string = '';
    background: Tint = '#000';
    layer: number = 0;
    private _registryIndex: number = 0;

    protected _stateFlags: StateFlags = { precis: false, focussed: false, changing: false }

    protected constructor() {
        super();
    }

    abstract getNormValue(): number
    abstract getMappedValue(): number
    abstract getRoundedReadout(): RoundedReadout
    abstract componentMouseDown(event: Event, caller: BasicController): void
    abstract componentMouseEnter(event: Event, caller: BasicController): void
    abstract componentMouseLeave(event: MouseEvent, caller: BasicController): void
    static dispatchOutput(widget: BasicController): void { }

    set stateFlags(settings: StateFlags) {
        this._stateFlags = { ...settings };
    }
    get registryIndex(): number {
        return this._registryIndex;
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
        return this.rect.width as number
    }
    set width(w: number) {
        this.rect.width = toNumber(w) + this.rx
    }
    get height(): number {
        return this.rect.height || Default.SQUARE
    }
    set height(h: number) {
        this.rect.height = toNumber(h)
    }

    getCSSforRect(xywh: Rect): BoundingRectCSS {
        const aRect: BoundingRectCSS =
            `top:${xywh.y}px;left:${xywh.x}px;width:${xywh.width as number}px;height:${xywh.height as number}px;`
        return aRect
    }
    /**
     * add self to a layout group registry
     * @param widget
     */
    static addSelfToRegistry(widget: BasicController): void {
        if (!widget) return
        get(WidgetStore).set(widget.id, widget)
        widget._registryIndex = BasicController.getRegistry().size
    }
    /**
     * CSS transform which renders the widget's container element
     * todo: narrow down return type
     * @param widget
     * @param scale
     * @param newRect  optionally assign to a valid Rect instead of the instanced rect
     */
    containerTransform(widget: BasicController, scale?: number, newRect?: Rect): string {
        const rect1 = { ...DEFAULT_RECT, ...widget.rect, ...newRect } // really gotta have a rect at this point
        const inline =
            `${widget.getCSSforRect(rect1)};
                    transform: scale( ${scale || widget.scale} );
                    background: ${widget.background};
                    z-index: ${widget.layer || 0};
                  `
        return inline
    }
}
/**
 * __BasicController__
 *
 * Base controller class implementing widget agnostic events, value methods, state
 */
export class BasicController extends PrecisController {
    currentValue = $state<number>(0);
    taper: Taper = { min: 0, max: 1, fineStep: 0.01 }
    id = $state<string>('widget.0')

    constructor() {
        super()
    }
    /**
     * Add that widget to the widget registry store
     * then render its container element
     * @param widget
     */
    static initialise(widget: BasicController) {
        PrecisController.addSelfToRegistry(widget)
        widget.containerTransform(widget)
    }

    static dispatchOutput(widget: BasicController): void {
        PrecisUI.dispatch('output', {
            value: widget.getMappedValue(),
            id: widget.id,
            widget: widget || undefined
        })
    }

    /**
     * The main value computing functions
     * Overrides for buttons/selectors that won't require
     * fine value updates
     */
    getMappedValue(): number {
        return remap( {
            n: this.getNormValue(), 
            start1: 0, 
            stop1: 1, 
            start2: this.taper.min, 
            stop2: this.taper.max
        } )
    }
    getNormValue(): number {
        return (this.currentValue / this.height)
    }

    /**
     * returns a nicely formatted string for displaying the widgets' values
     */
    getRoundedReadout(): RoundedReadout {
        return roundTo(this.getMappedValue(), this.precis ? 1.0e-4 : 1.0e-2)
            .toFixed(this.precis ? 3 : 1);
    };

    /**
     * First layer of methods for widget interaction, called from Svelte on: directives
     * Mouse Down will subscribe listeners through the addListeners interface
     * @param event
     * @param caller
     */
    componentMouseDown(event: Event, caller: BasicController): void {
        if (!event.target) return
        // console.info('Element belongs to ⇢ ' + caller.id)
        const mode = (event.type)
        caller.stateFlags = {
            changing: true,
            precis: (mode === 'contextmenu'),
            focussed: true
        }
        caller.selected = event.target as HTMLElement
        addListeners(caller.selected, caller)
    }
    componentMouseLeave(event: MouseEvent, caller: BasicController) {
        //  console.log( 'Mouse leaves -> '+ caller.id)
        if (caller.changing) return
        caller.focussed = false
    }

    componentMouseEnter(event: Event, caller: BasicController): void {
        caller.selected = event.target as HTMLElement
        caller.selected.focus()
        caller.focussed = true
    }

}

/**
 * ▽ ▽ *Widget Classes* ▽ ▽
 *
 *
 * __RADIAL aka Dial__
 *
 * Specialisations:
 *
 ⦿ 2D radial geometry calculations
 */
export class Radial extends BasicController {
    background = C.dim
    pointer = true
    tickMarks = true
    id: DialTag = 'dial.0'
    radialPoints: PointsArray = $state< PointsArray >( [] );

    constructor(initialSettings: any) {
        super();
        Object.assign(this, initialSettings)  // don't do this lazy move on a server, very insecure!
        console.log('Constructed -> ' + this.id)
    }
    spinPointer() {
        this.radialPoints = radialPoints(this.getRadialTrack(), 50, 50, 10, 55, 20)
        return this.radialPoints
    }
    getRadialTrack(): number {
        return ( this.getNormValue() * 270 ) + 230
    }
}

/**
 * __FADER aka Slider__
 *
 */
export class Fader extends BasicController {
    background = C.dim
    id: FaderTag = 'fader.0'


    constructor(initialSettings: any) {
        super();
        Object.assign(this, initialSettings) 
        console.log('Constructed -> ' + this.id)
    }
}
/**
 * __TOGGLE aka Button__
 *
 * Specialisations:
 *
 ⦿ Boolean state management
 *
 ⦿ MouseDown override
 *
 ⦿ Min or Max value return
 */
export class Toggle extends BasicController {
    background = C.clear
    id: ToggleTag = 'toggle.0'
    private _state: number | boolean = 0
    constructor(initialSettings: any) {
        super();
        Object.assign(this, initialSettings)  // don't do this lazy move on a server, very insecure!
        console.log('Constructed -> ' + this.id)
    }

    componentMouseDown(event: Event, caller: BasicController): void {
        if (!event.target) return
        caller.stateFlags = {
            changing: true,
            precis: false,
            focussed: true
        }
        caller.currentValue = this.changeState() as number
        caller.selected = event.target as HTMLElement
        BasicController.dispatchOutput(caller)
    }
    getMappedValue(): number {
        return Math.round(((this.state as number | 1) * this.taper.max) + this.taper.min);
    }
    changeState(): number | boolean {
        this._state = asLogicValue(this._state, false)
        return this._state
    }
    get state(): number | boolean {
        return this._state;
    }
}

