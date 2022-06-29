
import {clamp, remap} from "./utils";
import { widgetStore } from '../components/stores.js'
import {removeListeners} from "./Listeners";
import {get} from "svelte/store";

export function handleModifier(event: KeyboardEvent): void {
}

export function handleMouseMove(event: MouseEvent): void {
    get(widgetStore).forEach( update ) // retrieve the store which is a Map, then update all the widgets in there

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
        // @ts-ignore
        // do I need to now update the widget in the widget store? - not sure if is passed by reference...
        get(widgetStore).set( _controlID, _control)
    }
}


export function handleMouseUp(event:MouseEvent):void {
    get(widgetStore).forEach( update )

    function update(_control, _controlID) {
        removeListeners(_control.selected as HTMLElement | null)
      //  _control.dispatchOutput( _control.getMappedValue(), _controlID)
        _control.changing = false
        _control.precis = false
        get(widgetStore).set( _controlID, _control)
    }
}
