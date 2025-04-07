/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { TvConsole } from 'app/core/utils/console';
import { SnackBar } from 'app/services/snack-bar.service';
import { readXmlArray, readXmlElement } from '../../utils/xml-utils';
import { TvAbstractRoadGeometry } from '../../map/models/geometries/tv-abstract-road-geometry';
import {
	EnumHelper,
	TvContactPoint,
	TvGeometryType,
	TvLaneSide,
	TvOrientation,
	TvRoadType,
	TvUnit
} from '../../map/models/tv-common';
import { TvUserData } from 'app/map/models/tv-user-data';
import { TvControllerControl, TvSignalController } from '../../map/signal-controller/tv-signal-controller';
import { TvJunction } from '../../map/models/junctions/tv-junction';
import { TvJunctionConnection } from '../../map/models/connections/tv-junction-connection';
import { TvJunctionController } from '../../map/models/junctions/tv-junction-controller';
import { TvJunctionLaneLink } from '../../map/models/junctions/tv-junction-lane-link';
import { TvJunctionPriority } from '../../map/models/junctions/tv-junction-priority';
import { TvLane } from '../../map/models/tv-lane';
import { TvLaneSection } from '../../map/models/tv-lane-section';
import { TvMapHeader } from '../../map/models/tv-map-header';
import { TvMap } from '../../map/models/tv-map.model';
import { TvObjectMarking } from '../../map/models/tv-object-marking';
import { TvPlaneView } from '../../map/models/tv-plane-view';
import { TvLink, TvLinkType } from '../../map/models/tv-link';
import { LinkFactory } from 'app/map/models/link-factory';
import { TvRoadObject } from '../../map/models/objects/tv-road-object';
import { TvRoadSignal } from '../../map/road-signal/tv-road-signal.model';
import { TvRoadTypeClass } from '../../map/models/tv-road-type.class';
import { TvRoad } from '../../map/models/tv-road.model';
import { TvCornerRoad } from "../../map/models/objects/tv-corner-road";
import { TvObjectOutline } from "../../map/models/objects/tv-object-outline";
import { XmlElement } from "../xml.element";
import { IOpenDriveParser } from "./i-open-drive.parser";
import { TvCornerLocal } from 'app/map/models/objects/tv-corner-local';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { TvLaneOffset } from "../../map/models/tv-lane-offset";
import { SplineFactory } from 'app/services/spline/spline.factory';
import { ModelNotFoundException } from 'app/exceptions/exceptions';
import { Log } from 'app/core/utils/log';
import { JunctionFactory } from 'app/factories/junction.factory';
import { findTurnTypeOfConnectingRoad } from 'app/map/models/connections/connection-utils';
import { ConnectionFactory } from 'app/factories/connection.factory';


@Injectable( {
	providedIn: 'root'
} )
export class OpenDrive14Parser implements IOpenDriveParser {

	protected map: TvMap;

	constructor ( private snackBar: SnackBar ) {

	}

	public parse ( xml: XmlElement ): TvMap {

		this.map = new TvMap();

		const openDRIVE: XmlElement = xml.OpenDRIVE;

		if ( !openDRIVE ) TvConsole.error( 'No OpenDRIVE tag found. Import Failed' );
		if ( !openDRIVE ) return;

		this.map.header = this.parseHeader( openDRIVE?.header );

		readXmlArray( openDRIVE.controller, xml => {

			this.map.addController( this.parseController( xml ) );

		} );

		readXmlArray( openDRIVE.junction, ( xml ) => {

			this.map.addJunction( this.parseJunction( xml ) );

		} );

		this.parseRoadsAndAddSplines( openDRIVE );

		this.parseRoadLinksAndConnect( openDRIVE );

		this.parseJunctionElements( openDRIVE );

		return this.map;

	}

	parseRoadsAndAddSplines ( openDRIVE: XmlElement ): void {

		readXmlArray( openDRIVE?.road, ( xml ) => {

			const road = this.parseRoad( xml );

			this.map.addRoad( road );

			if ( road.spline ) {

				this.map.addSpline( road.spline );

			} else {

				Log.error( 'Spline not found for road', road.toString() );

			}

		} );

	}

	parseRoadLinksAndConnect ( openDRIVE: XmlElement ): void {

		readXmlArray( openDRIVE?.road, ( xml ) => {

			try {

				const road = this.map.getRoad( parseInt( xml.attr_id ) );

				this.parseRoadLinks( road, xml.link );

			} catch ( error ) {

				if ( error instanceof ModelNotFoundException ) {

					Log.error( 'Road not found' );

				} else {

					Log.error( 'Unknown error : ' + error.message );

				}

			}

		} );

	}

