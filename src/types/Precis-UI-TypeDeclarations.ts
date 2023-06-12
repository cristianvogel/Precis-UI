 /**
  *  Precis-UI © Cristian Vogel 2022
  *  No unauthorised use or derivatives!
  *  @neverenginelabs
  */

import type {BasicController} from "../lib/PrecisControllers";

/**
 * __Widget Specific__
 *
 * Annotations for specialised widget features
 */
export type TickMark = { x1:number, y1:number, x2:number, y2:number}

/**
 * __Data Structures__
 *
 *
 */
export type Point = { x: number, y: number}
export type PointsArray = Array<Point>
export type WidgetWithKey = { id:string, widget:BasicController, event?:Event}
export type PositiveNumber = number

/**
 * __Widget agnostic type defs__
 *
 * Most widget types will work with these Types
 */
export type RoundedReadout = string
export type BoundingRectCSS = `top:${number}px;left:${number}px;width:${number}px;height:${number}px;`
export type Output = number | boolean | string
export type StateFlags = {
    precis: boolean, focussed: boolean, changing: boolean
}

/**
 * __Tags__
 *
 * Try to enforce a simple widget tagging schema, used for ID and separation of instances
 */

export type FaderTag = `fader.${number}` | ''
export type DialTag = `dial.${number}` | ''
export type ToggleTag = `toggle.${number}` | ''

/**
 * __Rect__
 *
 * Essential for layout and value computation.
 * Interface annotates the positioning rect of a widget element.
 *
 * 👀 __height__ MUST be a non-zero positive as it is used
 * to calculate the emitted values
 */
export interface Rect {
    x: number,
    y: number,
    width?: number,
    height?: PositiveNumber
}

/**
 * __Taper__
 *
 * Type represents the minium and maxium of a widget and its fine step
 * which is a factor that will be used in _Precision_ mode
 */
export interface Taper {
    min: number,
    max: PositiveNumber,
    fineStep: PositiveNumber,
    grid?: number
}

// Colours
// todo: improve color palette stuff
type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HEX = `#${string}`
export enum Palette {
    clear = 'transparent',
    black = 'black',
    sky = 'skyblue',
    cyan = 'cyan',
    aquaLight = 'aqua',
    red = 'mediumvioletred',
    blanco = 'white',
    silver = 'silver',
    pink = 'hotpink',
    offWhite = 'antiquewhite',
    dim = 'darkgrey',
    aquaDark = 'darkturquoise',
    pinkDark = 'deeppink',
    whiteBis = 'ghostwhite',
    frenchSilver = 'gainsboro',
    slate = 'slategray',
    tan = 'tan',
    deepBlue = 'midnightblue'
}
export type Tint = RGB | Palette | RGBA | HEX
