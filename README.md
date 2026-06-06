# Precis-UI

Small Svelte 5 UI widgets for precision control surfaces.

## Public API

Import from the package root:

```ts
import { Fader, Radial, Toggle, Default, type WidgetOutput } from 'precis-ui';
```

### Components

#### `Fader`

Vertical slider widget.

Props:
- `min`, `max`, `fineStep`
- `rect`, `x`, `y`, `width`, `height`
- `scale`, `rx`, `id`, `label`, `value`
- `tickMarks`, `animatedReadout`, `background`
- `output?: (event: WidgetOutput) => void`

#### `Radial`

Dial / rotary widget.

Props:
- `min`, `max`, `fineStep`
- `rect`, `x`, `y`, `width`, `height`
- `scale`, `rx`, `id`, `label`, `value`
- `dialPointer`, `tickMarks`, `animatedReadout`, `background`
- `output?: (event: WidgetOutput) => void`

#### `Toggle`

Momentary/latched style control button.

Props:
- `graphicStyle`, `min`, `max`, `taper`
- `rect`, `x`, `y`, `width`, `height`
- `scale`, `rx`, `id`, `label`, `value`, `background`
- `output?: (event: WidgetOutput) => void`

### Types

- `WidgetOutput`: `{ id, value, widget }`
- `WidgetOutputHandler`
- `Rect`, `Taper`, `Tint`, `DialTag`, `FaderTag`, `ToggleTag`
- `Default`, `DEFAULT_TAPER`, `DEFAULT_RECT`

## Example

```svelte
<script lang="ts">
  import { Fader } from 'precis-ui';

  function handleOutput({ id, value }: { id: string; value: number }) {
    console.log(id, value);
  }
</script>

<Fader id="fader.1" label="Gain" min={0} max={1} output={handleOutput} />
```

## Package Shape

- `src/lib/` is the public package surface.
- `src/demo/` is the bundled showcase app used for local development.
- `src/components/` contains the reusable widgets.

## Notes

- Widgets emit values through the `output` callback rather than Svelte custom events.
- The demo shell is intentionally separate from the library entrypoint.
