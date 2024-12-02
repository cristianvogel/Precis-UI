//todo: implement key listeners
import {handleModifier, handleMouseDrag, handleMouseDragEnd} from "./Events.svelte.js";
import type {BasicController} from "./PrecisControllers.svelte.js";
import {ListeningElement, ListeningWidget} from "../stores/stores.js";
import {get} from "svelte/store";


let _widget:BasicController = get(ListeningWidget) // from store
let _element:HTMLElement = get(ListeningElement) // from store

/**
 * addListeners is the entry point for Listener subscribe methods
 * Stores should only get set here once
 * to the incoming HTMLElement and BasicController Object
 * then used for Listener assignment or removal
 * @param element:HTMLElement
 * @param widget:BasicController
 */
export function addListeners(element:HTMLElement | null, widget:BasicController) {
    if (!element || !widget) return
    ListeningWidget.set(widget)
    ListeningElement.set(element)
    _widget = get(ListeningWidget)
    _element = get(ListeningElement)

    addMouseListeners()
    addKeyListeners()
}

export function removeListeners() {
    if (!_element) return
    removeMouseListeners()
    removeKeyListeners()
}

function addMouseListeners() {
    console.log('pointer locking and adding listeners to -> '+ _widget.id)
    _element.requestPointerLock();
    document.addEventListener('mousemove', drag )
    document.addEventListener('mouseup', release)
}

function addKeyListeners() {
    _element.addEventListener('keydown', handleModifier)
    _element.addEventListener('keyup', handleModifier)
}

function removeMouseListeners() {
    console.log('releasing pointer and removing listeners from <- ' + _widget.id)
    document.exitPointerLock();
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', release)
}

function removeKeyListeners() {
    _element.removeEventListener('keydown', handleModifier)
    _element.removeEventListener('keyup', handleModifier)
}

const drag = (ev:MouseEvent)=>{
    handleMouseDrag(ev, _widget)
}
const release = (ev:MouseEvent)=> {
    handleMouseDragEnd(ev, _widget)
}
