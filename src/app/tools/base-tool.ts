/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { AppInspector } from 'app/core/inspector';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { StatusBarService } from 'app/services/status-bar.service';
import { Intersection, Line, Mesh, Object3D, Vector3 } from 'three';
import { ViewportEventSubscriber } from './viewport-event-subscriber';
import { KeyboardEvents } from '../events/keyboard-events';
import { ToolType } from './tool-types.enum';
import { SceneService } from '../services/scene.service';
import { CommandHistory } from 'app/services/command-history';
import { AddObjectCommand } from "../commands/add-object-command";
import { RemoveObjectCommand } from "../commands/remove-object-command";
import { UnselectObjectCommand } from "../commands/unselect-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';

export abstract class BaseTool extends ViewportEventSubscriber {

	abstract name: string;

	abstract toolType: ToolType;

	constructor () {

		super();

		this.clearInspector();

	}

	init (): void {	}

	enable (): void {

		this.subscribeToEvents();

	}

	disable (): void {

		StatusBarService.clearHint();

		this.unsubscribeToEvents();

		this.removeHighlight();

	}

	clearInspector () {

		AppInspector.clear();

	}

	clearToolObjects (): void {

		SceneService.removeToolObjects();

	}

	setInspector ( component: Type<IComponent>, data: any ) {

		AppInspector.setInspector( component, data );

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		const shiftKeyDown = KeyboardEvents.isShiftKeyDown;

		if ( shiftKeyDown ) {

			this.onPointerDownCreate( e );

		} else {

			this.onPointerDownSelect( e );

		}

	}

	onPointerDownSelect ( e: PointerEventData ) {
	}

	onPointerDownCreate ( e: PointerEventData ) {
	}

	onKeyDown ( e: KeyboardEvent ): void {

		if ( e.key === 'Delete' || e.key === 'Backspace' ) {

			this.onDeleteKeyDown();

		} else if ( e.key === 'd' ) {

			this.onDuplicateKeyDown();

		}

	}

	onDeleteKeyDown () {
	}

	onDuplicateKeyDown () {
	}

	// onRoadCreated ( road: TvRoad ) { }

	// onRoadSelected ( road: TvRoad ) { }

	// onRoadUnselected ( road: TvRoad ) { }

	// onControlPointSelected ( controlPoint: AbstractControlPoint ) { }

	// onControlPointUnselected ( controlPoint: AbstractControlPoint ) { }

	onObjectSelected ( object: any ) {
	}

	onObjectUnselected ( object: any ) {
	}

	onObjectAdded ( object: any ) {
	}

	onObjectUpdated ( object: any ) {
	}

	onObjectRemoved ( object: any ) {
	}

	onAssetDropped ( asset: AssetNode, position: Vector3 ) {

	}

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	clearHint () {

		StatusBarService.clearHint();

	}

	protected selectObject ( object: any, previousObject: any ) {

		CommandHistory.execute( new SelectObjectCommand( object, previousObject ) );

	}

	protected unselectObject ( object: any ) {

		CommandHistory.execute( new UnselectObjectCommand( object ) );

	}

	protected executeAddObject ( object: any ) {

		CommandHistory.execute( new AddObjectCommand( object ) );

	}

	protected executeRemoveObject ( object: any ) {

		CommandHistory.execute( new RemoveObjectCommand( object ) );

	}

	protected findIntersection<T extends Object3D> ( tag: string, intersections: Intersection[] ): T | null {

		for ( const i of intersections ) {

			if ( i.object[ 'tag' ] == tag ) {

				return i.object as T;
			}

		}

	}

	protected highlightLine ( object: Line ) {

		// const material = object.material as LineBasicMaterial;

		// // Check if the object is already highlighted
		// if ( !this.highlightedLines.has( object ) ) {

		// 	// Save the original material instance
		// 	this.highlightedLines.set( object, material );

		// 	// Create a new instance of the material to avoid affecting the shared material
		// 	const highlightedMaterial = material.clone() as LineBasicMaterial;

		// 	// Set the current temporary material property to highlighted color
		// 	highlightedMaterial.linewidth += highlightedMaterial.linewidth;

		// 	highlightedMaterial.setValues( {
		// 		color: COLOR.DEEP_CYAN
		// 	} );

		// 	// Assign the temporary material to the object
		// 	object.material = highlightedMaterial;

		// }
	}

	protected removeHighlight ( object?: Mesh ) {

		// if ( object ) {
		// 	// Restore the specific object's highlight
		// 	this.restoreObjectHighlight( object );
		// } else {
		// 	// Restore all highlighted objects
		// 	this.restoreAllHighlights();
		// }
	}

	private restoreObjectHighlight ( object: Mesh ) {

		// if ( this.highlightedObjects.has( object ) ) {

		// 	// Get the original material from the models
		// 	const originalMaterial = this.highlightedObjects.get( object );

		// 	// Restore the original material to the object
		// 	object.material = originalMaterial;

		// 	// Dispose of the temporary material to free up memory
		// 	( object.material as MeshBasicMaterial ).dispose();

		// 	// Remove the object from the models
		// 	this.highlightedObjects.delete( object );
		// }
	}

	private restoreAllHighlights () {

		// this.highlightedObjects.forEach( ( originalMaterial, highlightedObject ) => {

		// 	this.restoreObjectHighlight( highlightedObject );

		// } );

		// this.highlightedLines.forEach( ( originalMaterial, object ) => {

		// 	if ( this.highlightedLines.has( object ) ) {

		// 		// Get the original material from the models
		// 		const originalMaterial = this.highlightedLines.get( object );

		// 		// Restore the original material to the object
		// 		object.material = originalMaterial;

		// 		// Dispose of the temporary material to free up memory
		// 		( object.material as MeshBasicMaterial ).dispose();

		// 		// Remove the object from the models
		// 		this.highlightedLines.delete( object );
		// 	}

		// } );
	}

}
