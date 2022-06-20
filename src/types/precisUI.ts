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
export type ControlRect = {
    x: number | typeof DefaultRectFader.X | typeof DefaultRectDial.X,
    y: number | typeof DefaultRectFader.Y | typeof DefaultRectDial.Y,
    width: number | typeof DefaultRectFader.WIDTH | typeof DefaultRectDial.WIDTH,
    height: number | typeof DefaultRectFader.HEIGHT | typeof DefaultRectDial.HEIGHT,
    w?: number | typeof DefaultRectFader.WIDTH | typeof DefaultRectDial.WIDTH,
    h?: number | typeof DefaultRectFader.HEIGHT | typeof DefaultRectDial.HEIGHT,
}

export type Taper = {
    min: number,
    max: number,
    fineStep: number,
    curve: 'LINEAR' | 'NONLINEAR' //todo: implement NONLINEAR
}

// Widget specific
export type Fader = {
    currentValue: number,
    id: string | number,
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    geometry?: ControlRect,
    label?: string,
    taper?: Taper,
    rect?: ControlRect,
    background?: Tint;
    changing?: boolean;
    precis?: boolean;
    readonly clientRect: BoundingClientRec;
    readonly mappedValue: number,
    readonly normValue:  number;
    readonly h: number;
    readonly w: number;
    readonly index: number
}

export type Dial = {
    currentValue: number,
    id: string | number,
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    geometry?: ControlRect,
    label?: string,
    taper?: Taper,
    rect?: ControlRect,
    background?: Tint;
    changing?: boolean;
    precis?: boolean;
    readonly mappedValue: number,
    readonly radialTrack: number,
    readonly clientRect: BoundingClientRec;
    readonly normValue:  number;
    readonly h: number;
    readonly w: number;
    readonly index: number
}
// Data structures
type Point = { x: number, y: number}
export type PointsArray = Array<Point>

// Naming Dependencies
export type FaderTag = `fader.${number | string}`
export type DialTag = `dial.${number | string}`
