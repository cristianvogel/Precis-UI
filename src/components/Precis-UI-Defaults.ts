// Precision Audio UI © Cristian Vogel 2022
// No unauthorised use or derivatives!
// @neverenginelabs

// Geometry Defs
import type {Rect, Taper} from '../types/Precis-UI-TypeDeclarations';
import {toNumber} from '../lib/Utils';

export enum Default {
    EMPTY,
    SCALE,
    X = 150,
    Y = 150,
    FADER_WIDTH = 25,
    FADER_HEIGHT = 300,
    FADER_SCALE_FACTOR = 1,
    FADER_rX = 2.75, // layout coefficient
    SQUARE = 108,
    DIAL_SCALE_FACTOR = 1,
    DIAL_TICKMARKS_COUNT=11, // best to keep this at 11
    DIAL_TICKMARKS_RADIAL_OFFSET = 135,
    DIAL_TICKMARKS_rMIN = -5,
    DIAL_TICKMARKS_rMAX = 1,
    DIAL_BACKGROUND = 'transparent',
    BUTTON_WIDTH = 72,
    BUTTON_HEIGHT = 45,
    BUTTON_SCALE_FACTOR = 1,
    BUTTON_BACKGROUND = 'transparent',
    RADIAL_OVERLAY_rX = 50 // coefficient for radial layout computed values
}

export const DEFAULT_TAPER:Taper = {
    min: 0,
    max: 1,
    fineStep: 1.0e-3
}

export const DEFAULT_RECT:Rect = {
    x: toNumber(Default.X),
    y: toNumber(Default.Y),
    width: toNumber(Default.SQUARE),
    height: toNumber(Default.SQUARE)
}

