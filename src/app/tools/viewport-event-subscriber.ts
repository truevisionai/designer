/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ViewportEvents } from 'app/events/viewport-events';
import { Injectable } from '@angular/core';
import { ToolManager } from 'app/managers/tool-manager';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportEventSubscriber {

	private subscribed: boolean = false;

	constructor ( private viewportEvents: ViewportEvents ) {

		this.subscribeToEvents();

	}

	subscribeToEvents (): void {

		if ( this.subscribed ) return;

		this.viewportEvents.pointerMoved.subscribe( e => this.onPointerMoved( e ) );

		this.viewportEvents.pointerUp.subscribe( e => this.onPointerUp( e ) );

		this.viewportEvents.pointerDown.subscribe( e => this.onPointerDown( e ) );

		this.viewportEvents.keyDown.subscribe( e => this.onKeyDown( e ) );

		this.subscribed = true;
	}

	onKeyDown ( e: KeyboardEvent ): void {

		ToolManager.getTool()?.onKeyDown( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		ToolManager.getTool()?.onPointerMoved( e );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		const tool = ToolManager.getTool();

		if ( !tool ) return;

		tool.onPointerUp( e )

		tool.isPointerDown = false;

		tool.pointerDownAt = null;

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		const tool = ToolManager.getTool();

		if ( !tool ) return;

		tool.pointerDownAt = e.button === MouseButton.LEFT ? e.point?.clone() : null;

		tool.isPointerDown = e.button === MouseButton.LEFT;

		tool.onPointerDown( e );

	}

}
