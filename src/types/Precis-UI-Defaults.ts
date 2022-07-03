// Precision Audio UI © Cristian Vogel 2022
// No unauthorised use or derivatives!
// @neverenginelabs

// Geometry Defs
export enum Default {
    EMPTY,
    SCALE,
    X = 150,
    Y = 150,
    FADER_WIDTH = 25,
    FADER_HEIGHT = 300,
    FADER_SCALE_FACTOR = 1,
    RX = 2.75,
    DIAL_SQUARE = 100,
    DIAL_SCALE_FACTOR = 0.8,
    DIAL_TICKMARKS_COUNT=11, // best to keep this at 11
    DIAL_TICKMARKS_RADIAL_OFFSET = 135,
    DIAL_TICKMARKS_rMIN = -5,
    DIAL_TICKMARKS_rMAX = 1,
    DIAL_BACKGROUND = 'transparent',
    BUTTON_WIDTH = 72,
    BUTTON_HEIGHT = 45,
    BUTTON_SCALE_FACTOR = 1,
    BUTTON_BACKGROUND = 'transparent'
}

export enum DefaultTaper {
    MIN,
    MAX,
    FINE = 1.0e-2
}

