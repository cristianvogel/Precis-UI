// Precis.ui

// Geometry Defs
export enum Default {
    EMPTY,
    SCALE,
    X = '50%',
    Y = '50%',
    FADER_WIDTH = 11,
    FADER_HEIGHT = 200,
    DIAL_SQUARE = 100,
    RX = 2.75,
    DIAL_SCALE_FACTOR = 0.75,
    FADER_SCALE_FACTOR = 1.25,
    DIAL_TICKMARKS_COUNT=11,
    DIAL_TICKMARKS_RADIAL_OFFSET=135,
    DIAL_TICKMARKS_rMIN= -5,
    DIAL_TICKMARKS_rMAX= 1,
    DIAL_BACKGROUND= 'grey',
}

export enum DefaultTaper {
    MIN,
    MAX,
    FINE = 1.0e-2
}

export type TickMark = { x1:number, y1:number, x2:number, y2:number}
export type BoundingRectCSS =
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


// Shared Geometry
export interface Rect {
    x: number | Default.X ,
    y: number | Default.Y ,
    width: number | Default.FADER_WIDTH | Default.DIAL_SQUARE ,
    height: number | Default.FADER_WIDTH | Default.DIAL_SQUARE ,
}

export type Taper = {
    min: number,
    max: number,
    fineStep: number,
    curve: 'LINEAR' | 'NONLINEAR' //todo: implement NONLINEAR
}


// Controllers
export enum WidgetType {
    DIAL,
    FADER
}

interface UserActions  {

    handleMouseDown(arg0:MouseEvent):void,
    handleMouseMove(arg:MouseEvent):void,
    handleMouseUp():void,
    handleModifier(arg:KeyboardEvent):void
}

interface BaseControl extends UserActions{
    currentValue: number,
    rect: Rect,
    scale: number,
    rx: number,
    taper: Taper,
    changing: boolean,
    precis: boolean,
    x: number,
    y: number,
    background?: string | Tint,
    draw?: ()=>void,
    rescale?: (arg: number)=>void,
    readonly boundingBoxCSS: BoundingRectCSS,
    readonly mappedValue: number,
    readonly normValue:  number,
    readonly index: number,
}

// Widget specific
export interface Fader extends BaseControl  {
    id: FaderTag,
    width: number,
    height: number,
    label?: string,
}

export interface Dial extends BaseControl  {
    id: DialTag,
    width: number,
    height: number,
    label?: string,
    readonly radialTrack: number,
}

// Naming Dependencies
export type FaderTag = `fader.${number | string}`
export type DialTag = `dial.${number | string}`

// Data structures
type Point = { x: number, y: number}
export type PointsArray = Array<Point>
