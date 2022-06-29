
import {handleModifier, handleMouseMove, handleMouseUp} from "./Events";

export function addListeners(element:HTMLElement | null) {
    if (!element) return
    console.log('adding listeners...' + element.id)
    addMouseListeners(element)
    addKeyListeners(element)
}

export function removeListeners(element:HTMLElement | null) {
    if (!element) return
    console.log('removing listeners...' + element.id)
    removeMouseListeners(element)
    removeKeyListeners(element)
}

function addMouseListeners( element:HTMLElement ) {
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseup', handleMouseUp)
}

function removeMouseListeners(element:HTMLElement ) {
    if (!element) return
    element.removeEventListener('mousemove', handleMouseMove)
    element.removeEventListener('mouseup', handleMouseUp)
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
