<!--
	// Precision Audio UI © Cristian Vogel 2022
	// No unauthorised use or derivatives!
	// contact @neverenginelabs
-->

<!-- prevent default mouse actions but allow key events through -->
<svelte:body
		on:mousedown|preventDefault={ (e)=>{ window.focus()} }
		on:contextmenu|preventDefault={ (e)=>{window.focus()} }
/>

<script>
	// Precision Audio UI © Cristian Vogel 2022
	// No unauthorised use or derivatives!
	// @neverenginelabs

	import {clamp, lerp, radialPoints, remap} from './Utils.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';


	let clientRect;
	let selected = null;
	const radial = ()=>(fader.normValue * 270) + 230

	let fader = {
		x: 200,
		y: 50,
		w: 8,
		h: 200,
		rx: 3,
		value: 0,
		label: 'hold shift for fine tuning',
		precis: false,
		changing: false,
		taper: { min: 0, max: 10, fineStep: 0.1, curve:'LINEAR'},
		bg: 'transparent',
		set rect( options ) {
			const {x,y,width,height} = options
			this.x=x; this.y=y; this.w=width; this.h=height;
		},
		get radialPoints() { return (this.normValue * 270) + 230},
		get boundingBox() {
			return `top:${this.y}px;
			left:${this.x}px;
			width:${this.w + this.rx}px;
			height:${this.h + this.rx}px;
			background: ${this.bg};`
		},
		get normValue() {return (this.value /  this.h)}
	}

	function handleModifier (ev) {
		const shift = ev.shiftKey && ev.type==='keydown';
		fader.precis= shift
		if (shift){
			removeEventListener('mousemove', handleMouseMoveJump)
			addEventListener('mousemove', handleMouseMovePrecision)
		} else {
			removeEventListener('mousemove', handleMouseMovePrecision)
			addEventListener('mousemove', handleMouseMoveJump)
		}
	}

	function handleMouseDownPrecision(event) {
		selected = event.target
		fader.precis = true
		removeEventListener('mousemove', handleMouseMoveJump)
		addEventListener('mousemove', handleMouseMovePrecision)
		addEventListener('mouseup', handleMouseUp)
	}

	function handleMouseMovePrecision(event) {
		clientRect = selected.getBoundingClientRect()
		const dy = event.movementY
		const {value, taper, h, y} = fader
		if (dy === 0) return
		switch (selected.id.split('.')[0]) {
			case 'dial' :
				fader.value = clamp( value+((dy*dy)*(Math.sign(dy)/-2)) * taper.fineStep, [0, h] )
				break;
			case 'fader' :
				fader.value = clamp( value+ -dy * taper.fineStep, [0, h] )
				break;
		}
	}

	function handleMouseDownJump(event) {
		selected = event.target
		if (fader.precis) return
		selected.focus()
		addEventListener('mousemove', handleMouseMoveJump)
		addEventListener('mouseup', handleMouseUp)
		addEventListener('keydown', handleModifier)
		addEventListener('keyup', handleModifier)
	}

	function handleMouseMoveJump(event) {
		clientRect = selected.getBoundingClientRect()
		const dy = event.movementY
		const {value, taper, h, y, normValue } = fader
		switch (selected.id.split('.')[0]) {
			case 'dial' :
				fader.value = clamp( value + (-dy* (remap(normValue,0,1,3,0.25))), [0, h] )
				break;
			case 'fader' :
				fader.value = clamp( value + -dy, [0, h] )
				break;
		}
	}

	function handleMouseUp(event) {
		selected = null
		fader.precis = false
		fader.changing = false
		removeEventListener('mousemove', handleMouseMovePrecision)
		removeEventListener('mousemove', handleMouseMoveJump)
		removeEventListener('mouseup', handleMouseUp)
		removeEventListener('keydown', handleModifier)
		removeEventListener('keyup', handleModifier)
	}

	$: dialPointer = radialPoints( fader.radialPoints, 50,50,10,55,10)

	onMount(() => {
// 		 this was a temporary psuedo constructor
// 		 allows the widget to be scaled and positioned by CSS
// 		 which is actually quite cool?
		const faderRect = document.getElementById('fader.box')
		const {top, left, width, height} = faderRect.getBoundingClientRect()
		fader.rect = {top: top, left: left, width: width, height: height}
	})

</script>
<main>
<div id='header'>
	<h1>
		Precision UI Controls
	</h1>
	<h2>
		for <a href='https://svelte.dev'>Svelte</a>
	</h2>
	<p>
		Operate with both mouse buttons.<br>
		For precision mode, hold shift during drag.
	</p>
</div>

<div class='footer'>
	<h3>
		<a href='https://twitter.com/neverenginelabs'>@neverenginelabs</a>
	</h3>
</div>
</main>



<style>



	h1, h2, h3 {
		margin: 0.5rem;
		line-height:1rem
	}

	h2 {
		color: grey;
	}
	p {
		font-size: small;
		font-family: 'Helvetica Neue', sans-serif;
		color: silver;
		padding: 0.25rem

	}

	.footer {
		position: absolute;
		left: 80%;
		top: 90%;
		padding: 0.2rem
	}
	a {
		color: grey
	}
	a:hover {
		border-bottom: 0.25px dashed;
		text-decoration: none
	}

</style>
