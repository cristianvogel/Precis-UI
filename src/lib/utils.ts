
export function clamp(value, range) {
    return Math.min(Math.max(value, range[0]), range[1]);
}

export function lerp(start, stop, amt) {
    return amt*(stop-start)+start;
};

export function remap(n, start1, stop1, start2, stop2) {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

export function degToRad(degrees) {
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
    angleDegrees,  cx,  cy,  rMin,  rMax,  nPoints )
{
    const  angleRadians = degToRad(angleDegrees - 90)
    const  sinV = Math.sin(angleRadians)
    const  cosV = Math.cos(angleRadians)
    let data = new Array( )
    for(let i = 0; i < nPoints; i++)
    {
        const r = rMin+(rMax-rMin) * i / (nPoints-1)
        data.push( {x: cx + (r * cosV), y: cy + (r * sinV)} )
    }
    return data
}
