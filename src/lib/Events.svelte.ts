import { clamp, remap } from "./Utils.svelte.js";
import { removeListeners } from "./Listeners.svelte.js";
import { BasicController } from "./PrecisControllers.svelte";
import type { WidgetWithKey } from "../types/Precis-UI-TypeDeclarations.js";

export function handleMouseDrag(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller: WidgetWithKey = { id: widget.id, widget: widget, event: event }
    updatesForMouseDrag(caller)
}

export function handleMouseDragEnd(event: MouseEvent, widget: BasicController): void {
    if (!widget) return
    const caller: WidgetWithKey = { id: widget.id, widget: widget, event: event }
    updatesForMouseDragEnd(caller)
}

export function handleModifier(event: KeyboardEvent): void {
    //todo: implement keyboard shift-key modifier for precise mode
}

/**
 * Mouse and Screen mapped output values are computed here and dispatched as custom events
 * @param caller Object containing references to Widget.id , Widget itself and the trigger event
 */
function updatesForMouseDrag(caller: any) {
    const { id, widget, event } = caller
    if (!widget.changing || !widget.focussed) {
        return
    }
    // console.log(`◎ [${id}] is changing on ▹ ${widget.focussed}`)
    widget.clientRect = (widget.selected as Element).getBoundingClientRect()
    const dy = event.movementY
    if (dy === 0) {
        return
    }
    const { height, taper, precis } = widget

    if (precis) {
        widget.currentValue =
            clamp(widget.currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
    } else {
        widget.currentValue =
            clamp(widget.currentValue +
                (-dy * (remap( { n: widget.getNormValue(), start1: 0, stop1: 1, start2: 1, stop2: 0.25 }))),
                [0, height])

    }
    BasicController.dispatchOutput(widget)
}

function updatesForMouseDragEnd(caller: any) {
    const { id, widget, event } = caller
    if (!widget) return
    widget.changing = false
    widget.precis = false
    BasicController.dispatchOutput(widget)
    widget.selected.blur()
    removeListeners()
}

