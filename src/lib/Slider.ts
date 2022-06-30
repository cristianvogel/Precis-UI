import type {
    CommonSettings,
    Output,
    SharedEventHandlers,
    SharedMethods,
    SharedSettings,
    SliderTag
} from "./PrecisController";
import {createEventDispatcher} from "svelte";
import {PrecisControl} from "./PrecisController";

export interface SliderSettings extends CommonSettings {
    id: SliderTag,
    tickMarks: boolean
}

export class Slider extends PrecisControl implements SharedMethods, SharedEventHandlers {

    dispatch: any
    settings: SliderSettings

    constructor(withSettings: SliderSettings) {
        super()
        this.dispatch = createEventDispatcher()
        this.settings = withSettings
    }

    handleMouseMove(event: MouseEvent) {
        //
    }

    dispatchOutput(id: string, value: Output): void {
        this.dispatch('output', {
            value,
            id,
        })
    }

    resize(scale: number): void {
    }
}
