
import {handleModifier, handleMouseDrag, handleMouseDragEnd} from "./Events";
import type {BasicController} from "./PrecisController";
import {MouseLocationStore} from "../components/stores";
import {get} from "svelte/store";

let _widget:BasicController
const drag = (ev:MouseEvent)=>{
    handleMouseDrag(ev, _widget)
}
const release = (ev:MouseEvent)=> {
    document.exitPointerLock();
    handleMouseDragEnd(ev, _widget)
}

export function addListeners(element:HTMLElement | null, widget:BasicController) {
    if (!element) return
    _widget = widget
    addMouseListeners(element, widget)
    addKeyListeners(element)
}

function addMouseListeners( element:HTMLElement, widget:BasicController ) {
    if (!element) return
    console.log('pointer locking and adding listeners to -> '+ _widget.id)
    element.requestPointerLock();
    document.addEventListener('mousemove', drag )
    document.addEventListener('mouseup', release)
}

function addKeyListeners( element:HTMLElement ) {
    if (!element) return
    element.addEventListener('keydown', handleModifier)
    element.addEventListener('keyup', handleModifier)
}

export function removeListeners(element:HTMLElement | null, widget:BasicController) {
    if (!element) return
    console.log('removing listeners from <- ' + _widget.id)
    removeMouseListeners(element, widget)
    removeKeyListeners(element)
}

function removeMouseListeners(element: HTMLElement, widget: BasicController) {
    if (!element) return
    _widget = widget
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', release)
}

function removeKeyListeners(element:HTMLElement ) {
    if (!element) return
    element.removeEventListener('keydown', handleModifier)
    element.removeEventListener('keyup', handleModifier)
}

