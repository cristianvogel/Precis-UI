// Precis.ui

// Defs

export enum DefaultRectFader {
    X = '50%',
    Y = '50%',
    WIDTH = 8,
    HEIGHT = 200,
    RX = 2.75
}
export enum DefaultRectDial {
    X = '50%',
    Y = '50%',
    WIDTH = 100,
    HEIGHT = 100,
    RX = 2.75,
    SCALE = 0.75
}

export enum DefaultTaper {
    MIN,
    MAX,
    FINE = 1.0e-2
}

export type BoundingClientRec =
            `top:${number}px;
			left:${number}px;
			width:${number}px;
			height:${number}px;`

// Colours
type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HEX = `#${string}`
export enum C {
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
    slate= 'slategray',
    tan = 'tan',
    deepBlue = 'midnightblue'
} //todo: improve color palette stuff
export type Tint = RGB | C | RGBA | HEX


// Common Geometry
export interface Rect {
    x: number | DefaultRectFader.X | DefaultRectDial.X,
    y: number | DefaultRectFader.Y |  DefaultRectDial.Y,
    width: number | DefaultRectFader.WIDTH |  DefaultRectDial.WIDTH,
    height: number | DefaultRectFader.HEIGHT |  DefaultRectDial.HEIGHT,
}

export type Taper = {
    min: number,
    max: number,
    fineStep: number,
    curve: 'LINEAR' | 'NONLINEAR' //todo: implement NONLINEAR
}

interface BaseControl {
    currentValue: number,
    rect: Rect,
    rx: number,
    taper: Taper,
    changing?: boolean,
    precis?: boolean,
    x: number,
    y: number,
    background?: Tint
    readonly boundingBoxCSS: BoundingClientRec,
    readonly mappedValue: number,
    readonly normValue:  number,
    readonly index: number
}
// Widget specific
export interface Fader extends BaseControl {
    id: FaderTag,
    width: number,
    height: number,
    label?: string,
}

export interface Dial extends BaseControl  {
    id: DialTag,
    scale: number,
    width: number,
    height: number,
    label?: string,
    readonly radialTrack: number,
}
// Data structures
type Point = { x: number, y: number}
export type PointsArray = Array<Point>

// Naming Dependencies
export type FaderTag = `fader.${number | string}`
export type DialTag = `dial.${number | string}`
