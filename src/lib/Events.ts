import {clamp, remap} from "./utils";
import {removeListeners} from "./Listeners";
import type {BasicController} from "./PrecisControllers";
import type {WidgetWithKey} from "../types/precisUI";

export function handleMouseDrag(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller: WidgetWithKey = {id: widget.id,  widget: widget, event: event }
    updatesForMouseDrag(caller)
}

export function handleMouseDragEnd(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller:WidgetWithKey = {id: widget.id, widget: widget, event: event }
    updatesForMouseDragEnd(caller)
}

export function handleModifier(event: KeyboardEvent): void {
    //todo: implement keyboard shift-key modifier for precise mode
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
    widget.dispatchOutput(id, widget.getMappedValue())
}

function updatesForMouseDragEnd(caller) {
    const {id, widget, event} = caller
    if (!widget) return
    widget.changing = false
    widget.precis = false
    widget.dispatchOutput(id, widget.getMappedValue())
    widget.selected.blur()
    removeListeners()
}

