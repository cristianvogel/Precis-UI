import type {CommonSettings, DialTag, StateFlags} from "./PrecisController";


export interface RadialSettings extends CommonSettings {
    id: DialTag,
    tickMarks: boolean,
    pointer: boolean,
    stateFlags: StateFlags
}

