/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { ViewportEvents } from 'app/events/viewport-events';

@Injectable( {
	providedIn: 'root'
} )
export class CursorService {

	private renderer: Renderer2;

	private cursorStyle: string;

	constructor ( rendererFactory: RendererFactory2, viewportEvents: ViewportEvents ) {

		this.renderer = rendererFactory.createRenderer( null, null );

		viewportEvents.pointerEnter.subscribe( () => this.setCursor( 'auto' ) );

		viewportEvents.pointerLeave.subscribe( () => this.setCursor( 'auto' ) );

	}

	setCursor ( cursorStyle: string ): void {

		if ( this.cursorStyle === cursorStyle ) return;

		this.cursorStyle = cursorStyle;

		this.renderer.setStyle( document.body, 'cursor', cursorStyle );

	}

}
