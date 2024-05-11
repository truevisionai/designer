/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvCornerRoad } from "../models/objects/tv-corner-road";
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { RoadObjectBuilder } from 'app/map/road-object/road-object.builder';
import { Group } from 'three';
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { RoadSignalService } from 'app/map/road-signal/road-signal.service';
import { ObjectTypes, TvColors, TvRoadMarkWeights } from 'app/map/models/tv-common';
import { IDService } from 'app/factories/id.service';
import { TvObjectOutline } from 'app/map/models/objects/tv-object-outline';
import { TvObjectRepeat } from 'app/map/models/objects/tv-object-repeat';
import { CornerRoadFactory } from 'app/services/road-object/corner-road.factory';

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectService {

	private ids: Map<TvRoad, IDService> = new Map();

	constructor (
		private map: MapService,
		private signal: RoadSignalService, // just for import,
		private builder: RoadObjectBuilder,
		private cornerFactory: CornerRoadFactory,
	) {
	}

	removeObjectsByRoad ( road: TvRoad ) {

		road.getRoadObjects().forEach( object => {

			this.removeRoadObject( road, object );

		} );

	}

	clone ( roadObject: TvRoadObject ): TvRoadObject {

		const id = this.getRoadObjectId( roadObject.road );

		const clone = roadObject.clone( id );

		return clone;

	}

	updateRoadObjectPositions ( road: TvRoad ) {

		road.getRoadObjects().forEach( object => {

			// TODO: update position of road object
			// this is inefficient, but it works for now
			this.updateRoadObject( road, object );

		} );

	}

	private getRoadObjectId ( road: TvRoad ): number {

		if ( !this.ids.has( road ) ) {

			this.ids.set( road, new IDService() );

			road.objects.object.forEach( object => {

				this.ids.get( road ).getNextId( object.attr_id );

			} )

		}

		return this.ids.get( road ).getNextId();
	}

	createRoadObject ( road: TvRoad, type: ObjectTypes, s: number, t: number ) {

		const id = this.getRoadObjectId( road );

		const roadObject = new TvRoadObject( type, '', id, s, t );

		roadObject.road = road;

		return roadObject

	}

	createMarking () {

		return new TvObjectMarking( TvColors.WHITE, 0.0, 1.0, null, TvRoadMarkWeights.STANDARD, 0, 0, 0.005, 0.1, [] );

	}

	buildRoadObjects ( road: TvRoad ) {

		const group = new Group();

		group.name = 'RoadObjects';

		for ( const roadObject of road.objects.object ) {

			const mesh = this.buildRoadObject( road, roadObject );

			if ( !mesh ) continue;

			group.add( mesh );

		}

		return group;
	}

	addRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		if ( road.objects.object.find( object => object.attr_id === roadObject.attr_id ) ) return;

		const mesh = roadObject.mesh = this.buildRoadObject( road, roadObject );

		if ( !mesh ) return;

		road?.gameObject?.add( mesh );

		road.addRoadObjectInstance( roadObject );

		this.showRoadObjectCorners( roadObject );

	}

	addRepeatObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		roadObject.addRepeatObject( repeat );

		this.updateRoadObject( roadObject.road, roadObject );

	}

	removeRepeatObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat ) {

		roadObject.removeRepeatObject( repeat );

		this.updateRoadObject( roadObject.road, roadObject );

	}

	buildRoadObject ( road: TvRoad, roadObject: TvRoadObject ) {

		return this.builder.buildRoadObject( road, roadObject );

	}

	removeRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.removeObject3d( roadObject );

		this.hideRoadObjectCorners( roadObject );

		road?.removeRoadObjectById( roadObject.attr_id );

	}

	removeObject3d ( roadObject: TvRoadObject ): void {

		roadObject.mesh?.parent?.remove( roadObject.mesh );

	}

	updateRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.removeRoadObject( road, roadObject );

		this.addRoadObject( road, roadObject );

	}

	addCornerRoad ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		roadObject.markings[ 0 ].addCornerRoad( cornerRoad );

		roadObject.outlines[ 0 ].cornerRoad.push( cornerRoad );

		this.updateRoadObject( roadObject.road, roadObject );

	}

	removeCornerRoad ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		roadObject.markings[ 0 ].removeCornerRoad( cornerRoad );

		const index = roadObject.outlines[ 0 ].cornerRoad.indexOf( cornerRoad );

		if ( index > -1 ) {
			roadObject.outlines[ 0 ].cornerRoad.splice( index, 1 );
		}

		this.updateRoadObject( roadObject.road, roadObject );

	}

	showRoad ( road: TvRoad ): void {

		road.getRoadObjects().forEach( object => {

			this.showRoadObjectCorners( object );

		} );

	}

	showRoadObjectCorners ( roadObject: TvRoadObject ): void {

		roadObject.outlines.forEach( outline => {

			outline.cornerRoad.forEach( corner => {

			} );

		} );

	}

	hideRoad ( road: TvRoad ): void {

		road.getRoadObjects().forEach( object => {

			this.hideRoadObjectCorners( object );

		} );

	}

	hideRoadObjectCorners ( object: TvRoadObject ) {

		object.outlines.forEach( outline => {

			outline.cornerRoad.forEach( corner => {

			} );

		} );

	}

	pushCornerLocal ( outline: TvObjectOutline, u: number, v: number, z: number = 0.0, height = 0.0 ) {

		const cornerLocal = this.cornerFactory.createCornerLocalOutline( outline, u, v, z, height );

		outline.cornerLocal.push( cornerLocal );

		return cornerLocal;

	}

	createOutline ( roadObject: TvRoadObject ): TvObjectOutline {

		const outline = new TvObjectOutline();

		outline.id = roadObject.outlines.length;

		return outline;

	}

	showMarkingObjects (): void {

		this.map.map.getRoads().forEach( road => {

			this.showRoad( road );

		} );

	}

	hideMarkingObjects (): void {

		this.map.map.getRoads().forEach( road => {

			this.hideRoad( road );

		} );
	}

	findByCornerRoad ( road: TvRoad, corner: TvCornerRoad ): TvRoadObject {

		return road.getRoadObjects()
			.find( roadObject => roadObject.outlines
				.find( outline => outline.cornerRoad.includes( corner ) ) );

	}

	findRoadObjectByMarking ( road: TvRoad, marking: TvObjectMarking ): TvRoadObject {

		return road.getRoadObjects().find( roadObject => roadObject.markings.includes( marking ) );

	}

	findMarkingByCornerRoad ( roadObject: TvRoadObject, corner: TvCornerRoad ): TvObjectMarking {

		return roadObject.markings.find( marking => marking.cornerReferences.includes( corner.attr_id ) );

	}

	findRoadByRoadObject ( roadObject: TvRoadObject ): TvRoad {

		return this.map.map.getRoads().find( road => road.getRoadObjects().includes( roadObject ) );

	}

	findRoadObjectByRepeat ( objectRepeat: TvObjectRepeat ): TvRoadObject {

		const roads = this.map.map.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			const objects = road.getRoadObjects();

			for ( let j = 0; j < objects.length; j++ ) {

				const object = objects[ j ];

				if ( object.repeats.includes( objectRepeat ) ) {

					return object;

				}
			}
		}
	}

}
