/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from 'app/core/inspector';
import { Color, Intersection, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { ObjectTypes } from '../../modules/tv-map/models/tv-common';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { MonoBehaviour } from '../components/mono-behaviour';
import { AppService } from '../services/app.service';
import { IEditorState } from './i-editor-state';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { StatusBarService } from 'app/services/status-bar.service';
import { ToolType } from '../models/tool-types.enum';
import { COLOR } from 'app/shared/utils/colors.service';
import { TvScenarioInstance } from 'app/modules/scenario/services/tv-scenario-instance';

export abstract class BaseTool extends MonoBehaviour implements IEditorState {

	abstract name: string;
	abstract toolType: ToolType;

	// highlighting variables
	private previousColor = new Color();
	private previousMaterial: MeshBasicMaterial;

	constructor () {

		super();

		this.clearInspector();

	}

	get map () {

		return TvMapInstance.map;

	}

	get scenario () {

		return TvScenarioInstance.scenario;

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

	setInspector ( component: Type<IComponent>, data: any ) {

		AppInspector.setInspector( component, data );

	}

	protected checkRoadIntersection ( intersections: Intersection[], callback: ( object: Object3D ) => void ): void {

		this.checkIntersection( ObjectTypes.LANE, intersections, ( obj ) => {

			callback( obj.parent.parent );

		} );

	}


	protected checkLaneIntersection ( intersections: Intersection[], callback: ( object: Object3D ) => void ) {

		this.checkIntersection( ObjectTypes.LANE, intersections, callback );

	}

	protected checkVehicleIntersection ( intersections: Intersection[], callback: ( object: Object3D ) => void ) {

		this.checkIntersection( ObjectTypes.VEHICLE, intersections, callback );

	}

	protected checkControlPointIntersection ( intersections: Intersection[], callback: ( object: AnyControlPoint ) => void ) {

		for ( const i of intersections ) {

			if ( i.object != null && i.object.type == 'Points' ) {

				callback( i.object as AnyControlPoint );

				break;
			}
		}
	}

	protected findControlPointFromIntersection ( intersections: Intersection[] ): AnyControlPoint | null {

		for ( const i of intersections ) {

			if ( i.object != null && i.object.type == 'Points' ) {

				return i.object as AnyControlPoint;

			}
		}

		return null;
	}

	protected checkIntersection ( tag: string, intersections: Intersection[], callback: ( object: Object3D ) => void ): void {

		for ( const i of intersections ) {

			if ( i.object[ 'tag' ] == tag ) {

				callback( i.object );

				break;
			}

		}

	}

	protected findIntersection<T extends Object3D> ( tag: string, intersections: Intersection[] ): T | null {

		for ( const i of intersections ) {

			if ( i.object[ 'tag' ] == tag ) {

				return i.object as T;
			}

		}

	}

	private highlightedObjects = new Map<Mesh, MeshBasicMaterial>();
	private highlightedLines = new Map<Line, Material>();

	protected highlight ( object: Mesh ) {

		const material = object.material as MeshBasicMaterial;

		// Check if the object is already highlighted
		if ( !this.highlightedObjects.has( object ) ) {

			// Save the original material instance
			this.highlightedObjects.set( object, material );

			// Create a new instance of the material to avoid affecting the shared material
			const highlightedMaterial = material.clone() as MeshBasicMaterial;

			// Set the current temporary material property to highlighted color
			highlightedMaterial.color.copy( material.color ).add( new Color( 0, 0, 0.5 ) );

			// Assign the temporary material to the object
			object.material = highlightedMaterial;
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
			})

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

	setHint ( msg: string ) {

		StatusBarService.setHint( msg )

	}

	clearHint () {

		StatusBarService.clearHint();

	}

}

