/**
 *  Precis-UI © Cristian Vogel 2022
 *  No unauthorised use or derivatives!
 *  @neverenginelabs
 *
 * __PrecisControllers__
 *
 * Annotates and implements Base classes and all derived controller classes
 */
import {asLogicValue, radialPoints, remap, roundTo, toNumber} from './Utils';
import {createEventDispatcher} from "svelte";
import {addListeners} from "./Listeners";
import {WidgetRegister, WidgetStore} from '../stores/stores';
import {get} from "svelte/store";
import type {PointsArray, RoundedReadout, BoundingRectCSS, DialTag, FaderTag, Output, Rect, StateFlags, Taper, Tint, ToggleTag} from '../types/Precis-UI-TypeDeclarations';
import {Palette as C} from "../types/Precis-UI-TypeDeclarations";
import {Default, DEFAULT_RECT} from '../components/Precis-UI-Defaults';

/**
 * __Precis UI__
 *
 * Base class. For layout and global specifications.
 */
abstract class PrecisUI {
    static getRegistry():WidgetRegister { return get(WidgetStore) }
}

abstract class PrecisController extends PrecisUI{

    protected dispatch
    selected: (HTMLElement | null) = null
    rect: Rect
    rx: number
    scale: number
    label: string
    background: Tint
    layer:number
    private _registryIndex: number

    protected _stateFlags: StateFlags = {precis: false, focussed: false, changing: false}

    protected constructor() {
        super();
        this.dispatch = createEventDispatcher()
    }

    abstract getNormValue():number
    abstract getMappedValue():number
    abstract getRoundedReadout():RoundedReadout
    abstract componentMouseDown(event: MouseEvent, caller: BasicController): void
    abstract componentMouseEnter(event: MouseEvent, caller:BasicController):void
    abstract componentMouseLeave(event: MouseEvent, caller: BasicController):void

    set stateFlags(settings: StateFlags) {
        this._stateFlags = {...settings};
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
        return this.rect.width
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
    dispatchOutput(id: string, value: Output,): void {
        //console.log( 'dispatching '+value+' from -> ' + id)
        this.dispatch('output', {
            value,
            id,
        })
    }
    getCSSforRect(xywh:Rect): BoundingRectCSS {
        const aRect: BoundingRectCSS =
            `top:${xywh.y}px;left:${xywh.x}px;width:${xywh.width}px;height:${xywh.height}px;`
        return aRect
    }
    /**
     * add self to a layout group registry
     * @param widget
     */
    static addSelfToRegistry( widget: BasicController ): void {
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
    containerTransform(widget:BasicController, scale?:number, newRect?:Rect):string {
        const rect1 = {...DEFAULT_RECT, ...widget.rect, ...newRect} // really gotta have a rect at this point
        const inline =
                    `${widget.getCSSforRect(rect1)};
                    transform: scale( ${ scale || widget.scale} );
                    background: ${widget.background};
                    z-index: ${widget.layer || 0 };
                  `
        return inline
    }
}
/**
 * __BasicController__
 *
 * Base controller class implementing widget agnostic methods and state
 */
export class BasicController extends PrecisController {
    currentValue: number;
    taper: Taper
    id: string

    constructor() {
        super()
    }
    /**
     * Add that widget to the widget registry store
     * then render its container element
     * @param widget
     */
    static initialise(widget: BasicController){
        BasicController.addSelfToRegistry(widget)
        widget.containerTransform(widget)
    }

    /**
     * The main value computing functions
     * Override for buttons and selectors that don't require
     * fine value updates
     */
    getMappedValue(): number {
        return remap(this.getNormValue(), 0, 1, this.taper.min, this.taper.max)
    }
    getNormValue(): number {
        return (this.currentValue / this.height)
    }

    /**
     * returns a nicely formatted string for displaying the widgets' values
     */
    getRoundedReadout():RoundedReadout {
        return roundTo(this.getMappedValue(), this.precis ? 1.0e-4 : 1.0e-2)
            .toFixed(this.precis ? 3 : 1);
    };

    /**
     * First layer of methods for widget interaction, called from Svelte on: directives
     * Mouse Down will subscribe listeners through the addListeners interface
     * @param event
     * @param caller
     */
    componentMouseDown(event: MouseEvent, caller:BasicController): void {
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
    componentMouseLeave(event: MouseEvent, caller:BasicController) {
      //  console.log( 'Mouse leaves -> '+ caller.id)
        if (caller.changing) return
        caller.focussed = false
    }
    componentMouseEnter(event: MouseEvent, caller:BasicController) {
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

/**
 * __FADER aka Slider__
 *
 */
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
/**
 * __TOGGLE aka Button__
 *
 * Specialisations:
 *
 ⦿ Boolean state management
 *
 ⦿ Min or Max value return
 */
export class Toggle extends BasicController {
    background = C.clear
    id:ToggleTag = 'toggle.0'
    private _state:number|boolean = 0
    constructor(initialSettings) {
        super();
        Object.assign(this, initialSettings)  // don't do this lazy move on a server, very insecure!
        super.id = this.id
        console.log('Constructed -> ' + this.id)
    }
    componentMouseDown(event: MouseEvent, caller:BasicController): void{
        if (!event.target) return
        caller.stateFlags = {
            changing: true,
            precis: false,
            focussed: true
        }
        caller.currentValue = this.changeState() as number
        caller.selected = event.target as HTMLElement
        super.dispatchOutput(this.id, this.getMappedValue())
    }
    getMappedValue(): number {
        return Math.round(((this.state as number | 1) * this.taper.max) + this.taper.min);
    }
    changeState():number|boolean {
        this._state = asLogicValue(this._state, 'not')
        return this._state
    }
    get state(): number|boolean {
        return this._state;
    }
}

