// Precis.ui

// Defs
export enum DefaultStyles {

}

export enum DefaultRect {
    X = '50%',
    Y = '50%',
    WIDTH = 8,
    HEIGHT = 200,
    RX = 2.75
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
export enum PALETTE {
    clear = 'transparent',
    black = 'black',
    sky = 'skyblue',
    cyan = 'cyan',
    aquaLight = 'aqua',
    aquaVivid = 'aquamarine',
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
}
export type Tint = RGB | PALETTE | RGBA | HEX
export type FillGradient = {
    LOW: Tint,
    MID: Tint,
    HIGH: Tint
}

// Geometry
export type FaderGeometry = {
    x: number | typeof DefaultRect.X,
    y: number | typeof DefaultRect.Y,
    width: number | typeof DefaultRect.WIDTH,
    height: number | typeof DefaultRect.HEIGHT,
    w?: number,
    h?: number
}

export type FaderTaper = {
    min: number,
    max: number,
    fineStep: number,
    curve: 'LINEAR' | 'NONLINEAR'
}

export type Fader = {
    id: string | number,
    currentValue: number,
    x: number,
    y: number,
    width: number,
    height: number,
    rx: number,
    geometry?: FaderGeometry,
    label?: string,
    taper?: FaderTaper,
    rect?: FaderGeometry,
    bg?: Tint;
    changing?: boolean;
    precis?: boolean;
    readonly clientRect: BoundingClientRec;
    readonly normValue:  number;
    readonly h: number;
    readonly w: number
}

//Data

export type FaderTag = `fader.${number | string}`
