
import {clamp, remap} from "./utils";
import {get} from "svelte/store";
import { dialStore } from '../components/stores.js'
import {removeListeners} from "./Listeners";

export function handleModifier(event: KeyboardEvent): void {
}

export function handleMouseMove(event: MouseEvent): void {
    get(dialStore).forEach( update )

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
        const {currentValue, height, taper} = _control
       // console.log(`◎ ${_controlID} mapped value is ${_control.getMappedValue()} `)
        const normValue:number = _control.getNormValue()
        if (_control.precis) {
            _control.currentValue =
                clamp(currentValue + ((dy * dy) * (Math.sign(dy) / -2)) * taper.fineStep, [0, height])
        } else {
            _control.currentValue =
                clamp(currentValue + (-dy * (remap(normValue, 0, 1, 1, 0.25))), [0, height])
        }
        _control.dispatchOutput( _control.getMappedValue(), _controlID)
        get(dialStore).set(_controlID, _control)
    }
}


export function handleMouseUp(event:MouseEvent):void {
    get(dialStore).forEach( update )

    function update(_control, _controlID) {
        removeListeners(_control.selected as HTMLElement | null)
      //  _control.dispatchOutput( _control.getMappedValue(), _controlID)
        _control.changing = false
        _control.precis = false
    }
}
