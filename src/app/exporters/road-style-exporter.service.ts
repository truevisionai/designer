/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoadTypeClass } from 'app/modules/tv-map/models/tv-road-type.class';
import { OpenDriveExporter } from 'app/modules/tv-map/services/open-drive-exporter';
import { RoadStyle } from "../core/asset/road.style";
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';

@Injectable( {
	providedIn: 'root'
} )
export class RoadExporterService {

	constructor (
		private openDriveExporter: OpenDriveExporter,
	) {
	}

	exportRoadStyle ( style: RoadStyle ): string {

		const xmlNode = {
			version: 1,
			laneOffset: null,
			laneSection: null,
		};

		this.writeLaneOffset( xmlNode, style.laneOffset );

		this.writeLaneSection( xmlNode, style.laneSection );

		return JSON.stringify( xmlNode );
	}

	exportRoadAsStyle ( road: TvRoad ) {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = road.getLaneOffsetAt( 0 ).clone();

		roadStyle.laneSection = road.getLaneSectionAt( 0 ).cloneAtS( 0, 0 )

		return this.exportRoadStyle( roadStyle );

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
			this.openDriveExporter.writeLaneWidth( laneNode, lane.getLaneWidth( i ) );
		}

		for ( let i = 0; i < lane.getLaneRoadMarkCount(); i++ ) {
			this.openDriveExporter.writeLaneRoadMark( laneNode, lane.getLaneRoadMark( i ) );
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

	writeLaneOffset ( xmlNode, laneOffset: TvRoadLaneOffset ) {

		xmlNode.laneOffset = {
			attr_s: laneOffset.s,
			attr_a: laneOffset.a,
			attr_b: laneOffset.b,
			attr_c: laneOffset.c,
			attr_d: laneOffset.d,
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
