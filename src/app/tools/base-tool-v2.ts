/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";

export abstract class ToolWithHandler<T> extends BaseTool<T> {

	override onDeleteKeyDown (): void {

		if ( this.getObjectHandlerCount() > 0 ) {

			for ( const [ name, handler ] of this.getObjectHandlers() ) {

				if ( handler.getSelected().length > 0 ) {

					handler.getSelected().forEach( object => this.executeRemoveObject( object, true ) );

					break;

				}

			}

		}

	}

	override onObjectAdded ( object: Object ): void {

		const objectHandler = this.objectHandlers.get( object.constructor.name );

		objectHandler.getSelected().forEach( selected => this.onObjectUnselected( selected ) );

		const overlayHandler = this.overlayHandlers.get( object.constructor.name );

		objectHandler.onAdded( object );

		overlayHandler.onAdded( object );

		this.setObjectHint( object, 'onAdded' );

	}

	override onObjectUpdated ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onUpdated' );

		} else {

			Log.error( 'unknown object updated: ' + object.constructor.name );

		}

	}

	override onObjectRemoved ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onRemoved' );

		} else {

			Log.error( 'unknown object removed: ' + object.constructor.name );

		}

	}

	override onObjectSelected ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleSelectionWithHandlers( object );

		} else {

			Log.error( 'unknown object selected: ' + object.constructor.name );

		}

		this.setObjectHint( object, 'onSelected' );

		this.showObjectInspector( object );

	}

	override onObjectUnselected ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleUnselectionWithHandlers( object );

		} else {

			Log.error( 'unknown object unselected: ' + object.constructor.name );

		}

		this.setObjectHint( object, 'onUnselected' );

		this.clearInspector();

	}

	protected override highlight ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

	}

	showObjectInspector ( object: object ): void {

		// should be implemented by the tool class

	}

}

