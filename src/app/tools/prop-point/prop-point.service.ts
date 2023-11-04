import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { SceneService } from 'app/services/scene.service';
import { Subscription } from 'rxjs';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class PropPointService {

	private static points: DynamicControlPoint<PropInstance>[] = [];

	private subscriptions: Subscription[] = [];

	constructor (
		public base: BaseToolService,
		public mapService: MapService,
		private controlPointFactory: ControlPointFactory
	) { }

	addAllPropPoints () {

		this.mapService.map.props.forEach( ( prop: PropInstance ) => {

			const point = this.controlPointFactory.createDynamic( prop, prop.getPosition().clone() );

			PropPointService.points.push( point );

			SceneService.addToolObject( point )

			const subscription = prop.updated.subscribe( prop => this.onPropUpdated( point, prop ) );

			this.subscriptions.push( subscription )

		} );

	}

	removePropPoint ( object: PropInstance ) {

		this.mapService.map.props = this.mapService.map.props.filter( prop => prop !== object );

		SceneService.removeFromMain( object );

		const index = PropPointService.points.findIndex( point => point.object === object );

		if ( index > -1 ) {

			const point = PropPointService.points[ index ];

			SceneService.removeFromTool( point );

			this.subscriptions[ index ].unsubscribe();

			this.subscriptions.splice( index, 1 );

			PropPointService.points.splice( index, 1 );

		}

	}

	addPropPoint ( prop: PropInstance ) {

		this.mapService.map.props.push( prop );

		const point = this.controlPointFactory.createDynamic( prop, prop.getPosition().clone() );

		PropPointService.points.push( point );

		SceneService.addToolObject( point )

		SceneService.addToMain( prop );

		const subscription = prop.updated.subscribe( prop => this.onPropUpdated( point, prop ) );

		this.subscriptions.push( subscription )

	}


	removeAllPropPoints () {

		PropPointService.points.forEach( point => {

			SceneService.removeFromTool( point );

		} );

		this.subscriptions.forEach( subscription => subscription.unsubscribe() );

	}

	onPropUpdated ( point: DynamicControlPoint<PropInstance>, prop: PropInstance ): void {

		point.copyPosition( prop.getPosition() );

	}


	createPropPoint ( prop: PropInstance, position: Vector3 ): PropInstance {

		const clone = prop.clone();

		clone.copyPosition( position );

		return clone;
	}

}
