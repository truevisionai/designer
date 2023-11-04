/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from 'app/core/inspector';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { StatusBarService } from 'app/services/status-bar.service';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Color, Intersection, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { ObjectTypes } from '../modules/tv-map/models/tv-common';
import { TvMapInstance } from '../modules/tv-map/services/tv-map-instance';
import { ViewportEventSubscriber } from './viewport-event-subscriber';
import { KeyboardEvents } from '../events/keyboard-events';
import { ToolType } from './tool-types.enum';
import { IEditorState } from './i-editor-state';
import { SceneService } from '../services/scene.service';
import { RoadService } from "../services/road/road.service";
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AnyControlPoint } from "../modules/three-js/objects/any-control-point";
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';

export abstract class BaseTool extends ViewportEventSubscriber implements IEditorState {

	abstract name: string;
	abstract toolType: ToolType;

	// highlighting variables
	private previousColor = new Color();
	private previousMaterial: MeshBasicMaterial;
	private highlightedObjects = new Map<Mesh, MeshBasicMaterial>();
	private highlightedLines = new Map<Line, Material>();

	protected roadService: RoadService;

	public selectedRoad: TvRoad;

	constructor () {

		super();

		this.clearInspector();

	}

	get map () {

		return TvMapInstance.map;

	}

	get scenario () {

		return ScenarioInstance.scenario;

	}

	init () {

	}

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

	onPointerDownSelect ( e: PointerEventData ) { }

	onPointerDownCreate ( e: PointerEventData ) { }

	onRoadCreated ( road: TvRoad ) { }

	onRoadSelected ( road: TvRoad ) { }

	onRoadUnselected ( road: TvRoad ) { }

	getRoad (): TvRoad { return this.selectedRoad; }

	setRoad ( newRoad: TvRoad ) { this.selectedRoad = newRoad; }

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	clearHint () {

		StatusBarService.clearHint();

	}

	protected findIntersection<T extends Object3D> ( tag: string, intersections: Intersection[] ): T | null {

		for ( const i of intersections ) {

			if ( i.object[ 'tag' ] == tag ) {

				return i.object as T;
			}

		}

	}

	protected highlightLine ( object: Line ) {

		const material = object.material as LineBasicMaterial;

		// Check if the object is already highlighted
		if ( !this.highlightedLines.has( object ) ) {

			// Save the original material instance
			this.highlightedLines.set( object, material );

			// Create a new instance of the material to avoid affecting the shared material
			const highlightedMaterial = material.clone() as LineBasicMaterial;

			// Set the current temporary material property to highlighted color
			highlightedMaterial.linewidth += highlightedMaterial.linewidth;

			highlightedMaterial.setValues( {
				color: COLOR.DEEP_CYAN
			} );

			// Assign the temporary material to the object
			object.material = highlightedMaterial;

		}
	}

	protected removeHighlight ( object?: Mesh ) {

		if ( object ) {
			// Restore the specific object's highlight
			this.restoreObjectHighlight( object );
		} else {
			// Restore all highlighted objects
			this.restoreAllHighlights();
		}
	}

	private restoreObjectHighlight ( object: Mesh ) {

		if ( this.highlightedObjects.has( object ) ) {

			// Get the original material from the map
			const originalMaterial = this.highlightedObjects.get( object );

			// Restore the original material to the object
			object.material = originalMaterial;

			// Dispose of the temporary material to free up memory
			( object.material as MeshBasicMaterial ).dispose();

			// Remove the object from the map
			this.highlightedObjects.delete( object );
		}
	}

	private restoreAllHighlights () {

		this.highlightedObjects.forEach( ( originalMaterial, highlightedObject ) => {

			this.restoreObjectHighlight( highlightedObject );

		} );

		this.highlightedLines.forEach( ( originalMaterial, object ) => {

			if ( this.highlightedLines.has( object ) ) {

				// Get the original material from the map
				const originalMaterial = this.highlightedLines.get( object );

				// Restore the original material to the object
				object.material = originalMaterial;

				// Dispose of the temporary material to free up memory
				( object.material as MeshBasicMaterial ).dispose();

				// Remove the object from the map
				this.highlightedLines.delete( object );
			}

		} );
	}

}

export abstract class BaseToolv2 extends ViewportEventSubscriber implements IEditorState {

	abstract name: string;

	abstract toolType: ToolType;

	abstract init (): void;

	enable (): void {

		this.subscribeToEvents();

	}

	disable (): void {

		StatusBarService.clearHint();

		this.unsubscribeToEvents();

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

	onPointerDownSelect ( e: PointerEventData ) { }

	onPointerDownCreate ( e: PointerEventData ) { }

	onRoadCreated ( road: TvRoad ) { }

	onRoadSelected ( road: TvRoad ) { }

	onRoadUnselected ( road: TvRoad ) { }

	onControlPointSelected ( controlPoint: AbstractControlPoint ) { }

	onControlPointUnselected ( controlPoint: AbstractControlPoint ) { }

	onObjectSelected ( object: any ) { }

	onObjectUnselected ( object: any ) { }

	onObjectAdded ( object: any ) { }

	onObjectRemoved ( object: any ) { }
}
