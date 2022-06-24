import {createEventDispatcher} from "svelte";
import {
    BoundingRectCSS, DialTag,
    Output,
    PrecisControl,
    SharedMethods,
    SharedSettings,
    StateFlags
} from "./PrecisController";

export interface RadialSettings extends SharedSettings {
    id: DialTag,
    tickMarks: boolean,
    pointer: boolean
}

export class Radial extends PrecisControl implements SharedMethods {

    dispatch: any
    settings: RadialSettings
    id:DialTag


    constructor(withSettings: RadialSettings) {
        super()
        this.dispatch = createEventDispatcher()
    }

    radialTrack = () => { return (this.getNormValue() * 270) + 230}

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
