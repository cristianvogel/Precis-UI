import type {PointsArray, TickMark} from "../types/precisUI";
import {Default} from "../types/precisUI";

export function clamp(value:number , range = [0,1]):number {
    return Math.min(Math.max(value, range[0]), range[1]);
}

export function lerp(start, stop, amt):number {
    return amt*(stop-start)+start;
};

export function remap(n, start1, stop1, start2, stop2):number {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

export function degToRad(degrees):number {
    return degrees * (Math.PI / 180);
};

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
    let cx: number, cy: number, rMin: any, rMax: any, nPoints: Default.DIAL_TICKMARKS_rMIN;
        cx = 50;
        cy = 50;
        rMin = 50 + Default.DIAL_TICKMARKS_rMIN;
        rMax = 50 + Default.DIAL_TICKMARKS_rMAX;
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


export function toNumber( value: string|number): number {
    return typeof value !== 'number' ? Number.parseFloat(value) : value;
}

// https://thi.ng/
export const roundTo = (x: number, prec = 1) => Math.round(x / prec) * prec;
