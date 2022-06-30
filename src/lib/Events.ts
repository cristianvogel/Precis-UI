import {clamp, remap} from "./utils";
import {removeListeners} from "./Listeners";
import type {BasicController} from "./PrecisController";
import type {WidgetWithKey} from "../types/precisUI";
import {get} from "svelte/store";
import {MouseLocationStore} from "../components/stores";

function renderPointerImage(ev) {
  // draw a non-standard pointer
    MouseLocationStore.set( {x: ev.x, y: ev.y} )
}

export function handleMouseDrag(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller: WidgetWithKey = {id: widget.id, widget, event}
    updatesForMouseDrag(caller)
    renderPointerImage(event)
    dispatch(widget.id, widget)
}

function updatesForMouseDrag(caller) {
    const {id, widget, event} = caller
    if (!widget.changing || !widget.focussed) {
        return
    }
    console.log(`◎ [${id}] is changing on ▹ ${widget.focussed}`)
    widget.clientRect = (widget.selected as Element).getBoundingClientRect()
    const dy = event.movementY
    if (dy === 0) {
        return
    }
    const {height, taper, precis} = widget

    if (precis) {
        widget.currentValue =
            clamp(widget.currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
    } else {
        widget.currentValue =
            clamp(widget.currentValue + (-dy * (remap(widget.getNormValue(), 0, 1, 1, 0.25))), [0, height])
    }
    return {id, widget}
}

export function handleMouseDragEnd(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller: WidgetWithKey = {id: widget.id, widget, event}
    updatesForMouseDragEnd(caller)
    dispatch(widget.id, widget)
}

function updatesForMouseDragEnd(caller) {
    const {id, widget, event} = caller
    if (!widget) return
    removeListeners(widget.selected, widget)
    widget.changing = false
    widget.precis = false
    widget.selected.blur()
    widget.dispatchOutput(id, widget.getMappedValue())
}


export function handleModifier(event: KeyboardEvent): void {
    //todo: implement keyboard shift-key modifier for precise mode
}


function dispatch(_controlID: string, _control: BasicController) {
    _control.dispatchOutput(_controlID, _control.getMappedValue())
}
