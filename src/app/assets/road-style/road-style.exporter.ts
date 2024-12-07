/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLaneSide } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoadTypeClass } from 'app/map/models/tv-road-type.class';
import { OpenDriveExporter } from 'app/map/services/open-drive-exporter';
import { RoadStyle } from "./road-style.model";
import { TvLaneOffset } from 'app/map/models/tv-lane-offset';
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { SceneExporter } from 'app/map/scene/scene.exporter';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { JsonObject } from 'app/importers/xml.element';

@Injectable( {
	providedIn: 'root'
} )
export class RoadExporterService implements AssetExporter<RoadStyle> {

	constructor (
		private openDriveExporter: OpenDriveExporter,
		private sceneExporter: SceneExporter,
	) {
	}

	exportAsString ( style: RoadStyle ): string {

		const json = this.exportAsJSON( style );

		return JSON.stringify( json, null, 2 );

	}

	exportAsJSON ( style: RoadStyle ): JsonObject {

		const xmlNode = {
			version: 1,
			laneOffset: null,
			laneSection: null,
			elevationProfile: {
				elevation: style.elevations.map( elevation => {
					return {
						attr_s: elevation.s,
						attr_a: elevation.a,
						attr_b: elevation.b,
						attr_c: elevation.c,
						attr_d: elevation.d,
					};
				} )
			},
			objects: {
				object: style.objects.map( object => {
					return this.writeRoadObject( object )
				} )
			},
		};

		this.writeLaneOffset( xmlNode, style.laneOffset );

		this.writeLaneSection( xmlNode, style.laneSection );

		return xmlNode;
	}

	private writeRoadObject ( object: TvRoadObject ): any {

		return this.sceneExporter.writeRoadObject( object );

	}

	private writeLaneSection ( xmlNode: any, laneSection: TvLaneSection ): void {

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

			const lane = laneSection.getLaneAtIndex( i );

			if ( lane.isLeft ) {

				this.writeLane( leftLanes, lane );

			} else if ( lane.isRight ) {

				this.writeLane( rightLanes, lane );

			} else if ( lane.isCenter ) {

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

	private writeLane ( xmlNode: any, lane: TvLane ): any {

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

		for ( const width of lane.getWidthArray() ) {
			this.openDriveExporter.writeLaneWidth( laneNode, width );
		}

		for ( const roadMark of lane.roadMarks.toArray() ) {
			this.openDriveExporter.writeLaneRoadMark( laneNode, roadMark );
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

	private writeLaneOffset ( xmlNode: any, laneOffset: TvLaneOffset ): any {

		xmlNode.laneOffset = {
			attr_s: laneOffset.s,
			attr_a: laneOffset.a,
			attr_b: laneOffset.b,
			attr_c: laneOffset.c,
			attr_d: laneOffset.d,
		};

		return xmlNode;
	}

	private exportTypes ( types: TvRoadTypeClass[] ): any {

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
