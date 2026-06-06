<!-- Demo/App.svelte -->
<script lang="ts">
    import Layout from './Layout.svelte'


    let readout = $state(0), rescaleDials = $state(0), rescaleFaders = $state(0)
    let touchedID = $state('unknown')

    let logger = $derived(`Output from: ${touchedID} - ${readout} rescale: ${rescaleDials} ◌ ${rescaleFaders}`)

    function focusWindow(event: MouseEvent) {
        event.preventDefault();
        window.focus();
    }
</script>

<svelte:body
        onmousedown={focusWindow}
        oncontextmenu={focusWindow}
/>

<main>
    <div id='header'>
        <h1>
            Precision UI
        </h1>
        <h2>
            Made with <a href='https://svelte.dev'>Svelte</a>
        </h2>
        <p>
            Drag with left mouse and use right mouse for precision mode.<br>
        </p>
    </div>

    <div class='footer'>
        <svg style="height: 1rem;">
            <text style="transform:translate(5%, 100%); font-size: xx-small;" fill="cyan">
                {logger}
            </text>
            <line x1="0.5rem" y1="7.5%" x2="225%" y2="7.5%" stroke='antiqueWhite'/>
        </svg>
        <h3>
            𝌺 <a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
        </h3>
    </div>

<Layout bind:readout bind:touchedID bind:rescaleDials bind:rescaleFaders/>

</main>
