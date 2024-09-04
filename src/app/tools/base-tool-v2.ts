/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";
import { KeyboardEvents } from 'app/events/keyboard-events';

export abstract class ToolWithHandler extends BaseTool<any> {

	override onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	override onPointerDownCreate ( e: PointerEventData ): void {

		const selected = this.selectionService.executeSelection( e );

		if ( !selected ) return;

		const controller = this.getController( selected.constructor.name );

		if ( !controller ) {
			Log.warn( `No controller found for ${ selected.constructor.name }` );
			return;
		}

		const created = controller.createAt( selected, e );

		if ( created ) {

			const oldObjects = this.getController( created.constructor.name ).getSelected();

			this.executeAddAndSelect( created, oldObjects );

		}

	}

	override onPointerMoved ( e: PointerEventData ): void {

		this.handlers.handleHighlight( e );

		if ( !this.isPointerDown ) return;

		if ( KeyboardEvents.isShiftKeyDown ) return;

		const lastSelectedObject = this.getSelectionService().getLastSelectedObject();

		if ( !lastSelectedObject ) return;

		this.handlers.handleDrag( lastSelectedObject, e );

		this.updateVisuals( lastSelectedObject );

	}

	override onPointerUp ( e: PointerEventData ): void {

		this.enableControls();

		this.handlers.handleDragEnd( e );

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
