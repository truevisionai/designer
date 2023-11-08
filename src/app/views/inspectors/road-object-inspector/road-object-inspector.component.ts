/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { TvRoadObject } from '../../../modules/tv-map/models/objects/tv-road-object';

@Component( {
	selector: 'app-road-object-inspector',
	templateUrl: './road-object-inspector.component.html',
} )
export class RoadObjectInspectorComponent implements OnInit, IComponent {

	data: TvRoadObject;

	constructor () {
	}

	// TODO: Get this properly
	get signMaterial () {
		return this.data.mesh.material;
	}

	ngOnInit () {
	}

	updatePosition ( $event: number ) {

		// const road = OdSourceFile.openDrive.getRoadById( this.data.road_id );

		// const pose = road.getPositionAt( this.data.attr_s, this.data.attr_t );

		// this.data.GameObject.position.set( pose.x, pose.y, 0 );

	}

	onDelete () {

		// CommandHistory.execute( new RemoveSignalCommand( this.data ) );

	}

}
