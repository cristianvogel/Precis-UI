// Precision Audio UI © Cristian Vogel 2022
// No unauthorised use or derivatives!
// @neverenginelabs

/**
 * Declares and implements the Base Classes for all controller types
 */
import {asLogicValue, radialPoints, remap, roundTo, toNumber} from './Utils';
import {createEventDispatcher} from "svelte";
import {addListeners} from "./Listeners";
import {WidgetStore} from "../stores/stores";
import {get} from "svelte/store";
import type {
    PointsArray,
    RoundedReadout,
    BoundingRectCSS,
    DialTag,
    FaderTag,
    Output,
    Rect,
    StateFlags,
    Taper,
    Tint,
    ToggleTag
} from '../types/Precis-UI-TypeDeclarations';
import {Palette as C} from "../types/Precis-UI-TypeDeclarations";


abstract class PrecisController {

    protected dispatch
    selected: (HTMLElement | null) = null
    // clientRect: DOMRect;
    // boundingRectCSS: BoundingRectCSS
    rect: Rect
    rx: number
    scale: number
    label: string
    background: Tint
    protected _stateFlags: StateFlags = {precis: false, focussed: false, changing: false}

    protected constructor() {
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
        //console.log( 'dispatching '+value+' from -> ' + id)
        this.dispatch('output', {
            value,
            id,
        })
    }
    getCSSforRect(): BoundingRectCSS {
        const aRect: BoundingRectCSS =
            `top:${this.rect.y}px;left:${this.rect.x}px;width:${this.rect.width}px;height:${this.rect.height}px;`
        return aRect
    }
    resizeElementByID(elementID:string, scale: number): void {
        const el = document.getElementById(`${elementID}`)
        if (!el) return
        const newStyle = `transform: scale(${scale});`
        el.setAttribute('style', el.getAttribute('style') + newStyle)
    }
    /**
     * add self to a layout group registry
     * @param widget
     */
    static addSelfToRegistry( widget: BasicController ): void {
        if (!widget) return
        get(WidgetStore).set(widget.id, widget)
    }
    /**
     * CSS transform which renders the widget's container element
     * todo: narrow down return type
     * @param widget
     * @param scale
     */

    // todo: I don't think this should be static, messing up the drawing when Default.DIAL_SQUARE is not 100
    static containerTransform(widget:BasicController, scale?:number):string {
        const inline = widget ?
            `${widget.getCSSforRect()};
                  transform: scale(${ scale || widget.scale});
                  background: ${widget.background};`
            : ''
        return inline
    }
}

export class BasicController extends PrecisController {
    currentValue: number;
    taper: Taper
    id: string
    selfy:any

    constructor() {
        super()
    }
    static initialise(widget: BasicController){
        BasicController.addSelfToRegistry(widget)
        BasicController.containerTransform(widget)
    }
    getMappedValue(): number {
        return remap(this.getNormValue(), 0, 1, this.taper.min, this.taper.max)
    }
    getNormValue(): number {
        return (this.currentValue / this.height)
    }
    getRoundedReadout():RoundedReadout {
        return roundTo(this.getMappedValue(), this.precis ? 1.0e-4 : 1.0e-2)
            .toFixed(this.precis ? 3 : 1);
    };
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
    set state(value: number|boolean) {
        this._state = value;
    }
}

