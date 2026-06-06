export { default as Fader } from '../components/Fader.svelte';
export { default as Radial } from '../components/Radial.svelte';
export { default as Toggle } from '../components/Toggle.svelte';

export { Default, DEFAULT_TAPER, DEFAULT_RECT } from '../components/Precis-UI-Defaults.js';
export { Palette } from '../types/Precis-UI-TypeDeclarations.js';

export type {
  Rect,
  Taper,
  TickMark,
  Point,
  PointsArray,
  WidgetWithKey,
  RoundedReadout,
  BoundingRectCSS,
  Output,
  StateFlags,
  FaderTag,
  DialTag,
  ToggleTag,
  Tint,
  PositiveNumber,
} from '../types/Precis-UI-TypeDeclarations.js';

export type {
  WidgetOutput,
  WidgetOutputHandler,
} from './PrecisControllers.svelte.js';

export {
  toNumber,
  radialPoints,
  radialTickMarkAt,
  asLogicValue,
  roundTo,
  trunc,
  lerp,
  remap,
  degToRad,
  clamp,
  toFixed,
} from './Utils.svelte.js';
