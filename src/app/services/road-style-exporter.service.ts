/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoadTypeClass } from 'app/modules/tv-map/models/tv-road-type.class';
import { OdWriter } from 'app/modules/tv-map/services/open-drive-writer.service';
import { ElectronService } from 'ngx-electron';
import { Euler, Vector3 } from 'three';
import { FileService } from './file.service';
import { RoadStyle } from './road-style.service';

export interface Scene {

	road: { guid: string },

	props: { guid: string, position: Vector3, rotation: Euler, scale: Vector3 }[],

	propCurves: []
}

@Injectable( {
	providedIn: 'root'
} )
export class RoadExporterService {

	private readonly extension = 'roadstyle';

	constructor (
		private openDriveWriter: OdWriter,
		private fileService: FileService,
		private electron: ElectronService
	) {
	}

	exportRoadStyle ( road: RoadStyle ) {

		const xmlNode = {
			version: 1,
			laneOffset: null,
			laneSection: null,
		};

		this.writeLaneOffset( xmlNode, road );

		this.writeLaneSection( xmlNode, road.laneSection );

		return xmlNode;
	}

	writeLaneSection ( xmlNode: any, laneSection: TvLaneSection ) {

		const leftLanes = {
			lane: []
		};
		const centerLanes = {
			lane: []
		};
		const rightLanes = {
			lane: []
		};

		for ( let i = 0; i < laneSection.getLaneCount(); i++ ) {

			const lane = laneSection.getLane( i );
			const side = lane.getSide();

			if ( side === TvLaneSide.LEFT ) {

				this.writeLane( leftLanes, lane );

			} else if ( side === TvLaneSide.RIGHT ) {

				this.writeLane( rightLanes, lane );

			} else if ( side === TvLaneSide.CENTER ) {

				this.writeLane( centerLanes, lane );

			}
		}

		const laneSectionNode = {
			attr_s: laneSection.s,
		};

		if ( leftLanes.lane.length > 0 ) laneSectionNode[ 'left' ] = leftLanes;

		if ( centerLanes.lane.length > 0 ) laneSectionNode[ 'center' ] = centerLanes;

		if ( rightLanes.lane.length > 0 ) laneSectionNode[ 'right' ] = rightLanes;

		xmlNode.laneSection = laneSectionNode;
	}

	writeLane ( xmlNode, lane: TvLane ): any {

		const laneNode = {
			attr_id: lane.id,
			attr_type: lane.type,
			attr_level: lane.level,
			// link: {},
			width: [],
			roadMark: [],
			// material: [],
			// visibility: [],
			// speed: [],
			// access: [],
			// height: []
		};

		for ( let i = 0; i < lane.getLaneWidthCount(); i++ ) {
			this.openDriveWriter.writeLaneWidth( laneNode, lane.getLaneWidth( i ) );
		}

		for ( let i = 0; i < lane.getLaneRoadMarkCount(); i++ ) {
			this.openDriveWriter.writeLaneRoadMark( laneNode, lane.getLaneRoadMark( i ) );
		}

		// NOTE: below lane properties can be added as needed

		// for ( let i = 0; i < lane.getLaneMaterialCount(); i++ ) {
		//     this.openDriveWriter.writeLaneMaterial( laneNode, lane.getLaneMaterial( i ) );
		// }

		// for ( let i = 0; i < lane.getLaneVisibilityCount(); i++ ) {
		//     this.openDriveWriter.writeLaneVisibility( laneNode, lane.getLaneVisibility( i ) );
		// }

		// for ( let i = 0; i < lane.getLaneSpeedCount(); i++ ) {
		//     this.openDriveWriter.writeLaneSpeed( laneNode, lane.getLaneSpeed( i ) );
		// }

		// for ( let i = 0; i < lane.getLaneAccessCount(); i++ ) {
		//     this.openDriveWriter.writeLaneAccess( laneNode, lane.getLaneAccess( i ) );
		// }

		// for ( let i = 0; i < lane.getLaneHeightCount(); i++ ) {
		//     this.openDriveWriter.writeLaneHeight( laneNode, lane.getLaneHeight( i ) );
		// }

		xmlNode.lane.push( laneNode );

		return laneNode;
	}

	writeLaneOffset ( xmlNode, road: RoadStyle ) {

		xmlNode.laneOffset = {
			attr_s: road.laneOffset.s,
			attr_a: road.laneOffset.a,
			attr_b: road.laneOffset.b,
			attr_c: road.laneOffset.c,
			attr_d: road.laneOffset.d,
		};

		return xmlNode;
	}

	exportTypes ( types: TvRoadTypeClass[] ) {

		return types.map( type => {

			return {
				attr_s: type.s,
				attr_type: type.type,
				speed: {
					attr_max: type.speed.max,
					attr_unit: type.speed.unit
				},
			};

		} );

	}


}
