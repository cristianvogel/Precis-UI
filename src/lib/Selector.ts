import {createEventDispatcher} from "svelte";
import {
    BoundingRectCSS, CommonSettings,
    Output,
    PrecisControl,
    SelectorTag,
    SharedMethods,
    SharedSettings,
    StateFlags
} from "./PrecisController";

type SelectorChoices = Set<{ label: string | number, value: any }>

export interface SelectorSettings extends CommonSettings {
    id: SelectorTag,
    choices: SelectorChoices,
}

export class Selector extends PrecisControl implements SharedMethods {

    dispatch: any
    settings: SelectorSettings

    constructor(withSettings: SelectorSettings) {
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
