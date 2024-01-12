import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadObjectService } from '../marking-line/road-object.service';
import { Vector3, Euler, Object3D } from 'three';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { TvRoadObject } from 'app/modules/tv-map/models/objects/tv-road-object';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Object3DMap } from '../lane-width/object-3d-map';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { BoxSelectionService } from '../box-selection-service';
import { AssetManager } from 'app/core/asset/asset.manager';

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolService {

	private controlPoints = new Object3DMap<TvRoadObject, Object3D>();

	constructor (
		public base: BaseToolService,
		public roadService: RoadService,
		public roadObjectService: RoadObjectService,
		private controlPointFactory: ControlPointFactory,
		public boxSelectionService: BoxSelectionService,
		public assetManager: AssetManager
	) { }

	getSelectedAsset (): AssetNode {

		return this.assetManager.getTextureAsset() || this.assetManager.getMaterialAsset();

	}

	createPointMarking ( asset: AssetNode, position: Vector3 ): TvRoadObject {

		const lane = this.roadService.findLaneAtPosition( position );

		if ( !lane ) return;

		const roodCoord = this.roadService.findRoadCoordAtPosition( position );

		const roadObject = this.roadObjectService.createRoadObject(
			lane.laneSection.road,
			ObjectTypes.roadMark,
			roodCoord.s,
			roodCoord.t
		);

		if ( asset.type == AssetType.MATERIAL ) {

			roadObject.width = roadObject.height = roadObject.length = 1;

		} else if ( asset.type == AssetType.TEXTURE ) {

			roadObject.width = roadObject.height = roadObject.length = 1;

		}

		roadObject.rotation = new Euler( 0, 0, 0 );

		roadObject.assetGuid = asset.guid;

		return roadObject;
	}

	removePointMarking ( roadObject: TvRoadObject ) {

		this.roadObjectService.removeRoadObject( roadObject.road, roadObject );

		this.controlPoints.remove( roadObject );

	}

	hideAllControls () {

		this.controlPoints.clear();

	}

	hideControls ( road: TvRoad ) {

		this.controlPoints.clear();

	}

	showControls ( road: TvRoad ) {

		road.objects.object.filter( roadObject => roadObject.attr_type == ObjectTypes.roadMark ).forEach( roadObject => {

			const position = road.getPosThetaAt( roadObject.s, roadObject.t ).position;

			const controlPoint = this.controlPointFactory.createSimpleControlPoint( roadObject, position );

			this.controlPoints.add( roadObject, controlPoint );

		} );

	}

	updateControls ( roadObject: TvRoadObject ) {

		if ( !roadObject ) return;

		const position = roadObject.road.getPosThetaAt( roadObject.s, roadObject.t ).position;

		const controlPoint = this.controlPoints.get( roadObject );

		if ( !controlPoint ) return;

		controlPoint.position.copy( position );

	}



}