	parseJunctionElements ( openDRIVE: XmlElement ): void {

		readXmlArray( openDRIVE?.junction, ( xml ) => {

			try {

				const junction = this.map.getJunction( parseInt( xml.attr_id ) );

				this.parseJunctionConnections( junction, xml );

				this.parseJunctionPriorities( junction, xml );

				this.parseJunctionControllers( junction, xml );

			} catch ( error ) {

				if ( error instanceof ModelNotFoundException ) {

					Log.error( 'Junction not found' );

				} else {

					Log.error( `Unknown error : ${ error.message }` );

				}

			}

		} );

	}

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

		const header = new TvMapHeader( revMajor, revMinor, name, version, date, north, south, east, west, vendor );

		if ( xmlElement.offset ) {
			header.positionOffset.x = parseFloat( xmlElement.offset.attr_x ) || 0;
			header.positionOffset.y = parseFloat( xmlElement.offset.attr_y ) || 0;
			header.positionOffset.z = parseFloat( xmlElement.offset.attr_z ) || 0;
			header.headingOffset = parseFloat( xmlElement.offset.attr_h ) || 0;
		}

		if ( xmlElement.geoReference ) {
			header.geoReference = xmlElement.geoReference;
		}

		return header;
	}

	private parseJunctionId ( value: any ): TvJunction {

		try {

			const id = parseInt( value ) || -1;

			return id > 0 ? this.map.getJunction( id ) : null;

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( 'Junction not found' );

			} else {

				Log.error( `Unknown error : ${ error.message }` );

			}

		}
	}

	public parseRoad ( xml: XmlElement ): TvRoad {

		const name = xml.attr_name;
		const length = parseFloat( xml.attr_length );
		const id = parseInt( xml.attr_id, 10 );
		const junction = this.parseJunctionId( xml.attr_junction );

		const road = new TvRoad( name, length, id, junction );

		road.trafficRule = TvRoad.stringToRule( xml.attr_trafficRule );

		this.parseRoadTypes( road, xml );

		if ( xml.planView ) this.parsePlanView( road, xml.planView );

		road.spline = SplineFactory.createExplicitSpline( road.getPlanView().getGeomtries(), road );

		if ( xml.elevationProfile != null ) this.parseElevationProfile( road, xml.elevationProfile );

		if ( xml.lateralProfile != null ) this.parseLateralProfile( road, xml );

		if ( xml.lanes != null ) this.parseLanes( road, xml.lanes );

		readXmlArray( xml.objects?.object, xml => {
			road.addRoadObject( this.parseRoadObject( road, xml ) );
		} );

		if ( xml.signals ) this.parseSignals( road, xml.signals );

		if ( xml.surface != null && xml.surface !== '' ) this.parseSurface( road, xml.surface );

		return road;
	}

	public parseRoadLinks ( road: TvRoad, xmlElement: XmlElement ): void {

		if ( xmlElement?.predecessor != null ) {

			const link = this.parseRoadLinkChild( xmlElement.predecessor );

			if ( !link ) TvConsole.error( `Predecessor not found for ${ road.toString() }` );

			road.setPredecessor( link );

		}

		if ( xmlElement?.successor != null ) {

			const link = this.parseRoadLinkChild( xmlElement.successor );

			if ( !link ) TvConsole.error( `Successor not found for ${ road.toString() }` );

			road.setSuccessor( link );

		}

		if ( xmlElement?.neighbor != null ) {

			Log.error( 'neighbour not supported' );

		}

	}

	public findRoad ( id: number ): TvRoad | null {

		try {

			return this.map.getRoad( id );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( `Road not found : ${ id }` );

			} else {

				Log.error( `Unknown error : ${ error.message }` );
			}

		}

	}

	public findJunction ( id: number ): TvJunction | null {

		try {

			return this.map.getJunction( id );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( 'Junction not found : ' + id );

			} else {

				Log.error( 'Unknown error : ' + error.message );
			}

		}

	}

	public parseRoadLinkChild ( xmlElement: XmlElement ): TvLink {

		const elementType = this.parseElementType( xmlElement.attr_elementType );
		const elementId = parseFloat( xmlElement.attr_elementId );
		const contactPoint = this.parseContactPoint( xmlElement.attr_contactPoint );

		const elementS = xmlElement.attr_elementS ? parseFloat( xmlElement.attr_elementS ) : null;
		const elementDir: TvOrientation = xmlElement.attr_elementDir ? this.parseOrientation( xmlElement.attr_elementDir ) : null;

		if ( elementType == TvLinkType.ROAD && contactPoint == null ) {
			Log.error( 'No contact point found for link', xmlElement );
			return;
		}

		let element = null;

		if ( elementType == TvLinkType.ROAD ) {

			element = this.findRoad( elementId );

		} else if ( elementType == TvLinkType.JUNCTION ) {

			element = this.findJunction( elementId );

		} else {

			TvConsole.error( 'unknown elementType' );
			return;

		}

		if ( !element ) {
			console.error( 'element not found', xmlElement );
			return;
		}

		const roadLink = LinkFactory.createLink( elementType, element, contactPoint );

		if ( elementS ) {
			roadLink.elementS = elementS;
		}

		if ( elementDir ) {
			roadLink.elementDir = elementDir;
		}

		return roadLink;
	}

	public parseOrientation ( value: string ): TvOrientation {

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

	public parseElementType ( value: string ): TvLinkType {

		if ( value === 'road' ) {

			return TvLinkType.ROAD;

		} else if ( value === 'junction' ) {

			return TvLinkType.JUNCTION;

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

	public parseRoadTypes ( road: TvRoad, xmlElement: XmlElement ): void {

		// if ( !xmlElement.type ) console.warn( 'no road type tag not present' );

		readXmlArray( xmlElement.type, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );

			const roadType = TvRoadTypeClass.stringToTypes( xml.attr_type );

			let maxSpeed = 40;

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

	public parsePlanView ( road: TvRoad, xmlElement: XmlElement ): void {

		if ( xmlElement.geometry != null ) {

			if ( Array.isArray( xmlElement.geometry ) ) {

				for ( let i = 0; i < xmlElement.geometry.length; i++ ) {

					this.parseGeometryType( road, xmlElement.geometry[ i ] );

				}

			} else {

				this.parseGeometryType( road, xmlElement.geometry );

			}

		} else {

			this.snackBar.error( `No geometry found for ${ road.toString() }. Adding default line with length 1` );

			road.getPlanView().addGeometryLine( 0, 0, 0, 0, Math.max( road.length, 1 ) );

		}
	}

	public parseGeometryType ( road: TvRoad, xmlElement: XmlElement ): void {

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

	public parseGeometryBlock ( road: TvRoad, xmlElement: XmlElement, geometryType: TvGeometryType ): void {

		const planView = road.getPlanView();

		this.parseGeometry( planView, xmlElement, geometryType );
	}

	public parseGeometry ( planView: TvPlaneView, xmlElement: XmlElement, geometryType: TvGeometryType ): void {

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

				const pRange = xmlElement.paramPoly3.attr_pRange;

				const aU = parseFloat( xmlElement.paramPoly3.attr_aU );
				const bU = parseFloat( xmlElement.paramPoly3.attr_bU );
				const cU = parseFloat( xmlElement.paramPoly3.attr_cU );
				const dU = parseFloat( xmlElement.paramPoly3.attr_dU );

				const aV = parseFloat( xmlElement.paramPoly3.attr_aV );
				const bV = parseFloat( xmlElement.paramPoly3.attr_bV );
				const cV = parseFloat( xmlElement.paramPoly3.attr_cV );
				const dV = parseFloat( xmlElement.paramPoly3.attr_dV );

				planView.addGeometryParamPoly3( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV, pRange );

				break;

			default:
				console.error( 'unknown geometry type', geometryType );
				break;

		}

	}

	public parseController ( xmlElement: XmlElement ): TvSignalController {

		const id = parseFloat( xmlElement.attr_id );
		const name = xmlElement.attr_name;
		const sequence = xmlElement.attr_sequence ? parseFloat( xmlElement.attr_sequence ) : null;

		const controls: TvControllerControl[] = [];

		readXmlArray( xmlElement.control, xml => controls.push( this.parseControl( xml ) ) );

		return new TvSignalController( id, name, sequence, controls );
	}

	public parseJunction ( xmlElement: XmlElement ): TvJunction {

		const name = xmlElement.attr_name;
		const id = parseInt( xmlElement.attr_id );
		const type = TvJunction.stringToType( xmlElement.attr_type );

		return JunctionFactory.createByType( type, name, id );

	}

	public parseJunctionConnections ( junction: TvJunction, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.connection, xml => {

			const connection = this.parseJunctionConnection( xml, junction );

			if ( connection ) junction.addConnection( connection );

		} );

		junction.updateCornerConnections();

	}

	public parseJunctionPriorities ( junction: TvJunction, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.priority, xml => {

			junction.addPriority( this.parseJunctionPriority( xml ) );

		} );

	}

	public parseJunctionControllers ( junction: TvJunction, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.controller, xml => {

			junction.controllers.push( this.parseJunctionController( xml ) );

		} );

	}

	public parseJunctionConnection ( xmlElement: XmlElement, junction: TvJunction ): TvJunctionConnection {

		const id = parseInt( xmlElement.attr_id );
		const incomingRoadId = parseInt( xmlElement.attr_incomingRoad );
		const connectingRoadId = parseInt( xmlElement.attr_connectingRoad );
		const linkedRoadId = parseInt( xmlElement.attr_linkedRoad );

		const contactPoint = this.parseContactPoint( xmlElement.attr_contactPoint );

		const linkedRoad = !isNaN( linkedRoadId ) ? this.map.getRoad( linkedRoadId ) : null;
		const incomingRoad = !isNaN( incomingRoadId ) ? this.map.getRoad( incomingRoadId ) : null;
		const connectingRoad = !isNaN( connectingRoadId ) ? this.map.getRoad( connectingRoadId ) : linkedRoad;

		if ( !incomingRoad ) {
			TvConsole.error( "Incoming road not found" );
			return;
		}

		if ( !connectingRoad && !linkedRoad ) {
			TvConsole.error( "Connecting/Linked road not found" );
			return;
		}

		const turnType = findTurnTypeOfConnectingRoad( connectingRoad );

		const connection = ConnectionFactory.createConnectionOfType( turnType, { id, incomingRoad, connectingRoad, contactPoint } );

		readXmlArray( xmlElement.laneLink, xml => {

			try {

				connection.addLaneLink( this.parseJunctionConnectionLaneLink( xml, junction, connection ) );

			} catch ( error ) {

				Log.error( 'Error parsing lane link', error );

			}

		} );

		return connection;
	}

	private parseJunctionConnectionLaneLink ( xmlElement: XmlElement, junction: TvJunction, connection: TvJunctionConnection ): TvJunctionLaneLink {

		const fromLaneId = parseInt( xmlElement.attr_from );
		const toLaneId = parseInt( xmlElement.attr_to );

		function findContactPoint ( incomingRoad: TvRoad ): TvContactPoint {

			if ( connection.connectingRoad.successor?.equals( incomingRoad ) ) {
				return connection.connectingRoad.successor.contactPoint;
			}

			if ( connection.connectingRoad.predecessor?.equals( incomingRoad ) ) {
				return connection.connectingRoad.predecessor.contactPoint;
			}

			if ( incomingRoad.successor?.equals( junction ) ) {
				return TvContactPoint.END;
			}

			if ( incomingRoad.predecessor?.equals( junction ) ) {
				return TvContactPoint.START;
			}

			throw new Error( 'contact point not found' );
		}

		const incomingContactPoint = findContactPoint( connection.incomingRoad );
		const incomingLaneSection = connection.getIncomingRoad().getLaneSectionAt( incomingContactPoint );
		const connectionLaneSection = connection.getConnectingRoad().getLaneSectionAt( connection.contactPoint );

		const fromLane = incomingLaneSection.getLaneById( fromLaneId );
		const toLane = connectionLaneSection.getLaneById( toLaneId );

		return new TvJunctionLaneLink( fromLane, toLane );
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

	public parseElevationProfile ( road: TvRoad, xmlElement: XmlElement ): void {

		road.addElevationProfile();

		readXmlArray( xmlElement.elevation, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s );
			const a = parseFloat( xml.attr_a );
			const b = parseFloat( xml.attr_b );
			const c = parseFloat( xml.attr_c );
			const d = parseFloat( xml.attr_d );

			road.getElevationProfile().createAndAddElevation( s, a, b, c, d );

		} );

	}

	public parseLateralProfile ( road: TvRoad, xml: XmlElement ): void {

		readXmlArray( xml.superelevation, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s ) || 0;
			const a = parseFloat( xml.attr_a ) || 0;
			const b = parseFloat( xml.attr_b ) || 0;
			const c = parseFloat( xml.attr_c ) || 0;
			const d = parseFloat( xml.attr_d ) || 0;

			road.getLateralProfile().createSuperElevation( s, a, b, c, d );

		} );

		readXmlArray( xml.shape, ( xml: XmlElement ) => {

			const s = parseFloat( xml.attr_s ) || 0;
			const t = parseFloat( xml.attr_t ) || 0;
			const a = parseFloat( xml.attr_a ) || 0;
			const b = parseFloat( xml.attr_b ) || 0;
			const c = parseFloat( xml.attr_c ) || 0;
			const d = parseFloat( xml.attr_d ) || 0;

			road.getLateralProfile().addShape( s, t, a, b, c, d );

		} );

	}

	public parseLanes ( road: TvRoad, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.laneSection, ( xml ) => {

			this.parseLaneSection( road, xml );

		} );

		readXmlArray( xmlElement.laneOffset, ( xml ) => {

			road.laneOffsets.push( this.parseLaneOffset( xml ) );

		} );

	}

	public parseRoadObject ( road: TvRoad, xmlElement: XmlElement ): TvRoadObject {

		const type = TvRoadObject.stringToType( xmlElement.attr_type );
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

		const outline = new TvObjectOutline( parseInt( xml.attr_id ) );

		readXmlArray( xml.cornerRoad, xml =>
			outline.cornerRoads.push( this.parseCornerRoad( xml, road ) )
		);

		readXmlArray( xml.cornerLocal, xml =>
			outline.cornerLocals.push( this.parseCornerLocal( xml ) )
		);

		return outline;
	}

	parseCornerLocal ( xml: XmlElement ): TvCornerLocal {

		const id = parseFloat( xml.attr_id );
		const u = parseFloat( xml.attr_u );
		const v = parseFloat( xml.attr_v );
		const z = parseFloat( xml.attr_z );
		const height = parseFloat( xml.attr_height );

		return new TvCornerLocal( id, u, v, z, height );
	}

	public parseCornerRoad ( xml: XmlElement, road: TvRoad ): TvCornerRoad {

		const id = parseFloat( xml.attr_id );
		const s = parseFloat( xml.attr_s );
		const t = parseFloat( xml.attr_t );
		const dz = parseFloat( xml.attr_dz );
		const height = parseFloat( xml.attr_height );

		return new TvCornerRoad( id, road, s, t, dz, height );
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

	public parseSignals ( road: TvRoad, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.signal, x => this.parseSignal( road, x ) );

	}

	public parseSignal ( road: TvRoad, xmlElement: XmlElement ): void {

		const id = parseInt( xmlElement.attr_id );
		const name = xmlElement.attr_name;
		const country = xmlElement.attr_country;
		const type = xmlElement.attr_type;
		const subtype = xmlElement.attr_subtype;
		const text = xmlElement.attr_text;

		// this could be a number or text so we need to check
		const value = parseFloat( xmlElement.attr_value ) || xmlElement.attr_value;
		const unit = TvRoadSignal.stringToUnit( xmlElement.attr_unit );

		// position
		const s = parseFloat( xmlElement.attr_s ) || 0;
		const t = parseFloat( xmlElement.attr_t ) || 0;
		const zOffset = parseFloat( xmlElement.attr_zOffset ) || 0;

		// dimensions
		const height = parseFloat( xmlElement.attr_height ) || 0;
		const width = parseFloat( xmlElement.attr_width ) || 0;

		// rotation
		const hOffset = parseFloat( xmlElement.attr_hOffset ) || 0;
		const pitch = parseFloat( xmlElement.attr_pitch ) || 0;
		const roll = parseFloat( xmlElement.attr_roll ) || 0;

		const dynamic = TvRoadSignal.stringToDynamicType( xmlElement.attr_dynamic );
		const orientation = TvRoadSignal.stringToOrientation( xmlElement.attr_orientation )

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

		this.parseUserData( xmlElement ).forEach( i => roadSignal.userData.set( i.code, i.value ) );

		if ( !roadSignal.assetGuid && roadSignal.userData.has( 'assetGuid' ) ) {

			roadSignal.assetGuid = roadSignal.userData.get( 'assetGuid' ) as string;

		}
	}

	public parseSignalValidity ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.validity, xml => {

			signal.addValidity( parseFloat( xml.attr_fromLane ), parseFloat( xml.attr_toLane ) );

		} );

	}

	public parseSignalDependency ( signal: TvRoadSignal, xmlElement: XmlElement ): void {

		readXmlArray( xmlElement.dependency, xml => {

			signal.addDependency( parseFloat( xml.attr_id ), xml.attr_type );

		} );

	}

	public parseSurface ( road: TvRoad, xmlElement: XmlElement ): void {

	}

	public parseLaneSection ( road: TvRoad, xmlElement: XmlElement ): void {

		const id = road.laneSections.length + 1;
		const s = parseFloat( xmlElement.attr_s );
		const singleSide = xmlElement.attr_singleSide == 'true';

		const laneSection = new TvLaneSection( id, s, singleSide, road );

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

		road.getLaneProfile().addLaneSection( laneSection );
	}

	public parseLane ( laneSection: TvLaneSection, xmlElement: XmlElement, laneSide: TvLaneSide ): TvLane {

		const id = parseFloat( xmlElement.attr_id );
		const type = TvLane.stringToType( xmlElement.attr_type );
		const level = xmlElement.attr_level == 'true';

		const lane = laneSection.createLane( laneSide, id, type, level, false );

		if ( xmlElement.link != null ) {

			const predecessorXml = xmlElement.link.predecessor;
			const successorXml = xmlElement.link.successor;

			if ( predecessorXml != null ) {

				lane.predecessorId = ( parseInt( predecessorXml.attr_id ) );

			}

			if ( successorXml != null ) {

				lane.successorId = ( parseInt( successorXml.attr_id ) );

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

	public parseLaneWidth ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );

		const a = parseFloat( xmlElement.attr_a );
		const b = parseFloat( xmlElement.attr_b );
		const c = parseFloat( xmlElement.attr_c );
		const d = parseFloat( xmlElement.attr_d );

		lane.addWidthRecord( sOffset, a, b, c, d );

	}

	public parseLaneRoadMark ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const type = xmlElement.attr_type;
		const weight = xmlElement.attr_weight;
		const color = xmlElement.attr_color;
		const width = parseFloat( xmlElement.attr_width );
		const laneChange = TvLaneRoadMark.laneChangeFromString( xmlElement.attr_laneChange );
		const height = xmlElement.attr_height;

		lane.addRoadMarkRecord( sOffset, type, weight, color, width, laneChange, height );

	}

	public parseLaneMaterial ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const surface = xmlElement.attr_surface;
		const friction = parseFloat( xmlElement.attr_friction );
		const roughness = parseFloat( xmlElement.attr_roughness );

		lane.addMaterialRecord( sOffset, surface, friction, roughness );

	}

	public parseLaneVisibility ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const forward = parseFloat( xmlElement.attr_forward );
		const back = parseFloat( xmlElement.attr_back );
		const left = parseFloat( xmlElement.attr_left );
		const right = parseFloat( xmlElement.attr_right );

		lane.addVisibilityRecord( sOffset, forward, back, left, right );

	}

	public parseLaneSpeed ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const max = parseFloat( xmlElement.attr_max );
		const unit = xmlElement.attr_unit;

		lane.addSpeedRecord( sOffset, max, unit );

	}

	public parseLaneAccess ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const restriction = xmlElement.attr_restriction;

		lane.addAccessRecord( sOffset, restriction );

	}

	public parseLaneHeight ( lane: TvLane, xmlElement: XmlElement ): void {

		const sOffset = parseFloat( xmlElement.attr_sOffset );
		const inner = parseFloat( xmlElement.attr_inner );
		const outer = parseFloat( xmlElement.attr_outer );

		lane.addHeightRecord( sOffset, inner, outer );

	}

	public parseUserData ( xmlElement: XmlElement ): TvUserData[] {

		const response: TvUserData[] = [];

		readXmlArray( xmlElement.userData, xml => {

			response.push( new TvUserData( xml.attr_code, xml.attr_value ) );

		} );

		return response;

	}

	public parseLaneOffset ( xml: XmlElement ): TvLaneOffset {

		const s = parseFloat( xml.attr_s );
		const a = parseFloat( xml.attr_a );
		const b = parseFloat( xml.attr_b );
		const c = parseFloat( xml.attr_c );
		const d = parseFloat( xml.attr_d );

		return new TvLaneOffset( s, a, b, c, d );
	}

	public parseControl ( xml: XmlElement ): TvControllerControl {

		const signalId = parseFloat( xml.attr_signalId );
		const type = xml.attr_type;

		return new TvControllerControl( signalId, type );
	}
}
