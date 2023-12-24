/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvLaneSide } from '../modules/tv-map/models/tv-common';
import { TvLane } from '../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../modules/tv-map/models/tv-lane-road-mark';
import { TvLaneWidth } from '../modules/tv-map/models/tv-lane-width';
import { SnackBar } from '../services/snack-bar.service';
import { RoadStyle } from "../core/asset/road.style";
import { XmlElement } from "../importers/xml.element";
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { Injectable } from '@angular/core';
import { StorageService } from 'app/io/storage.service';
import { readXmlArray, readXmlElement } from 'app/tools/xml-utils';
import { TvElevationProfile } from 'app/modules/tv-map/models/tv-elevation-profile';

@Injectable( {
	providedIn: 'root'
} )
export class RoadStyleImporter {

	constructor (
		private storageService: StorageService,
	) { }

	loadAsset ( asset: AssetNode ) {

		const contents = this.storageService.readSync( asset.path );

		const roadStyle = this.importFromString( contents );

		return roadStyle;

	}

	private importFromString ( contents: string ): RoadStyle {

		const roadStyleFile: any = JSON.parse( contents );

		// check for main elements first before parsing
		const version = roadStyleFile.version;

		if ( !version ) SnackBar.error( 'Cannot read road-style version. Please check file before importing', 'OK', 5000 );
		if ( !version ) return;

		return this.importRoadStyle( roadStyleFile );
	}

	private importRoadStyle ( json: XmlElement ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvRoadLaneOffset(
			json.laneOffset.attr_s || 0,
			json.laneOffset.attr_a || 0,
			json.laneOffset.attr_b || 0,
			json.laneOffset.attr_c || 0,
			json.laneOffset.attr_d || 0
		);

		roadStyle.laneSection = this.importLaneSection( json );

		roadStyle.elevationProfile = this.importElevationProfile( json );

		return roadStyle;
	}

	importElevationProfile ( json: XmlElement ): TvElevationProfile {

		const elevationProfile = new TvElevationProfile();

		readXmlArray( json.elevationProfile?.elevation, xml => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			elevationProfile.addElevation( s, a, b, c, d );

		} );

		return elevationProfile;
	}

	private importLaneSection ( json: XmlElement ): TvLaneSection {

		const laneSection = new TvLaneSection( 0, 0, true, null );

		readXmlElement( json.laneSection.left, xml => {
			readXmlArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.LEFT );
			} );
		} );

		readXmlElement( json.laneSection.center, xml => {
			readXmlArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.CENTER );
			} );
		} );

		readXmlElement( json.laneSection.right, xml => {
			readXmlArray( xml.lane, xml => {
				this.readLane( laneSection, xml, TvLaneSide.RIGHT );
			} );
		} );

		return laneSection;
	}

	private readLane ( laneSection: TvLaneSection, xmlElement: any, laneSide: TvLaneSide ) {

		const id = parseFloat( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const level = xmlElement.attr_level == 'true';

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
		readXmlArray( xmlElement.width, xml => {

			lane.addWidthRecordInstance( this.readLaneWidth( lane, xml ) );

		} );

		//  Read RoadMark
		readXmlArray( xmlElement.roadMark, xml => {

			lane.addRoadMarkInstance( this.readLaneRoadMark( lane, xml ) );

		} );

		// //  Read material
		// this.readXmlArray( xmlElement.material, xml => this.readLaneMaterial( lane, xml ) );
		//
		// //  Read visibility
		// this.readXmlArray( xmlElement.visibility, xml => this.readLaneVisibility( lane, xml ) );
		//
		// //  Read speed
		// this.readXmlArray( xmlElement.speed, xml => this.readLaneSpeed( lane, xml ) );
		//
		// //  Read access
		// this.readXmlArray( xmlElement.access, xml => this.readLaneAccess( lane, xml ) );
		//
		// //  Read height
		// this.readXmlArray( xmlElement.height, xml => this.readLaneHeight( lane, xml ) );

	}

	private readLaneWidth ( lane: TvLane, json: XmlElement ) {

		const sOffset = parseFloat( json.attr_sOffset );

		const a = parseFloat( json.attr_a );
		const b = parseFloat( json.attr_b );
		const c = parseFloat( json.attr_c );
		const d = parseFloat( json.attr_d );

		return new TvLaneWidth( sOffset, a, b, c, d, lane );
	}

	private readLaneRoadMark ( lane: TvLane, json: XmlElement ) {

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
