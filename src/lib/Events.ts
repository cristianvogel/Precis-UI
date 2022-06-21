import  {WidgetType} from "../types/precisUI";

export function addListenersFor( control:any, widget?:WidgetType ) {
    console.log(`Adding listeners for ${control.id}: ${WidgetType[widget as number]}`)

    addMouseListeners(control)
    addKeyListeners(control)
 }

export function removeListenersFor( control:any, widget?:WidgetType ) {
    console.log(`Removing listeners for : ${widget}`)
    removeMouseListeners(control)
    removeKeyListeners(control)
}

 function addMouseListeners( control:any ) {
     addEventListener('mousemove', control.handleMouseMove)
     addEventListener('mouseup', control.handleMouseUp)
}

 function removeMouseListeners(control:any) {
     removeEventListener('mousemove', control.handleMouseMove)
     removeEventListener('mouseup', control.handleMouseUp)
}

 function addKeyListeners( control:any ) {
     addEventListener('keydown', control.handleModifier)
     addEventListener('keyup', control.handleModifier)
}

 function removeKeyListeners(control:any) {
      removeEventListener('keydown', control.handleModifier)
      removeEventListener('keyup', control.handleModifier)
}
