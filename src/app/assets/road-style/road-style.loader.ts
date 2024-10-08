/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneOffset } from 'app/map/models/tv-lane-offset';
import { TvLaneSide } from '../../map/models/tv-common';
import { TvLane } from '../../map/models/tv-lane';
import { TvLaneRoadMark } from '../../map/models/tv-lane-road-mark';
import { TvLaneWidth } from '../../map/models/tv-lane-width';
import { SnackBar } from '../../services/snack-bar.service';
import { RoadStyle } from "./road-style.model";
import { XmlElement } from "../../importers/xml.element";
import { Asset } from 'app/assets/asset.model';
import { Injectable } from '@angular/core';
import { StorageService } from 'app/io/storage.service';
import { readXmlArray, readXmlElement } from 'app/utils/xml-utils';
import { TvElevationProfile } from 'app/map/road-elevation/tv-elevation-profile.model';
import { AssetLoader } from "../../core/interfaces/asset.loader";
import { OpenDrive16Parser } from 'app/importers/open-drive/open-drive-1-6.parser';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';

@Injectable( {
	providedIn: 'root'
} )
export class RoadStyleLoader implements AssetLoader {

	constructor (
		private storageService: StorageService,
		private snackBar: SnackBar,
		private openDriveParser: OpenDrive16Parser,
	) {
	}

	load ( asset: Asset ) {

		const contents = this.storageService.readSync( asset.path );

		const roadStyle = this.importFromString( contents );

		return roadStyle;

	}

	private importFromString ( contents: string ): RoadStyle {

		const roadStyleFile: any = JSON.parse( contents );

		// check for main elements first before parsing
		const version = roadStyleFile.version;

		if ( !version ) this.snackBar.error( 'Cannot read road-style version. Please check file before importing', 'OK', 5000 );
		if ( !version ) return;

		return this.importRoadStyle( roadStyleFile );
	}

	private importRoadStyle ( json: XmlElement ): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = new TvLaneOffset(
			json.laneOffset.attr_s || 0,
			json.laneOffset.attr_a || 0,
			json.laneOffset.attr_b || 0,
			json.laneOffset.attr_c || 0,
			json.laneOffset.attr_d || 0
		);

		roadStyle.laneSection = this.importLaneSection( json );

		roadStyle.elevationProfile = this.importElevationProfile( json );

		readXmlArray( json.objects?.object, xml => roadStyle.objects.push( this.parseRoadObject( xml ) ) );

		return roadStyle;
	}

	parseRoadObject ( xmlElement: XmlElement ) {

		const type = xmlElement.attr_type;
		const name = xmlElement.attr_name;
		const id = parseFloat( xmlElement.attr_id ) || 0;
		const s = parseFloat( xmlElement.attr_s ) || 0;
		const t = parseFloat( xmlElement.attr_t ) || 0;
		const zOffset = parseFloat( xmlElement.attr_zOffset ) || 0.005;
		const validLength = parseFloat( xmlElement.attr_validLength ) || 0;

		const length = parseFloat( xmlElement.attr_length ) || 0;
		const width = parseFloat( xmlElement.attr_width ) || 0;
		const radius = parseFloat( xmlElement.attr_radius ) || 0;
		const height = parseFloat( xmlElement.attr_height ) || 0;
		const hdg = parseFloat( xmlElement.attr_hdg ) || 0;
		const pitch = parseFloat( xmlElement.attr_pitch ) || 0;
		const roll = parseFloat( xmlElement.attr_roll ) || 0;

		const orientation = TvRoadObject.orientationFromString( xmlElement.attr_orientation );

		const roadObject = new TvRoadObject( type, name, id, s, t, zOffset, validLength, orientation, length, width, radius, height, hdg, pitch, roll );

		roadObject.assetGuid = xmlElement.attr_assetGuid;

		this.openDriveParser.parseRoadObjectRepeatArray( roadObject, xmlElement );

		return roadObject;
	}

	importElevationProfile ( json: XmlElement ): TvElevationProfile {

		const elevationProfile = new TvElevationProfile();

		readXmlArray( json.elevationProfile?.elevation, xml => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			elevationProfile.createAndAddElevation( s, a, b, c, d );

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

		const lane = laneSection.createLane( laneSide, id, type, level, false );

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				// tslint:disable-next-line:radix
				lane.predecessorId = ( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				// tslint:disable-next-line:radix
				lane.successorId = ( parseInt( successorXml.attr_id ) );

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

		return new TvLaneWidth( sOffset, a, b, c, d );
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
