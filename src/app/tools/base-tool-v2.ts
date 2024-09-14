/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";
import { KeyboardEvents } from 'app/events/keyboard-events';
import { Asset } from 'app/assets/asset.model';

export abstract class ToolWithHandler extends BaseTool<any> {

	override onAssetDroppedEvent ( asset: Asset, event: PointerEventData ): void {

		super.onAssetDroppedEvent( asset, event );

	}

	override onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	override onPointerDownCreate ( e: PointerEventData ): void {

		try {

			const created = this.objectCreationManager.tryCreatingObject( e );

			if ( !created ) return;

			const oldObjects = this.selectionService.getObjectLike( created );

			this.executeAddAndSelect( created, oldObjects );

		} catch ( error ) {

			this.setHint( "Something went wrong while creating object" );

			Log.error( error );

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

		const lastSelectedObject = this.getSelectionService().getLastSelectedObject();

		if ( lastSelectedObject ) {

			this.executeRemoveObject( lastSelectedObject, true );

		}

	}

	override onObjectAdded ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object updated: ${ object.toString() }` );
			return;
		}

		this.handlers.addObject( object );

		this.setObjectHint( object, 'onAdded' );

	}

	override onObjectUpdated ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object updated: ${ object.toString() }` );
			return;
		}

		this.handlers.updateObject( object );

	}

	override onObjectRemoved ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object removed: ${ object.toString() }` );
			return;
		}

		this.handlers.removeObject( object );

	}

	override onObjectSelected ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object selected: ${ object.toString() }` );
			return;
		}

		this.handlers.handleSelection( object );

		this.setObjectHint( object, 'onSelected' );

		this.showObjectInspector( object );

	}

	override onObjectUnselected ( object: Object ): void {

		if ( !this.hasHandlersForObject( object ) ) {
			Log.error( `unknown object unselected: ${ object.toString() }` );
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
			Log.error( `unknown object inspector: ${ object.toString() }` );
			return;
		}

		this.handlers.showInspector( object );

	}

}
