/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";
import { BaseController } from 'app/core/object-handlers/base-controller';
import { ToolTipService } from 'app/services/debug/tool-tip.service';
import { KeyboardEvents } from 'app/events/keyboard-events';

export abstract class ToolWithHandler extends BaseTool<any> {

	override onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	override onPointerDownCreate ( e: PointerEventData ): void {

		const newSelected = this.selectionService.getSelectionStrategyResult( e );

		if ( !newSelected ) return;

		const controller = this.getController( newSelected.constructor.name );

		if ( !controller ) {
			Log.warn( `No controller found for ${ newSelected.constructor.name }` );
			return;
		}

		const createObject = controller.createAt( newSelected, e );

		if ( createObject ) {

			const oldObjects = this.getController( createObject.constructor.name ).getSelected();

			this.executeAddAndSelect( createObject, oldObjects );

		}

	}

	override onPointerMoved ( e: PointerEventData ): void {

		this.handlers.handleHighlight( e );

		if ( !this.isPointerDown ) return;

		if ( KeyboardEvents.isShiftKeyDown ) return;

		for ( const [ name, controller ] of this.getControllers() ) {

			const selected = controller.getSelected();

			if ( selected.length == 0 ) continue;

			selected.forEach( object => this.dragObject( controller, object, e ) );

			this.currentSelectedPointMoved = true;

			break;

		}

	}

	private dragObject<T> ( controller: BaseController<T>, object: T, e: PointerEventData ): void {

		if ( !controller.isDraggingSupported() ) {
			return;
		}

		this.disableControls();

		if ( !controller.getDragStartPosition() ) {
			controller.setDragStartPosition( e.point );
		}

		controller.updateDragDelta( e.point );

		controller.setCurrentDragPosition( e.point );

		controller.onDrag( object, e );

		this.showDragToolTip( controller, object, e );

		this.updateVisuals( object );

	}

	private showDragToolTip<T> ( controller: BaseController<T>, object: T, e: PointerEventData ): void {

		const toolTip = controller.getDragTip( object );

		if ( !toolTip ) return;

		// add scalar 1 to move tool tip to the right and avoid collision with the object
		ToolTipService.instance?.createOrUpdate( toolTip, e.point.clone().addScalar( 1 ) );

	}

	override onPointerUp ( e: PointerEventData ): void {

		this.enableControls();

		ToolTipService.instance?.removeLastTooltip();

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

	private dragEndObject<T> ( handler: BaseController<T>, object: T, e: PointerEventData ): void {

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

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object updated: ${ object.constructor.name }` );
			return;
		}

		this.handlers.addObject( object );

		this.setObjectHint( object, 'onAdded' );

	}

	override onObjectUpdated ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object updated: ${ object.constructor.name }` );
			return;
		}

		this.handlers.updateObject( object );

	}

	override onObjectRemoved ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object removed: ${ object.constructor.name }` );
			return;
		}

		this.handlers.removeObject( object );

	}

	override onObjectSelected ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object selected: ${ object.constructor.name }` );
			return;
		}

		this.handlers.handleSelection( object );

		this.setObjectHint( object, 'onSelected' );

		this.showObjectInspector( object );

	}

	override onObjectUnselected ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object unselected: ${ object.constructor.name }` );
			return;
		}

		this.handleDeselection( object );

		this.setObjectHint( object, 'onUnselected' );

		this.clearInspector();

	}

	protected override highlight ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

	}

	private showObjectInspector ( object: object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object inspector: ${ object.constructor.name }` );
			return;
		}

		this.handlers.showInspector( object );

	}

}
