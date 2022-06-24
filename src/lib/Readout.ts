import {createEventDispatcher} from "svelte";
import {
    BoundingRectCSS,
    Output,
    PrecisControl,
    SharedMethods, SharedSettings,
    StateFlags
} from "./PrecisController";


export interface ReadoutSettings extends SharedSettings {
    // todo: interface for readout widgets
}

export class Readout extends PrecisControl implements SharedMethods {

    dispatch: any
    settings: ReadoutSettings

    constructor(withSettings: ReadoutSettings) {
        super()
        this.dispatch = createEventDispatcher()
        this.settings = withSettings
    }

    handleMouseMove(event: MouseEvent) {
        //
    }

    dispatchOutput(value: Output, id: string): void {
        this.dispatch('output', {
            value,
            id,
        })
    }

    resize(scale: number): void {
    }
}
