/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractReader } from 'app/core/services/abstract-reader';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvLaneSide } from '../modules/tv-map/models/tv-common';
import { TvLane } from '../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../modules/tv-map/models/tv-lane-road-mark';
import { TvLaneWidth } from '../modules/tv-map/models/tv-lane-width';
import { RoadStyle } from './road-style.service';
import { SnackBar } from './snack-bar.service';

export class RoadStyleImporter extends AbstractReader {

	constructor () {
		super();
	}

	get map (): TvMap {
		return TvMapInstance.map;
	}

	set map ( value ) {
		TvMapInstance.map = value;
	}

	static importFromString ( contents: string ): RoadStyle {

		const roadStyleFile: any = JSON.parse( contents );

		// check for main elements first before parsing
		const version = roadStyleFile.version;

		if ( !version ) SnackBar.error( 'Cannot read road-style version. Please check file before importing', 'OK', 5000 );
		if ( !version ) return;

		return this.importRoadStyle( roadStyleFile );
	}

	static importRoadStyle ( json: any ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvRoadLaneOffset(
			json.laneOffset.attr_s || 0,
			json.laneOffset.attr_a || 0,
			json.laneOffset.attr_b || 0,
			json.laneOffset.attr_c || 0,
			json.laneOffset.attr_d || 0
		);

		roadStyle.laneSection = this.importLaneSection( json );

		return roadStyle;
	}

	static importLaneSection ( json: any ): TvLaneSection {

		const laneSection = new TvLaneSection( 0, 0, true, 1 );

		this.readAsOptionalElement( json.laneSection.left, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.LEFT );
			} );
		} );

		this.readAsOptionalElement( json.laneSection.center, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.CENTER );
			} );
		} );

		this.readAsOptionalElement( json.laneSection.right, xml => {
			this.readAsOptionalArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.RIGHT );
			} );
		} );

		return laneSection;
	}

	static readLane ( laneSection: TvLaneSection, xmlElement: any, laneSide: TvLaneSide ) {

		const id = parseFloat( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const level = xmlElement.attr_level;

		laneSection.addLane( laneSide, id, type, level, false );

		const lane = laneSection.getLastAddedLane();

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				// tslint:disable-next-line:radix
				lane.setPredecessor( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				// tslint:disable-next-line:radix
				lane.setSuccessor( parseInt( successorXml.attr_id ) );

			}
		}

		//  Read Width
		this.readAsOptionalArray( xmlElement.width, xml => {

			lane.addWidthRecordInstance( this.readLaneWidth( lane, xml ) );

		} );

		//  Read RoadMark
		this.readAsOptionalArray( xmlElement.roadMark, xml => {

			lane.addRoadMarkInstance( this.readLaneRoadMark( lane, xml ) );

		} );

		// //  Read material
		// this.readAsOptionalArray( xmlElement.material, xml => this.readLaneMaterial( lane, xml ) );
		//
		// //  Read visibility
		// this.readAsOptionalArray( xmlElement.visibility, xml => this.readLaneVisibility( lane, xml ) );
		//
		// //  Read speed
		// this.readAsOptionalArray( xmlElement.speed, xml => this.readLaneSpeed( lane, xml ) );
		//
		// //  Read access
		// this.readAsOptionalArray( xmlElement.access, xml => this.readLaneAccess( lane, xml ) );
		//
		// //  Read height
		// this.readAsOptionalArray( xmlElement.height, xml => this.readLaneHeight( lane, xml ) );

	}

	static readLaneWidth ( lane: TvLane, json: any ) {

		const sOffset = parseFloat( json.attr_sOffset );

		const a = parseFloat( json.attr_a );
		const b = parseFloat( json.attr_b );
		const c = parseFloat( json.attr_c );
		const d = parseFloat( json.attr_d );

		return new TvLaneWidth( sOffset, a, b, c, d );
	}

	static readLaneRoadMark ( lane: TvLane, json: any ) {

		const sOffset = parseFloat( json.attr_sOffset );
		const type = json.attr_type;
		const weight = json.attr_weight;
		const color = json.attr_color;
		const width = parseFloat( json.attr_width );
		const laneChange = json.attr_laneChange;
		const height = json.attr_height;

		return new TvLaneRoadMark( sOffset, type, weight, color, width, laneChange, height, lane );
	}

}
