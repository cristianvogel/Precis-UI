
import {clamp, remap} from "./utils";
import {PointerPlotStore, WidgetStore} from '../components/stores.js'
import {removeListeners} from "./Listeners";
import {get} from "svelte/store";
import type {BasicController} from "./PrecisController";

export function handleModifier(event: KeyboardEvent): void {
}

export function handleMouseMove(event:MouseEvent, widget:BasicController): void {

    update( widget, widget.id)

    function update(_control, _controlID) {
        if (!_control.changing || !_control.focussed) {
            return
        }
        console.log(`◎ [${_controlID}] is changing ▹ ${_control.focussed}`)
        _control.clientRect = (_control.selected as Element).getBoundingClientRect()
        const dy = event.movementY
        if (dy === 0) {
            return
        }
        const {height, taper, precis} = _control

        if (precis) {
            _control.currentValue =
                clamp(_control.currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
        } else {
            _control.currentValue =
                clamp(_control.currentValue + (-dy * (remap(_control.getNormValue(), 0, 1, 1, 0.25))), [0, height])
        }
        _control.dispatchOutput( _control.getMappedValue(), _controlID)
    }
}


export function handleMouseUp(event: MouseEvent, widget: BasicController):void {

    if (!widget) return
    removeListeners(widget.selected, widget)
    update( widget, widget.id)

    function update(_control, _controlID) {
        _control.changing = false
        _control.precis = false
        _control.selected.blur()
        _control.dispatchOutput( _control.getMappedValue(), _controlID)
    }
}
