// Precision Audio UI © Cristian Vogel 2022
// No unauthorised use or derivatives!
// @neverenginelabs

import type {BasicController} from "../lib/PrecisControllers";

export type TickMark = { x1:number, y1:number, x2:number, y2:number}
export type RoundedReadout = string

// Data structures
export type Point = { x: number, y: number}
export type PointsArray = Array<Point>
export type WidgetWithKey = { id:string, widget:BasicController, event?:Event}
export type PositiveNumber = number


// Widget agnostic types
export type BoundingRectCSS = `top:${number}px;left:${number}px;width:${number}px;height:${number}px;`
export type Output = number | boolean | string
export type StateFlags = {
    precis: boolean, focussed: boolean, changing: boolean
}
// Name Rules
export type FaderTag = `fader.${number}` | ''
export type DialTag = `dial.${number}` | ''
export type ToggleTag = `toggle.${number}` | ''

// Shared Geometry
export interface Rect {
    x: number,
    y: number,
    width: number,
    height: PositiveNumber
}
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
