/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvCornerRoad } from "../models/objects/tv-corner-road";
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvObjectMarking } from 'app/map/models/tv-object-marking';
import { TvColors, TvRoadMarkWeights } from 'app/map/models/tv-common';
import { IDService } from 'app/factories/id.service';
import { TvObjectOutline } from 'app/map/models/objects/tv-object-outline';
import { TvObjectRepeat } from 'app/map/models/objects/tv-object-repeat';
import { CornerRoadFactory } from 'app/services/road-object/corner-road.factory';
import { Log } from 'app/core/utils/log';
import { MapEvents } from 'app/events/map-events';
import { RoadObjectAddedEvent } from 'app/events/road-object.events';

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectService {

	private ids: Map<TvRoad, IDService> = new Map();

	constructor ( private map: MapService ) { }

	clone ( roadObject: TvRoadObject ): TvRoadObject {

		const id = this.getRoadObjectId( roadObject.road );

		const clone = roadObject.clone( id );

		return clone;

	}

	updateRoadObjectPositions ( road: TvRoad ): void {

		road.getRoadObjects().forEach( object => {

			// TODO: update position of road object
			// this is inefficient, but it works for now
			this.updateRoadObjectMesh( road, object );

		} );

	}

	/**
	 *
	 * @param road
	 * @returns
	 * @deprecated we needt o remove this method
	 */
	getRoadObjectId ( road: TvRoad ): number {

		if ( !this.ids.has( road ) ) {

			this.ids.set( road, new IDService() );

			road.getRoadObjects().forEach( object => {

				this.ids.get( road ).getNextId( object.id );

			} )

		}

		return this.ids.get( road ).getNextId();
	}

	createRoadObject ( road: TvRoad, type: TvRoadObjectType, s: number, t: number ): any {

		const id = this.getRoadObjectId( road );

		const roadObject = new TvRoadObject( type, '', id, s, t );

		roadObject.road = road;

		return roadObject

	}

	createMarking (): any {

		return new TvObjectMarking( TvColors.WHITE, 0.0, 1.0, null, TvRoadMarkWeights.STANDARD, 0, 0, 0.005, 0.1, [] );

	}

	addRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		if ( road.hasRoadObject( roadObject ) ) {
			Log.warn( 'Road object already exists in road' );
			return;
		}

		// const mesh = this.buildRoadObject( road, roadObject );

		// road.objectGroup.add( mesh );

		road.addRoadObject( roadObject );

		MapEvents.roadObjectAdded.emit( new RoadObjectAddedEvent( road, roadObject ) );

	}

	addRepeatObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat ): void {

		roadObject.addRepeatObject( repeat );

		this.updateRoadObjectMesh( roadObject.road, roadObject );

	}

	removeRepeatObject ( roadObject: TvRoadObject, repeat: TvObjectRepeat ): void {

		roadObject.removeRepeatObject( repeat );

		this.updateRoadObjectMesh( roadObject.road, roadObject );

	}

	// buildRoadObject ( road: TvRoad, roadObject: TvRoadObject ) {

	// roadObject.mesh = this.builder.buildRoadObject( road, roadObject );

	// return roadObject.mesh;

	// }

	removeRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		// this.removeRoadObjectMesh( road, roadObject );

		road?.removeRoadObject( roadObject.id );

		MapEvents.roadObjectRemoved.emit( new RoadObjectAddedEvent( road, roadObject ) );

	}

	removeRoadObjectMesh ( road: TvRoad, roadObject: TvRoadObject ): void {

		road.objectGroup?.remove( roadObject.mesh );

	}

	updateRoadObjectMesh ( road: TvRoad, roadObject: TvRoadObject ): void {

		MapEvents.roadObjectUpdated.emit( new RoadObjectAddedEvent( road, roadObject ) );

	}

	addCornerAndUpdateObject ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		if ( roadObject.markings.length == 0 ) {
			roadObject.markings.push( this.createMarking() );
		}

		if ( roadObject.outlines.length == 0 ) {
			roadObject.outlines.push( this.createOutline( roadObject ) );
		}

		roadObject.markings[ 0 ]?.addCornerRoad( cornerRoad );

		roadObject.outlines[ 0 ]?.cornerRoads.push( cornerRoad );

		this.updateRoadObjectMesh( roadObject.road, roadObject );

	}

	removeCornerAndUpdateObject ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		roadObject.markings[ 0 ]?.removeCornerRoad( cornerRoad );

		const index = roadObject.outlines[ 0 ]?.cornerRoads.indexOf( cornerRoad );

		if ( index > -1 ) {
			roadObject.outlines[ 0 ]?.cornerRoads.splice( index, 1 );
		}

		this.updateRoadObjectMesh( roadObject.road, roadObject );

	}

	pushCornerLocal ( outline: TvObjectOutline, u: number, v: number, z: number = 0.0, height: number = 0.0 ): any {

		const cornerLocal = CornerRoadFactory.createCornerLocalOutline( outline, u, v, z, height );

		outline.cornerLocals.push( cornerLocal );

		return cornerLocal;

	}

	createOutline ( roadObject: TvRoadObject ): TvObjectOutline {

		return new TvObjectOutline( roadObject.outlines.length );

	}

	findByCornerRoad ( road: TvRoad, corner: TvCornerRoad ): TvRoadObject {

		return road.getRoadObjects()
			.find( roadObject => roadObject.outlines
				.find( outline => outline.cornerRoads.includes( corner ) ) );

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
