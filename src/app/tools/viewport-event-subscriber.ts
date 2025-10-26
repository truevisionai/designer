/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ViewportEvents } from 'app/events/viewport-events';
import { Injectable } from '@angular/core';
import { ToolManager } from 'app/managers/tool-manager';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { PointerModeService } from './pointer-mode.service';
import { BoxSelectionController } from './box-selection-controller';
import { Tool } from './tool';
import { KeyboardEvents } from 'app/events/keyboard-events';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportEventSubscriber {

	private subscribed: boolean = false;

	constructor (
		private viewportEvents: ViewportEvents,
		private pointerModeService: PointerModeService,
		private boxSelectionController: BoxSelectionController,
	) {

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

		if ( this.pointerModeService.isBoxSelection() ) {

			if ( e.key === 'Delete' || ( e.key === 'Backspace' && ( e.metaKey || e.ctrlKey ) ) ) {

				if ( this.boxSelectionController.handleDeleteRequest() ) {

					e.preventDefault();
					return;
				}

			}

		}

		ToolManager.getTool()?.onKeyDown( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		const tool = ToolManager.getTool();

		if ( !tool ) return;

		if ( this.pointerModeService.isBoxSelection() && this.boxSelectionController.isSessionActive() ) {

			this.boxSelectionController.update( e );

			return;
		}

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		tool.onPointerMoved( e );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		const tool = ToolManager.getTool();

		if ( !tool ) return;

		if ( e.point == null ) return;

		tool.onPointerUp( e )

		tool.isPointerDown = false;

		tool.pointerDownAt = null;

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		const tool = ToolManager.getTool();

		if ( !tool ) return;

		if ( this.boxSelectionController.isSessionActive() ) {

			this.boxSelectionController.end( e );

			tool.isPointerDown = false;

			tool.pointerDownAt = null;

			return;

		} else if ( this.pointerModeService.isBoxSelection() && KeyboardEvents.isShiftKeyDown ) {

			this.beginBoxSelection( e, tool );

			return;

		} else if ( this.pointerModeService.isBoxSelection() ) {

			this.boxSelectionController.clear();

			return;

		}

		tool.pointerDownAt = e.button === MouseButton.LEFT ? e.point?.clone() : null;

		tool.isPointerDown = e.button === MouseButton.LEFT;

		tool.onPointerDown( e );

	}


	private beginBoxSelection ( e: PointerEventData, tool: Tool ): void {

		const config = tool.getBoxSelectionConfig?.();

		if ( !config?.strategy ) return;

		tool.pointerDownAt = e.point ? e.point.clone() : null;

		tool.isPointerDown = true;

		this.boxSelectionController.beginSession( e, config );

		this.boxSelectionController.start( e );

	}

}
