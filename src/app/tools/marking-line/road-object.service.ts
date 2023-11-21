import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { MapService } from 'app/services/map.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";
import { SceneService } from 'app/services/scene.service';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { RoadObjectFactory } from 'app/factories/road-object.factory';
import { Object3DMap } from '../lane-width/object-3d-map';
import { Group, Object3D } from 'three';
import { TvObjectOutline } from 'app/modules/tv-map/models/objects/tv-object-outline';

@Injectable( {
	providedIn: 'root'
} )
export class RoadObjectService {

	private objectMap = new Object3DMap<TvRoadObject, Object3D>();

	static instance: any;

	constructor (
		public base: BaseToolService,
		private map: MapService
	) {
		RoadObjectService.instance = this;
	}

	buildRoadObjects ( road: TvRoad ): void {

		road.objects.object.forEach( roadObject => {

			const mesh = this.createRoadObjectMesh( roadObject );

			this.objectMap.add( roadObject, mesh );

		} );

	}

	addRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		const mesh = this.createRoadObjectMesh( roadObject );

		this.objectMap.add( roadObject, mesh );

		road.addRoadObjectInstance( roadObject );

		this.showRoadObjectCorners( roadObject );

	}

	removeRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.objectMap.remove( roadObject );

		road.removeRoadObjectById( roadObject.attr_id );

	}

	updateRoadObject ( road: TvRoad, roadObject: TvRoadObject ): void {

		this.removeRoadObject( road, roadObject );

		this.addRoadObject( road, roadObject );

	}

	addCornerRoad ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		SceneService.addToolObject( cornerRoad );

		roadObject.markings[ 0 ].addCornerRoad( cornerRoad );

		roadObject.outlines[ 0 ].cornerRoad.push( cornerRoad );

		this.updateRoadObject( roadObject.road, roadObject );

	}

	removeCornerRoad ( roadObject: TvRoadObject, cornerRoad: TvCornerRoad ): void {

		SceneService.removeFromTool( cornerRoad );

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

				SceneService.addToolObject( corner );

				corner.show();

			} );

		} );

	}

	hideRoad ( road: TvRoad ): void {

		road.getRoadObjects().forEach( object => {

			object.outlines.forEach( outline => {

				outline.cornerRoad.forEach( corner => {

					SceneService.removeFromTool( corner );

					// corner.unselect();

					corner.hide();

				} );

			} );

		} );

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

	createRoadObjectMesh ( roadObject: TvRoadObject ): Object3D {

		if ( roadObject.markings.length < 1 ) return;

		if ( roadObject.outlines.length < 1 ) return;

		if ( roadObject.markings[ 0 ].cornerReferences.length < 2 ) return;

		return RoadObjectFactory.create( roadObject );

	}

	findRoadObject ( road: TvRoad, corner: TvCornerRoad ): TvRoadObject {

		return road.getRoadObjects()
			.find( roadObject => roadObject.outlines
				.find( outline => outline.cornerRoad.includes( corner ) ) );

	}
}
