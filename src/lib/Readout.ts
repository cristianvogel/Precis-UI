import {createEventDispatcher} from "svelte";
import {
    BoundingRectCSS, CommonSettings,
    Output,
    PrecisControl,
    SharedMethods, SharedSettings,
    StateFlags
} from "./PrecisController";


export interface ReadoutSettings extends CommonSettings {
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

    dispatchOutput(id: string, value: Output ): void {
        this.dispatch('output', {
            value,
            id,
        })
    }

    resize(scale: number): void {
    }
}
