/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameObject, IComponent } from 'app/core/game-object';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadStyle } from 'app/services/road-style.service';
import { Object3D } from 'three';

@Component( {
	selector: 'app-road-style-inspector',
	templateUrl: './road-style-inspector.component.html',
	styleUrls: [ './road-style-inspector.component.css' ]
} )
export class RoadStyleInspector implements OnInit, IComponent, OnDestroy {

	object: Object3D;
	data: {
		roadStyle: RoadStyle,
		guid: string
	};

	constructor () {
	}

	ngOnInit () {

		console.log( this.data );

		const gameObject = new GameObject();

		const road = new TvRoad( '', 0, 1, -1 );

		road.addGeometryLine( 0, -50, 0, 0, 100 );

		road.laneSections.push( this.data.roadStyle.laneSection );

		TvMapBuilder.buildRoad( gameObject, road );

		this.object = road.gameObject;
	}

	ngOnDestroy (): void {


	}

}
