/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Type } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { AppInspector } from 'app/core/inspector';
import { Color, Intersection, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { ObjectTypes } from '../../modules/tv-map/models/tv-common';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { MonoBehaviour } from '../components/mono-behaviour';
import { IEditorState } from './i-editor-state';

export abstract class BaseTool extends MonoBehaviour implements IEditorState {

	abstract name: string;

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

	init () {

	}

	enable (): void {

		this.subscribeToEvents();

	}

	disable (): void {

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

	protected checkIntersection ( tag: string, intersections: Intersection[], callback: ( object: Object3D ) => void ): void {

		for ( const i of intersections ) {

			if ( i.object[ 'tag' ] == tag ) {

				callback( i.object );

				break;
			}

		}

	}

	protected highlight ( object: Mesh ) {

		const material = ( object.material as MeshBasicMaterial );

		// clone because we want a new instance
		this.previousColor = material.color.clone();

		// set the current material property to highlighted color
		material.color.add( new Color( 0, 0, 0.2 ) );
		// material.color.addScalar(0.1)
		// material.opacity = 0.6;

		// dont clone we want the same instance
		this.previousMaterial = material;
	}

	protected removeHighlight () {

		if ( this.previousMaterial == null ) return;

		this.previousMaterial.color.copy( this.previousColor );

	}

}

