/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map/map.service';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { DynamicControlPoint } from 'app/objects/dynamic-control-point';
import { Vector3 } from 'three';
import { SelectionService } from '../selection.service';
import { Object3DMap } from '../../core/models/object3d-map';
import { SceneService } from 'app/services/scene.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropPointService {

	private static pointsMap = new Object3DMap<PropInstance, DynamicControlPoint<PropInstance>>();

	constructor (
		public selection: SelectionService,
		public base: BaseToolService,
		public mapService: MapService,
		private controlPointFactory: ControlPointFactory
	) { }

	showAll () {

		this.mapService.map.props.forEach( ( prop: PropInstance ) => {

			const point = this.createControlPoint( prop, prop.getPosition() );

			PropPointService.pointsMap.add( prop, point );

		} );

	}

	updatePropInstance ( object: PropInstance ) {

		const point = this.getPoint( object );

		if ( point ) {

			console.log( 'updatePropInstance', point.position, object.getPosition() );

			point.copyPosition( object.getPosition() );

		}

	}

	getPoint ( object: PropInstance ) {

		return PropPointService.pointsMap.get( object );

	}

	removePropInstance ( prop: PropInstance ) {

		this.mapService.map.props = this.mapService.map.props.filter( prop => prop !== prop );

		SceneService.removeFromMain( prop );

		PropPointService.pointsMap.remove( prop );

	}

	addPropInstance ( prop: PropInstance ) {

		this.mapService.map.props.push( prop );

		SceneService.addToMain( prop );

	}

	addPoint ( point: DynamicControlPoint<PropInstance> ) {

		PropPointService.pointsMap.add( point.mainObject, point );

	}

	createControlPoint ( prop: PropInstance, position: Vector3 ): DynamicControlPoint<PropInstance> {

		return this.controlPointFactory.createDynamic( prop, position );

	}

	removeAll () {

		PropPointService.pointsMap.clear();

	}

	onPropUpdated ( point: DynamicControlPoint<PropInstance>, prop: PropInstance ): void {

		point.copyPosition( prop.getPosition() );

	}

	createPropInstance ( prop: PropInstance, position: Vector3 ): PropInstance {

		const clone = prop.clone();

		clone.copyPosition( position );

		return clone;
	}

}
