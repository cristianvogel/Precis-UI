import type {WidgetType} from "./PrecisController";
import type {PrecisControl} from "./PrecisController";

export function addListeners(control:PrecisControl) {
    addMouseListeners(control)
    addKeyListeners(control)
}

export function removeListeners(control:PrecisControl) {
    removeMouseListeners(control)
    removeKeyListeners(control)
}

function addMouseListeners( control:PrecisControl ) {
    addEventListener('mousemove', control.handleMouseMove)
    addEventListener('mouseup', control.handleMouseUp)
}

function removeMouseListeners(control:PrecisControl) {
    removeEventListener('mousemove', control.handleMouseMove)
    removeEventListener('mouseup', control.handleMouseUp)
}

function addKeyListeners( control:PrecisControl ) {
    addEventListener('keydown', control.handleModifier)
    addEventListener('keyup', control.handleModifier)
}

function removeKeyListeners(control:PrecisControl) {
    removeEventListener('keydown', control.handleModifier)
    removeEventListener('keyup', control.handleModifier)
}
