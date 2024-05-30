/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadObjectService } from '../../map/road-object/road-object.service';
import { Vector3, Euler, Object3D } from 'three';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Object3DMap } from '../../core/models/object3d-map';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { BoxSelectionService } from '../box-selection-service';
import { AssetManager } from 'app/core/asset/asset.manager';
import { TvOrientation } from 'app/map/models/tv-common';
import { TvTextureService } from 'app/graphics/texture/tv-texture.service';
import { TvConsole } from 'app/core/utils/console';

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
		public assetManager: AssetManager,
		public textureService: TvTextureService,
	) { }

	getSelectedAsset (): Asset {

		return this.assetManager.getTextureAsset() || this.assetManager.getMaterialAsset();

	}

	createPointMarking ( asset: Asset, position: Vector3 ): TvRoadObject {

		const lane = this.roadService.findLaneAtPosition( position );

		if ( !lane ) {
			TvConsole.error( 'Could not find lane at position' );
			return;
		}

		const roodCoord = this.roadService.findRoadCoordAtPosition( position );

		if ( !roodCoord ) {
			TvConsole.error( 'Could not find road coord at position' );
			return;
		};

		const laneCoord = roodCoord.road.getLaneCenterPosition( lane, roodCoord.s );

		if ( !laneCoord ) {
			TvConsole.error( 'Could not find lane coord at position' );
			return;
		}

		const roadObject = this.roadObjectService.createRoadObject(
			lane.laneSection.road,
			TvRoadObjectType.roadMark,
			laneCoord.s,
			laneCoord.t
		);

		if ( asset.type == AssetType.MATERIAL ) {

			roadObject.width = roadObject.height = roadObject.length = 1;

		} else if ( asset.type == AssetType.TEXTURE ) {

			const textureAsset = this.textureService.getTexture( asset.guid );

			// maintain aspect ratio
			const width = textureAsset.texture.image.width || 1;
			const height = textureAsset.texture.image.height || 1;

			const aspectRatio = width / height;

			roadObject.width = 1;
			roadObject.height = 0;
			roadObject.length = 1 / aspectRatio;

		}

		roadObject.assetGuid = asset.guid;

		roadObject.zOffset = 0.005;

		roadObject.orientation = roodCoord.t > 0 ? TvOrientation.MINUS : TvOrientation.PLUS;

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

		road.objects.object.filter( roadObject => roadObject.attr_type == TvRoadObjectType.roadMark ).forEach( roadObject => {

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
