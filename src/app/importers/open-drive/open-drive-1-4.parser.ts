/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { TvConsole } from 'app/core/utils/console';
import { SnackBar } from 'app/services/snack-bar.service';
import { AbstractReader } from '../abstract-reader';
import { readXmlArray, readXmlElement } from '../../tools/xml-utils';
import { TvAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/tv-abstract-road-geometry';
import {
	EnumHelper,
	ObjectTypes,
	TvContactPoint,
	TvGeometryType,
	TvLaneSide,
	TvOrientation,
	TvRoadType,
	TvUnit,
	TvUserData
} from '../../modules/tv-map/models/tv-common';
import { TvController, TvControllerControl } from '../../modules/tv-map/models/tv-controller';
import { TvJunction } from '../../modules/tv-map/models/junctions/tv-junction';
import { TvJunctionConnection } from '../../modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionController } from '../../modules/tv-map/models/junctions/tv-junction-controller';
import { TvJunctionLaneLink } from '../../modules/tv-map/models/junctions/tv-junction-lane-link';
import { TvJunctionPriority } from '../../modules/tv-map/models/junctions/tv-junction-priority';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { TvMapHeader } from '../../modules/tv-map/models/tv-map-header';
import { TvMap } from '../../modules/tv-map/models/tv-map.model';
import { TvObjectMarking } from '../../modules/tv-map/models/tv-object-marking';
import { TvPlaneView } from '../../modules/tv-map/models/tv-plane-view';
import { TvRoadLinkChild, TvRoadLinkChildType } from '../../modules/tv-map/models/tv-road-link-child';
import { TvRoadObject } from '../../modules/tv-map/models/objects/tv-road-object';
import { TvRoadSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { TvRoadTypeClass } from '../../modules/tv-map/models/tv-road-type.class';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { SignShapeType } from '../../modules/tv-map/services/tv-sign.service';
import { TvCornerRoad } from "../../modules/tv-map/models/objects/tv-corner-road";
import { TvObjectOutline } from "../../modules/tv-map/models/objects/tv-object-outline";
import { XmlElement } from "../xml.element";
import { IOpenDriveParser } from "./i-open-drive.parser";

@Injectable( {
	providedIn: 'root'
} )
export class OpenDrive14Parser extends AbstractReader implements IOpenDriveParser {

	private map: TvMap;

	constructor () {
		super();
	}

	/**
	 * Reads the data from the OpenDrive structure to a file
	 */
	parse ( xml: XmlElement ) {

		this.map = new TvMap();

		const openDRIVE: XmlElement = xml.OpenDRIVE;

		if ( !openDRIVE ) TvConsole.error( 'No OpenDRIVE tag found. Import Failed' );
		if ( !openDRIVE ) SnackBar.warn( 'No OpenDRIVE tag found. Import Failed' );
		if ( !openDRIVE ) return;

		if ( !openDRIVE.road ) TvConsole.error( 'No road tag found. Import Failed' );
		if ( !openDRIVE.road ) SnackBar.warn( 'No road tag found' );
		if ( !openDRIVE.road ) return;

		this.map.header = this.parseHeader( openDRIVE.header );

		readXmlArray( openDRIVE.controller, xml => {

			this.map.addControllerInstance( this.parseController( xml ) );

		} );

		readXmlArray( openDRIVE.junction, ( xml ) => {

			this.map.addJunctionInstance( this.parseJunction( xml ) );

		} );

		this.parseRoads( openDRIVE );

		readXmlArray( openDRIVE.junction, ( xml ) => {

			this.parseJunctionConnections( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

			this.parseJunctionPriorities( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

			this.parseJunctionControllers( this.map.getJunctionById( parseInt( xml.attr_id ) ), xml );

		} );

		return this.map;
	}

	/**
	 * The following methods are used to read the data from the XML file and fill in the the OpenDrive structure
	 * Methods follow the hierarchical structure and are called automatically when ReadFile is executed
	 */
	public parseHeader ( xmlElement: XmlElement ): TvMapHeader {

		const revMajor = parseFloat( xmlElement.attr_revMajor );
		const revMinor = parseFloat( xmlElement.attr_revMinor );
		const name = xmlElement.attr_name;
		const version = parseFloat( xmlElement.attr_version );
		const date = xmlElement.attr_date;
		const north = parseFloat( xmlElement.attr_north );
		const south = parseFloat( xmlElement.attr_south );
		const east = parseFloat( xmlElement.attr_east );
		const west = parseFloat( xmlElement.attr_west );
		const vendor = xmlElement.attr_vendor;

		return new TvMapHeader( revMajor, revMinor, name, version, date, north, south, east, west, vendor );
	}

	public parseRoad ( xml: XmlElement ) {

		const name = xml.attr_name;
		const length = parseFloat( xml.attr_length );
		const id = parseInt( xml.attr_id, 10 );

		const junctionId = parseInt( xml.attr_junction ) || -1;
		const junction = this.map.getJunctionById( junctionId );

		const road = new TvRoad( name, length, id, junction );

		if ( xml.link != null ) {

			this.parseRoadLinks( road, xml.link );

		}

		// Get type
		this.parseRoadTypes( road, xml );

		if ( !xml.planView ) SnackBar.error( 'no planView found, skipping road import' );
		if ( !xml.planView ) return;

		if ( !xml.planView?.geometry ) SnackBar.error( 'no geometry found, skipping road import' );
		if ( !xml.planView?.geometry ) return;

		this.parsePlanView( road, xml.planView );

		road.spline = this.makeSplineFromGeometry( road, road.planView.geometries );

		road.length = 0;

		road.spline.update();

		road.clearGeometries();

		road.spline.exportGeometries( true ).forEach( geometry => {

			road.addGeometry( geometry );

		} );

		if ( xml.elevationProfile != null ) this.parseElevationProfile( road, xml.elevationProfile );

		if ( xml.lateralProfile != null ) this.parseLateralProfile( road, xml.lateralProfile );

		if ( xml.lanes != null ) this.parseLanes( road, xml.lanes );


		readXmlArray( xml.objects?.object, xml => {
			road.addRoadObjectInstance( this.parseRoadObject( road, xml ) );
		} );

		if ( xml.signals ) this.parseSignals( road, xml.signals );

		if ( xml.surface != null && xml.surface !== '' ) this.parseSurface( road, xml.surface );

		return road;
	}

	public makeSplineFromGeometry ( road: TvRoad, geometries: TvAbstractRoadGeometry[] ): ExplicitSpline {

		const spline = new ExplicitSpline( road );

		if ( geometries.length === 0 ) return spline;

		let lastGeometry: TvAbstractRoadGeometry;

		for ( let i = 0; i < geometries.length; i++ ) {

			lastGeometry = geometries[ i ];

			spline.addFromFile( i, lastGeometry.startV3, lastGeometry.hdg, lastGeometry.geometryType, lastGeometry );
		}

		const lastCoord = lastGeometry.endCoord();

		spline.addFromFile( geometries.length, lastCoord.toVector3(), lastCoord.hdg, lastGeometry.geometryType, lastGeometry );

		spline.hide();

		spline.controlPoints.forEach( cp => cp.userData.roadId = road.id );

		spline.addRoadSegment( 0, road.id );

		return spline;
	}

	public parseRoads ( xmlElement: XmlElement ) {

		if ( xmlElement.road == null ) TvConsole.error( 'no roads found' );

		if ( xmlElement.road == null ) return;

		readXmlArray( xmlElement.road, ( xml ) => {

			const road = this.parseRoad( xml );

			if ( road ) this.map.addRoad( road );

		} );

	}

	public parseRoadLinks ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.predecessor != null ) {

			road.predecessor = this.parseRoadLinkChild( xmlElement.predecessor );

		}

		if ( xmlElement.successor != null ) {

			road.successor = this.parseRoadLinkChild( xmlElement.successor );

		}

		if ( xmlElement.neighbor != null ) {

			console.error( 'neighbour not supported' );

		}
	}

	public parseRoadLinkChild ( xmlElement: XmlElement ): TvRoadLinkChild {

		const elementType = this.parseElementType( xmlElement.attr_elementType );
		const elementId = parseFloat( xmlElement.attr_elementId );
		const contactPoint = this.parseContactPoint( xmlElement.attr_contactPoint );

		if ( !contactPoint ) TvConsole.error( 'no contact point found' );

		const elementS = parseFloat( xmlElement.attr_elementS );
		const elementDir = this.parseOrientation( xmlElement.attr_elementDir );

		const roadLink = new TvRoadLinkChild( elementType, elementId, contactPoint );

		if ( elementS != null ) {
			roadLink.elementS = elementS;
		}

		if ( elementDir != null ) {
			roadLink.elementDir = elementDir;
		}

		return roadLink;
	}

	public parseOrientation ( value: string ) {

		switch ( value ) {

			case '+':
				return TvOrientation.PLUS;

			case '-':
				return TvOrientation.MINUS;

			case 'none':
				return TvOrientation.NONE;

			default:
				return TvOrientation.PLUS;

		}

	}

	public parseElementType ( value: string ): TvRoadLinkChildType {

		if ( value === 'road' ) {

			return TvRoadLinkChildType.road;

		} else if ( value === 'junction' ) {

			return TvRoadLinkChildType.junction;

		} else {

			return null;

		}

	}

	public parseContactPoint ( value: string ): TvContactPoint {

		if ( value === 'start' ) {

			return TvContactPoint.START;

		} else if ( value === 'end' ) {

			return TvContactPoint.END;

		} else {

			return null;

		}

	}

	public parseRoadTypes ( road: TvRoad, xmlElement: XmlElement ) {

		// if ( !xmlElement.type ) console.warn( 'no road type tag not present' );

		readXmlArray( xmlElement.type, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );

			const roadType = TvRoadTypeClass.stringToTypes( xml.attr_type );

			let maxSpeed = 0;

			let unit = TvUnit.MILES_PER_HOUR;

			readXmlElement( xml.speed, xml => {

				maxSpeed = parseFloat( xml.attr_max );

				unit = EnumHelper.stringToOdUnits( xml.attr_unit );

			} );

			road.type.push( new TvRoadTypeClass( s, roadType, maxSpeed, unit ) );

		} );

		// add default if no road type inserted
		if ( road.type.length === 0 ) {

			road.setType( TvRoadType.TOWN, 40, TvUnit.MILES_PER_HOUR );

		}

	}

	public parsePlanView ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.geometry != null ) {

			if ( Array.isArray( xmlElement.geometry ) ) {

				for ( let i = 0; i < xmlElement.geometry.length; i++ ) {

					this.parseGeometryType( road, xmlElement.geometry[ i ] );

				}

			} else {

				this.parseGeometryType( road, xmlElement.geometry );

			}

		} else {

			SnackBar.error( 'No geometry found for road:' + road.id + '. Adding default line with length 1' );

			road.addGeometryLine( 0, 0, 0, 0, Math.max( road.length, 1 ) );

		}
	}

	public parseGeometryType ( road: TvRoad, xmlElement: XmlElement ) {

		if ( xmlElement.line != null ) {

			this.parseGeometryBlock( road, xmlElement, TvGeometryType.LINE );

		} else if ( xmlElement.arc != null ) {

			this.parseGeometryBlock( road, xmlElement, TvGeometryType.ARC );

		} else if ( xmlElement.spiral != null ) {

			this.parseGeometryBlock( road, xmlElement, TvGeometryType.SPIRAL );

		} else if ( xmlElement.poly3 != null ) {

			this.parseGeometryBlock( road, xmlElement, TvGeometryType.POLY3 );

		} else if ( xmlElement.paramPoly3 != null ) {

			this.parseGeometryBlock( road, xmlElement, TvGeometryType.PARAMPOLY3 );

		} else {

			console.error( 'unknown geometry type', xmlElement );

		}
	}

	public parseGeometryBlock ( road: TvRoad, xmlElement: XmlElement, geometryType: TvGeometryType ) {

		road.addPlanView();

		const planView = road.getPlanView();

		this.parseGeometry( planView, xmlElement, geometryType );
	}

	public parseGeometry ( planView: TvPlaneView, xmlElement: XmlElement, geometryType: TvGeometryType ) {

		const s = parseFloat( xmlElement.attr_s );
		const x = parseFloat( xmlElement.attr_x );
		const y = parseFloat( xmlElement.attr_y );
		const hdg = parseFloat( xmlElement.attr_hdg );
		const length = parseFloat( xmlElement.attr_length );

		// unsure of this, but works well so far
		// hdg += Maths.M_PI_2;

		// NO NEED FOR THIS
		// because of threejs co-ordinate system
		// x will become y and y will become x
		// const x = parsedX * -1;
		// const y = parsedY;

		switch ( geometryType ) {

			case TvGeometryType.LINE:

				planView.addGeometryLine( s, x, y, hdg, length );

				break;

			case TvGeometryType.SPIRAL:

				const curvStart = parseFloat( xmlElement.spiral.attr_curvStart );
				const curvEnd = parseFloat( xmlElement.spiral.attr_curvEnd );

				planView.addGeometrySpiral( s, x, y, hdg, length, curvStart, curvEnd );

				break;

			case TvGeometryType.ARC:

				const curvature = parseFloat( xmlElement.arc.attr_curvature );

				planView.addGeometryArc( s, x, y, hdg, length, curvature );

				break;

			case TvGeometryType.POLY3:

				const a = parseFloat( xmlElement.poly3.attr_a );
				const b = parseFloat( xmlElement.poly3.attr_b );
				const c = parseFloat( xmlElement.poly3.attr_c );
				const d = parseFloat( xmlElement.poly3.attr_d );

				planView.addGeometryPoly3( s, x, y, hdg, length, a, b, c, d );

				break;

			case TvGeometryType.PARAMPOLY3:

				const aU = parseFloat( xmlElement.paramPoly3.attr_aU );
				const bU = parseFloat( xmlElement.paramPoly3.attr_bU );
				const cU = parseFloat( xmlElement.paramPoly3.attr_cU );
				const dU = parseFloat( xmlElement.paramPoly3.attr_dU );

				const aV = parseFloat( xmlElement.paramPoly3.attr_aV );
				const bV = parseFloat( xmlElement.paramPoly3.attr_bV );
				const cV = parseFloat( xmlElement.paramPoly3.attr_cV );
				const dV = parseFloat( xmlElement.paramPoly3.attr_dV );

				planView.addGeometryParamPoly3( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV );

				break;

			default:
				console.error( 'unknown geometry type', geometryType );
				break;

		}

	}

	public parseController ( xmlElement: XmlElement ): TvController {

		const id = parseFloat( xmlElement.attr_id );
		const name = xmlElement.attr_name;
		const sequence = xmlElement.attr_sequence ? parseFloat( xmlElement.attr_sequence ) : null;

		const controller = new TvController( id, name, sequence );

		readXmlArray( xmlElement.control, xml => {

			controller.addControl( this.parseControl( xml ) );

		} );

		return controller;
	}

	public parseJunction ( xmlElement: XmlElement ): TvJunction {

		const name = xmlElement.attr_name;
		const id = parseInt( xmlElement.attr_id );

		return new TvJunction( name, id );

	}

	public parseJunctionConnections ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.connection, xml => {

			junction.addConnection( this.parseJunctionConnection( xml, junction ) );

		} );

	}

	public parseJunctionPriorities ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.priority, xml => {

			junction.addPriority( this.parseJunctionPriority( xml ) );

		} );

	}

	public parseJunctionControllers ( junction: TvJunction, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.controller, xml => {

			junction.addController( this.parseJunctionController( xml ) );

		} );

	}

	public parseJunctionConnection ( xmlElement: XmlElement, junction: TvJunction ) {

		const id = parseInt( xmlElement.attr_id );
		const incomingRoadId = parseInt( xmlElement.attr_incomingRoad );
		const connectingRoadId = parseInt( xmlElement.attr_connectingRoad );
		const contactPoint = this.parseContactPoint( xmlElement.attr_contactPoint );

		const incomingRoad = this.map.getRoadById( incomingRoadId );
		const connectingRoad = this.map.getRoadById( connectingRoadId );

		const outgoingRoadId = contactPoint == TvContactPoint.START ?
			connectingRoad?.successor?.elementId :
			connectingRoad?.predecessor?.elementId;

		const outgoingRoad = outgoingRoadId ? this.map.getRoadById( outgoingRoadId ) : null;

		if ( !outgoingRoad ) console.warn( 'outgoingRoad', outgoingRoad, connectingRoad );

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contactPoint, outgoingRoad );

		readXmlArray( xmlElement.laneLink, xml => {

			connection.addLaneLink( this.parseJunctionConnectionLaneLink( xml, junction, connection ) );

		} );

		return connection;
	}

	public parseJunctionConnectionLaneLink ( xmlElement: XmlElement, junction: TvJunction, connection: TvJunctionConnection ): TvJunctionLaneLink {

		const from = parseInt( xmlElement.attr_from );
		const to = parseInt( xmlElement.attr_to );

		return connection.makeLaneLink( junction, from, to );
	}

	public parseJunctionPriority ( xmlElement: XmlElement ): TvJunctionPriority {

		const high = parseInt( xmlElement.attr_high );
		const low = parseInt( xmlElement.attr_low );

		return new TvJunctionPriority( high, low );
	}

	public parseJunctionController ( xmlElement: XmlElement ): TvJunctionController {

		const id = parseInt( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const sequence = parseInt( xmlElement.attr_sequence );

		return new TvJunctionController( id, type, sequence );
	}

	public parseElevationProfile ( road: TvRoad, xmlElement: XmlElement ) {

		road.addElevationProfile();

		readXmlArray( xmlElement.elevation, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			road.addElevation( s, a, b, c, d );

		} );

	}

	public parseLateralProfile ( road: TvRoad, xmlElement: XmlElement ) {

	}

	public parseLanes ( road: TvRoad, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.laneSection, ( xml ) => {

			this.parseLaneSection( road, xml );

		} );

		readXmlArray( xmlElement.laneOffset, ( xml ) => {

			this.parseLaneOffset( road, xml );

		} );

		// if ( xmlElement.laneSection != null ) {
		//
		//     if ( Array.isArray( xmlElement.laneSection ) ) {
		//
		//         for ( let i = 0; i < xmlElement.laneSection.length; i++ ) {
		//
		//             this.parseLaneSections( road, xmlElement.laneSection[i] );
		//
		//         }
		//
		//     } else {
		//
		//         this.parseLaneSections( road, xmlElement.laneSection );
		//
		//     }
		// }
	}

	public parseRoadObject ( road: TvRoad, xmlElement: XmlElement ): TvRoadObject {

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

		readXmlArray( xmlElement.outlines?.outline, xml => {

			roadObject.outlines.push( this.parseObjectOutline( xml, road ) );

		} );

		readXmlArray( xmlElement.markings?.marking, xml => {

			roadObject.markings.push( this.parseObjectMarking( xml, road ) );

		} );

		roadObject.userData = this.parseUserData( xmlElement );

		this.parseRoadObjectRepeatArray( roadObject, xmlElement );

		return roadObject;
	}

	public parseObjectMarking ( xml: XmlElement, road: TvRoad ): TvObjectMarking {

		const color = xml.attr_color;
		const spaceLength = parseFloat( xml.attr_spaceLength );
		const lineLength = parseFloat( xml.attr_lineLength );
		const side = xml.attr_side;
		const weight = xml.attr_weight;
		const startOffset = parseFloat( xml.attr_startOffset );
		const stopOffset = parseFloat( xml.attr_stopOffset );
		const zOffset = parseFloat( xml.attr_zOffset );
		const width = parseFloat( xml.attr_width );

		const marking = new TvObjectMarking( color, spaceLength, lineLength, side, weight, startOffset, stopOffset, zOffset, width );

		readXmlArray( xml.cornerReference, xml => {
			marking.cornerReferences.push( parseFloat( xml.attr_id ) );
		} );

		return marking;
	}

	public parseObjectOutline ( xml: XmlElement, road: TvRoad ): TvObjectOutline {

		const outline = new TvObjectOutline();

		outline.id = parseFloat( xml.attr_id );

		readXmlArray( xml.cornerRoad, xml =>
			outline.cornerRoad.push( this.parseCornerRoad( xml, road ) )
		);

		return outline;
	}

	public parseCornerRoad ( xml: XmlElement, road: TvRoad ): TvCornerRoad {

		const id = parseFloat( xml.attr_id );
		const s = parseFloat( xml.attr_s );
		const t = parseFloat( xml.attr_t );
		const dz = parseFloat( xml.attr_dz );
		const height = parseFloat( xml.attr_height );

		const corner = new TvCornerRoad( id, road, s, t, dz, height );

		corner.hide();	// by default we want to hide corner points during import

		return corner;
	}

	public parseRoadObjectRepeatArray ( roadObject: TvRoadObject, xmlElement: XmlElement ): void {

		if ( xmlElement.repeat != null && xmlElement.repeat !== '' ) {

			if ( Array.isArray( xmlElement.repeat ) ) {

				for ( let i = 0; i < xmlElement.repeat.length; i++ ) {

					this.parseRoadObjectRepeat( roadObject, xmlElement.repeat[ i ] );

				}

			} else {

				this.parseRoadObjectRepeat( roadObject, xmlElement );

			}

		}

	}

	public parseRoadObjectRepeat ( roadObject: TvRoadObject, xmlElement: XmlElement ): void {

		const s = parseFloat( xmlElement.attr_s );
		const length = parseFloat( xmlElement.attr_length );
		const distance = parseFloat( xmlElement.attr_distance );
		const tStart = parseFloat( xmlElement.attr_tStart );
		const tEnd = parseFloat( xmlElement.attr_tEnd );
		const widthStart = parseFloat( xmlElement.attr_widthStart );
		const widthEnd = parseFloat( xmlElement.attr_widthEnd );
		const heightStart = parseFloat( xmlElement.attr_heightStart );
		const heightEnd = parseFloat( xmlElement.attr_heightEnd );
		const zOffsetStart = parseFloat( xmlElement.attr_zOffsetStart );
		const zOffsetEnd = parseFloat( xmlElement.attr_zOffsetEnd );

		roadObject.addRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

	}

	public parseSignals ( road: TvRoad, xmlElement: XmlElement ) {

		readXmlArray( xmlElement.signal, x => this.parseSignal( road, x ) );

	}

	public parseSignal ( road: TvRoad, xmlElement: XmlElement ) {

		const s = parseFloat( xmlElement.attr_s );
		const t = xmlElement.attr_t;
		const id = xmlElement.attr_id;
		const name = xmlElement.attr_name;
		const dynamic = xmlElement.attr_dynamic;
		const orientation = xmlElement.attr_orientation;
		const zOffset = xmlElement.attr_zOffset;
		const country = xmlElement.attr_country;
		const type = xmlElement.attr_type;
		const subtype = xmlElement.attr_subtype;
		const value = xmlElement.attr_value;
		const unit = xmlElement.attr_unit;
		const height = xmlElement.attr_height;
		const width = xmlElement.attr_width;
		const text = xmlElement.attr_text;
		const hOffset = xmlElement.attr_hOffset;
		const pitch = xmlElement.attr_pitch;
		const roll = xmlElement.attr_roll;

		const roadSignal = road.addRoadSignal( s,
			t,
			id,
			name,
			dynamic,
			orientation,
			zOffset,
			country,
			type,
			subtype,
			value,
			unit,
			height,
			width,
			text,
			hOffset,
			pitch,
			roll
		);

		this.parseSignalValidity( roadSignal, xmlElement );

		this.parseSignalDependency( roadSignal, xmlElement );

		roadSignal.userData = this.parseUserData( xmlElement );

		if ( roadSignal.userDataMap.has( 'sign_shape' ) ) {

			const signShape = roadSignal.userDataMap.get( 'sign_shape' );

			roadSignal.signShape = SignShapeType[ signShape.attr_value ] as SignShapeType;

		}
	}

	public parseSignalValidity ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		if ( xmlElement.validity != null && xmlElement.validity !== '' ) {

			if ( Array.isArray( xmlElement.validity ) ) {

				for ( let i = 0; i < xmlElement.validity.length; i++ ) {

					const validity = xmlElement.validity[ i ];

					signal.addValidity( parseFloat( validity.attr_fromLane ), parseFloat( validity.attr_toLane ) );

				}

			} else {

				const validity = xmlElement.validity;

				signal.addValidity( parseFloat( validity.attr_fromLane ), parseFloat( validity.attr_toLane ) );

			}
		}
	}

	public parseSignalDependency ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		if ( xmlElement.dependency != null && xmlElement.dependency !== '' ) {

			if ( Array.isArray( xmlElement.dependency ) ) {

				for ( let i = 0; i < xmlElement.dependency.length; i++ ) {

					const dependency = xmlElement.dependency[ i ];

					signal.addDependency( parseFloat( dependency.attr_id ), dependency.attr_type );

				}

			} else {

				const dependency = xmlElement.dependency;

				signal.addDependency( parseFloat( dependency.attr_id ), dependency.attr_type );

			}
		}
	}

	public parseSurface ( road: TvRoad, xmlElement: XmlElement ) {

	}

	public parseLaneSection ( road: TvRoad, xmlElement: XmlElement ) {

		const s = parseFloat( xmlElement.attr_s );
		const singleSide = xmlElement.attr_singleSide == 'true';

		road.addLaneSection( s, singleSide );

		const laneSection = road.getLastAddedLaneSection();

		readXmlElement( xmlElement.left, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.LEFT );
			} );
		} );

		readXmlElement( xmlElement.center, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.CENTER );
			} );
		} );

		readXmlElement( xmlElement.right, xml => {
			readXmlArray( xml.lane, xml => {
				this.parseLane( laneSection, xml, TvLaneSide.RIGHT );
			} );
		} );

	}

	public parseLane ( laneSection: TvLaneSection, xmlElement: XmlElement, laneSide: TvLaneSide ): TvLane {

		const id = parseFloat( xmlElement.attr_id );
		const type = xmlElement.attr_type;
		const level = xmlElement.attr_level == 'true';

		laneSection.addLane( laneSide, id, type, level, false );

		const lane = laneSection.getLastAddedLane();

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				lane.setPredecessor( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				lane.setSuccessor( parseInt( successorXml.attr_id ) );

			}
		}

		//  Read Width
		readXmlArray( xmlElement.width, xml => this.parseLaneWidth( lane, xml ) );

		//  Read RoadMark
		readXmlArray( xmlElement.roadMark, xml => this.parseLaneRoadMark( lane, xml ) );

		//  Read material
		readXmlArray( xmlElement.material, xml => this.parseLaneMaterial( lane, xml ) );

		//  Read visibility
		readXmlArray( xmlElement.visibility, xml => this.parseLaneVisibility( lane, xml ) );

		//  Read speed
		readXmlArray( xmlElement.speed, xml => this.parseLaneSpeed( lane, xml ) );

		//  Read access
		readXmlArray( xmlElement.access, xml => this.parseLaneAccess( lane, xml ) );

		//  Read height
		readXmlArray( xmlElement.height, xml => this.parseLaneHeight( lane, xml ) );

		return lane;
	}

	public parseLaneWidth ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );

		const a = parseFloat( xmlElement.attr_a );
		const b = parseFloat( xmlElement.attr_b );
		const c = parseFloat( xmlElement.attr_c );
		const d = parseFloat( xmlElement.attr_d );

		lane.addWidthRecord( sOffset, a, b, c, d );

	}

	public parseLaneRoadMark ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const type = xmlElement.attr_type;
		const weight = xmlElement.attr_weight;
		const color = xmlElement.attr_color;
		const width = parseFloat( xmlElement.attr_width );
		const laneChange = xmlElement.attr_laneChange;
		const height = xmlElement.attr_height;

		lane.addRoadMarkRecord( sOffset, type, weight, color, width, laneChange, height );

	}

	public parseLaneMaterial ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const surface = xmlElement.attr_surface;
		const friction = parseFloat( xmlElement.attr_friction );
		const roughness = parseFloat( xmlElement.attr_roughness );

		lane.addMaterialRecord( sOffset, surface, friction, roughness );

	}

	public parseLaneVisibility ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const forward = parseFloat( xmlElement.attr_forward );
		const back = parseFloat( xmlElement.attr_back );
		const left = parseFloat( xmlElement.attr_left );
		const right = parseFloat( xmlElement.attr_right );

		lane.addVisibilityRecord( sOffset, forward, back, left, right );

	}

	public parseLaneSpeed ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const max = parseFloat( xmlElement.attr_max );
		const unit = xmlElement.attr_unit;

		lane.addSpeedRecord( sOffset, max, unit );

	}

	public parseLaneAccess ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const restriction = xmlElement.attr_restriction;

		lane.addAccessRecord( sOffset, restriction );

	}

	public parseLaneHeight ( lane: TvLane, xmlElement: XmlElement ) {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const inner = parseFloat( xmlElement.attr_inner );
		const outer = parseFloat( xmlElement.attr_outer );

		lane.addHeightRecord( sOffset, inner, outer );

	}

	public parseUserData ( xmlElement: XmlElement ): TvUserData[] {

		const response: TvUserData[] = [];

		if ( xmlElement.userData != null ) {

			if ( Array.isArray( xmlElement.userData ) ) {

				for ( let i = 0; i < xmlElement.userData.length; i++ ) {

					const userData = xmlElement.userData[ i ];

					response.push( new TvUserData( userData.attr_code, userData.attr_value ) );

				}

			} else {

				response.push( new TvUserData( xmlElement.userData.attr_code, xmlElement.userData.attr_value ) );

			}

		}

		return response;

	}

	public parseLaneOffset ( road: TvRoad, xml: XmlElement ) {

		const s = parseFloat( xml.attr_s );
		const a = parseFloat( xml.attr_a );
		const b = parseFloat( xml.attr_b );
		const c = parseFloat( xml.attr_c );
		const d = parseFloat( xml.attr_d );

		road.addLaneOffset( s, a, b, c, d );
	}

	public parseControl ( xml: XmlElement ): TvControllerControl {

		const signalId = parseFloat( xml.attr_signalId );
		const type = xml.attr_type;

		return new TvControllerControl( signalId, type );
	}
}
