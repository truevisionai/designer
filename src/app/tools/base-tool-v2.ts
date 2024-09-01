/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";
import { BaseController } from 'app/core/object-handlers/base-controller';

export abstract class ToolWithHandler extends BaseTool<any> {

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.handlers.handleHighlight( e );

		if ( !this.isPointerDown ) return;

		for ( const [ name, handler ] of this.getControllers() ) {

			const selected = handler.getSelected();

			if ( selected.length == 0 ) continue;

			selected.forEach( object => this.dragObject( handler, object, e ) );

			this.currentSelectedPointMoved = true;

			break;

		}

	}

	dragObject<T> ( handler: BaseController<T>, object: T, e: PointerEventData ): void {

		if ( !handler.isDraggingSupported() ) {
			return;
		}

		this.disableControls();

		if ( !handler.getDragStartPosition() ) {
			handler.setDragStartPosition( e.point );
		}

		handler.updateDragDelta( e.point );

		handler.setCurrentDragPosition( e.point );

		handler.onDrag( object, e );

	}

	onPointerUp ( e: PointerEventData ): void {

		this.enableControls();

		if ( !this.currentSelectedPointMoved ) return;

		for ( const [ name, handler ] of this.getControllers() ) {

			const selected = handler.getSelected();

			if ( selected.length > 0 ) {

				selected.forEach( object => this.dragEndObject( handler, object, e ) );

				break;

			}

		}

		this.currentSelectedPointMoved = false;

	}

	dragEndObject<T> ( handler: BaseController<T>, object: T, e: PointerEventData ): void {

		if ( !handler.isDraggingSupported() ) {
			return;
		}

		handler.setDragEndPosition( e.point );

		handler.onDragEnd( object, e );

		handler.setDragStartPosition( undefined );

		handler.setCurrentDragPosition( undefined );

		handler.setDragEndPosition( undefined );

	}

	override onDeleteKeyDown (): void {

		if ( this.getControllerCount() > 0 ) {

			for ( const [ name, handler ] of this.getControllers() ) {

				if ( handler.getSelected().length > 0 ) {

					handler.getSelected().forEach( object => this.executeRemoveObject( object, true ) );

					break;

				}

			}

		}

	}

	override onObjectAdded ( object: Object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handlers.addObject( object );

		} else {

			Log.error( `unknown object updated: ${ object.constructor.name }` );

		}

		this.setObjectHint( object, 'onAdded' );
	}

	override onObjectUpdated ( object: Object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handlers.updateObject( object );

		} else {

			Log.error( `unknown object updated: ${ object.constructor.name }` );

		}

	}

	override onObjectRemoved ( object: Object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handlers.removeObject( object );

		} else {

			Log.error( `unknown object removed: ${ object.constructor.name }` );

		}

	}

	override onObjectSelected ( object: Object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handlers.handleSelection( object );

		} else {

			Log.error( `unknown object selected: ${ object.constructor.name }` );

		}

		this.setObjectHint( object, 'onSelected' );

		this.showObjectInspector( object );

	}

	override onObjectUnselected ( object: Object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handleDeselection( object );

		} else {

			Log.error( `unknown object unselected: ${ object.constructor.name }` );

		}

		this.setObjectHint( object, 'onUnselected' );

		this.clearInspector();

	}

	protected override highlight ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

	}

	private showObjectInspector ( object: object ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handlers.showInspector( object );

		} else {

			Log.error( `unknown object inspector: ${ object.constructor.name }` );

		}

	}

}
