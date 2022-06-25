import type {CommonSettings, DialTag} from "./PrecisController";


export interface RadialSettings extends CommonSettings {
    id: DialTag,
    tickMarks: boolean,
    pointer: boolean
}
