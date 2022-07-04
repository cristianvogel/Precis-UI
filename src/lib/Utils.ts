
import {Default} from "../components/Precis-UI-Defaults";
import type {TickMark, PointsArray} from "../types/Precis-UI-TypeDeclarations";


// Type assert
export function toNumber( value: string|number): number {
    return typeof value !== 'number' ? Number.parseFloat(value) : value;
}

/** radialPoints
 ** Method adapted from iPlug 2 C++ Plug-in Framework
 ** Calculate evenly distributed points on a radial line.
 * @param angleDegrees The angle to draw at in degrees clockwise where 0 is up
 * @param cx centre point x coordinate
 * @param cy centre point y coordinate
 * @param rMin minima of the radial line (distance from cx,cy)
 * @param rMax maxima of the radial line (distance from cx,cy)
 * @param nPoints Number of points between rMin and rMax to obtain
 * @returns Multidimensional array for nPoints pairs of float coordinates for the points */
export function radialPoints(
    angleDegrees,  cx,  cy,  rMin,  rMax,  nPoints ): PointsArray
{
    const  angleRadians = degToRad(angleDegrees - 90)
    const  sinV = Math.sin(angleRadians)
    const  cosV = Math.cos(angleRadians)
    let data:PointsArray = new Array()
    for(let i = 0; i < nPoints; i++)
    {
        const r = rMin+(rMax-rMin) * i / (nPoints-1)
        data.push( {x: cx + (r * cosV), y: cy + (r * sinV)} )
    }
    return data
}

export function radialTickMarkAt( i:number,
                                  steps:number = 11,
                                  offsetDegrees:number = Default.DIAL_TICKMARKS_RADIAL_OFFSET ): TickMark {
        const rx = Default.RADIAL_OVERLAY_rX,
        cx = rx, cy = rx,
        rMin = rx + Default.DIAL_TICKMARKS_rMIN,
        rMax = rx + Default.DIAL_TICKMARKS_rMAX,
        nPoints = 8;

    let rotator = 270 / Math.max(0, steps-1)
    let points:PointsArray = radialPoints((i * rotator) - offsetDegrees, cx,cy,rMin,rMax,nPoints)
    // @ts-ignore
    const x1 = points.at(-1).x
    // @ts-ignore
    const x2 = points.at(3).x
    // @ts-ignore
    const y1 = points.at(-1).y
    // @ts-ignore
    const y2 = points.at(3).y
    return {x1, x2, y1, y2}
}

// Kyma influenced
/**
 * returns 1 or true for any positive input or 0 or false for <= 0
 * @param n
 * @param not optionally return the logical NOT
 * @param bool optionally cast result as boolean
 */
export function asLogicValue( n:number|boolean, not:string = '', bool:boolean = false ):number|boolean
    {   n = typeof n === 'boolean' ? Boolean(n) : n
        const r = n > 0 ? (not ? 0 : 1) : (not ? 1 : 0)
        return (bool ? Boolean(r) : r)
    }

// Thi.ng https://thi.ng/
export const roundTo = (x: number, prec = 1) => Math.round(x / prec) * prec;
export const trunc = (x) => (x < 0 ? Math.ceil(x) : Math.floor(x));
export function lerp(start, stop, amt):number {
    return amt*(stop-start)+start;
};
export function remap(n, start1, stop1, start2, stop2):number {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};
export function degToRad(degrees):number {
    return degrees * (Math.PI / 180);
};
export function clamp(value:number , range = [0,1], round = false):number {
    let res = Math.min(Math.max(value, range[0]), range[1])
    return (round ? Math.round(res) : res);
}

// Ext.js
export const toFixed = function(value:number, precision:number):string {
    precision = precision || 0;
    const pow = Math.pow(10, precision);
    return (Math.round(value * pow) / pow).toFixed(precision);
}
