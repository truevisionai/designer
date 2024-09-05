/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


import { BaseTool } from './base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { Log } from "../core/utils/log";
import { KeyboardEvents } from 'app/events/keyboard-events';
import { ConstructorFunction } from 'app/core/models/class-map';
import { Asset } from 'app/assets/asset.model';
import { Vector3 } from 'three';

export abstract class ToolWithHandler extends BaseTool<any> {

	override onAssetDropped ( asset: Asset, position: Vector3 ): void {

		if ( !this.isAsssetSupported( asset ) ) {
			this.setHint( `Asset type: ${ asset.getTypeAsString() } not supported in this tool` );
			return;
		}

		this.importAsset( asset, position );

	}

	override onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	override onPointerDownCreate ( e: PointerEventData ): void {

		const selected = this.selectionService.executeSelection( e );

		if ( !selected ) return;

		const controller = this.getControllerByObject( selected );

		if ( !controller ) {
			Log.warn( `No controller found for ${ selected }` );
			return;
		}

		const created = controller.createAt( selected, e );

		if ( created ) {

			const oldObjects = this.selectionService.getSelectedObjectsByKey( created.constructor as ConstructorFunction<any> );

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
