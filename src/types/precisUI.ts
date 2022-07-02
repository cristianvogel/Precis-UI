// Precision Audio UI © Cristian Vogel 2022
// No unauthorised use or derivatives!
// @neverenginelabs

// Geometry Defs
import type {BasicController} from "../lib/PrecisControllers";

export enum Default {
    EMPTY,
    SCALE,
    X = 150,
    Y = 150,
    FADER_WIDTH = 25,
    FADER_HEIGHT = 300,
    DIAL_SQUARE = 100,
    RX = 2.75,
    DIAL_SCALE_FACTOR = 1,
    FADER_SCALE_FACTOR = 1,
    DIAL_TICKMARKS_COUNT=11, // best to keep this at 11
    DIAL_TICKMARKS_RADIAL_OFFSET = 135,
    DIAL_TICKMARKS_rMIN = -5,
    DIAL_TICKMARKS_rMAX = 1,
    DIAL_BACKGROUND = 'grey',
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

// Data structures
export type Point = { x: number, y: number}
export type PointsArray = Array<Point>
export type WidgetWithKey = { id:string, widget:BasicController, event?:Event}
