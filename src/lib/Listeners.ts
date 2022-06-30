
import {handleModifier, handleMouseMove, handleMouseUp} from "./Events";
import type {BasicController} from "./PrecisController";

export function addListeners(element:HTMLElement | null, widget:BasicController) {
    if (!element) return
    console.log('adding listeners...' + element.id)
    addMouseListeners(element, widget)
    addKeyListeners(element)
}

export function removeListeners(element:HTMLElement | null, widget:BasicController) {
    if (!element) return
    console.log('removing listeners...' + element.id)
    removeMouseListeners(element, widget)
    removeKeyListeners(element)
}

function addMouseListeners( element:HTMLElement, widget:BasicController ) {
    element.addEventListener('mousemove', (ev)=>handleMouseMove(ev, widget))
    element.addEventListener('mouseup', (ev)=>handleMouseUp(ev,widget))
}

function removeMouseListeners(element: HTMLElement, widget: BasicController) {
    if (!element) return
    element.removeEventListener('mousemove', (ev)=>handleMouseMove(ev, widget))
    element.removeEventListener('mouseup', (ev)=>handleMouseUp(ev,widget))
}

function addKeyListeners( element:HTMLElement ) {
    if (!element) return
    element.addEventListener('keydown', handleModifier)
    element.addEventListener('keyup', handleModifier)
}

function removeKeyListeners(element:HTMLElement ) {
    if (!element) return
    element.removeEventListener('keydown', handleModifier)
    element.removeEventListener('keyup', handleModifier)
}
