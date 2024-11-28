/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Vector2, Vector3 } from "three";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { SplineType } from 'app/core/shapes/spline-type';
import { SplineService } from "./spline.service";
import { SplineFactory } from "./spline.factory";
import { RoadFactory } from "../../factories/road-factory.service";
import { RoadCircleToolService } from 'app/tools/road-circle/road-circle-tool.service';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { JunctionFactory } from 'app/factories/junction.factory';
import { MapService } from '../map/map.service';
import { RoadService } from "../road/road.service";
import { JunctionService } from '../junction/junction.service';
import { SplineLinkService } from 'app/managers/spline-link.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LinkFactory } from 'app/map/models/link-factory';
import { JunctionToolHelper } from 'app/modules/junction/junction-tool.helper';
import { MapValidatorService } from '../map/map-validator.service';
import { HttpClient } from '@angular/common/http';
import { OpenDriveParserService } from 'app/importers/open-drive/open-drive-parser.service';
import { SplineGeometryService } from './spline-geometry.service';

export const STRAIGHT_XODR = 'assets/open-drive/straight-road.xml';
export const ROUNDABOUT_XODR = 'assets/open-drive/roundabout-8-course.xodr';
export const CROSSING8_XODR = 'assets/open-drive/crossing-8-course.xodr';
export const CROSSING8_COMPLEX_XODR = 'assets/open-drive/crossing-8-course.xodr';
export const EXPLICIT_CIRCLE_XODR = 'assets/open-drive/explicit-circle.xodr';

export const TOWN_01 = 'assets/open-drive/town-01.xodr';
export const TOWN_02 = 'assets/open-drive/town-02.xodr';
export const TOWN_03 = 'assets/open-drive/town-03.xodr';
export const TOWN_04 = 'assets/open-drive/town-04.xodr';
export const TOWN_05 = 'assets/open-drive/town-05.xodr';
export const TOWN_06 = 'assets/open-drive/town-06.xodr';
export const TOWN_07 = 'assets/open-drive/town-07.xodr';

export const FRENCH_SMALL_XODR = 'assets/stubs/french-small.xodr';
export const OSM2_XODR = 'assets/stubs/osm-2-xodr-small.xodr';

@Injectable( {
	providedIn: 'root'
} )
export class SplineTestHelper {

	constructor (
		public mapService: MapService,
		public splineService: SplineService,
		public roadService: RoadService,
		public roadFactory: RoadFactory,
		public junctionService: JunctionService,
		public junctionFactory: JunctionFactory,
		public cirleToolService: RoadCircleToolService,
		public splineLinkService: SplineLinkService,
		public junctionToolHelper: JunctionToolHelper,
		public mapValidator: MapValidatorService,
		public httpClient: HttpClient,
		public openDriveParser: OpenDriveParserService,
		public splineGeometryService: SplineGeometryService,
	) {
	}

	async loadStraightXodr () {

		const xml = await this.loadXodr( STRAIGHT_XODR ).toPromise();

		return this.openDriveParser.parse( xml );
	}

	async loadAndParseXodr ( path: string ) {

		const xml = await this.loadXodr( path ).toPromise();

		return this.openDriveParser.parse( xml );

	}

	loadXodr ( path: string ) {

		return this.httpClient.get( path, { responseType: 'text' } );

	}

	makeDefaultRoad ( points: Vector2[] ) {

		return this.roadFactory.createFromControlPoints( points );

	}

	makeRoad ( points: Vector2[], leftLaneCount = 1, rightLaneCount = 1, leftWidth = 3.6, rightWidth = 3.6 ) {

		const road = this.roadFactory.createRoadWithLaneCount( leftLaneCount, rightLaneCount, leftWidth, rightWidth );

		points.forEach( point => road.spline.controlPoints.push( new SplineControlPoint( null, new Vector3( point.x, point.y, 0 ) ) ) );

		return road;

	}

	createRoad ( points: Vector2[], leftLaneCount = 1, rightLaneCount = 1, leftWidth = 3.6, rightWidth = 3.6 ) {

		const road = this.makeRoad( points, leftLaneCount, rightLaneCount, leftWidth, rightWidth );

		this.splineService.add( road.spline );

		return road;

	}

	createDefaultRoad ( points: Vector2[] ) {

		const road = this.makeDefaultRoad( points );

		this.splineService.add( road.spline );

		return road;

	}

	addCircleRoad ( radius: number, center = new Vector3() ) {

		const end = new Vector3( center.x + radius, center.y, center.z );

		const roads = this.cirleToolService.createCircularRoads( center, end, radius );

		roads.forEach( road => this.splineService.add( road.spline ) );

	}

	private addCircleSpline ( radius: number, center = new Vector3() ) {

		const end = new Vector3( center.x + radius, center.y, center.z );

		const roads = this.cirleToolService.createCircularRoads( center, end, radius );

		const points: SplineControlPoint[] = [];

		roads.forEach( road => points.push( ...road.spline.controlPoints as SplineControlPoint[] ) );

		const spline = SplineFactory.createFromPoints( points );

		points.forEach( point => point.mainObject = point.spline = spline );

		this.splineService.add( spline );

		return spline;
	}

	addCircleSplineV2 ( radius: number, center = new Vector3() ) {

		const end = new Vector3( center.x + radius, center.y, center.z );

		const spline = SplineFactory.createFromPoints( [] );

		this.cirleToolService.createCirclePoints( center, end, radius ).forEach( position => {

			spline.addControlPoint( position );

		} );

		this.splineService.add( spline );

		return spline;
	}

	addStraightRoad ( start?: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		start = start || new Vector3( 0, 0, 0 );

		const spline = this.addStraightRoadSpline( start, length, degrees, type );

		return spline.getFirstSegment<TvRoad>();

	}

	createStraightRoad ( start?: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		start = start || new Vector3( 0, 0, 0 );

		const road = this.roadFactory.createDefaultRoad();

		const spline = road.spline = this.createStraightSpline( start, length, degrees, type );

		spline.addSegment( 0, road );

		return spline.getFirstSegment<TvRoad>();

	}

	addStraightRoadSpline ( start?: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		start = start || new Vector3( 0, 0, 0 );

		const road = this.roadFactory.createDefaultRoad();

		const spline = SplineFactory.createSpline( type );

		spline.addSegment( 0, road );

		road.spline = spline;

		this.mapService.addRoad( road );

		const controlPoints = ControlPointFactory.createStraightControlPoints( spline, start, length, degrees );

		spline.addControlPoints( controlPoints );

		this.splineService.add( spline );

		return spline;

	}

	createStraightSpline ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		const spline = SplineFactory.createStraightSplineAndPoints( start, length, degrees, type );

		return spline;

	}

	addStraightRoadsFacingEachOther ( start: Vector3 ) {

		const splineA = this.createStraightSpline( start, 50 );
		const splineB = this.createStraightSpline( new Vector3( start.x + 150, start.y, start.z ), 50, 180 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );

		return { splineA, splineB };
	}

	async addDefaultJunction ( random = false ): Promise<{ horizontal: AbstractSpline; vertical: AbstractSpline; }> {

		const horizontal = this.createStraightSpline( new Vector3( -50, 0, 0 ) );
		const vertical = this.createStraightSpline( new Vector3( 0, -50, 0 ), 100, 90 );

		await this.addInRandomOrder( [ horizontal, vertical ], random );

		return { horizontal, vertical };
	}

	addSixRoadJunction () {

		const splineA = this.createStraightSpline( new Vector3( -100, 0, 0 ), 200 );
		const splineB = this.createStraightSpline( new Vector3( 0, -100, 0 ), 200, 90 );
		const splineC = this.createStraightSpline( new Vector3( -100, -100, 0 ), 200, 45 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );
		this.splineService.add( splineC );
	}

	createSimpleTJunction () {

		const horizontal = this.createStraightSpline( new Vector3( -100, 0, 0 ), 200 );
		const vertical = this.createStraightSpline( new Vector3( 0, -100, 0 ), 100, 90 );

		this.splineService.add( horizontal );
		this.splineService.add( vertical );

		return { horizontal, vertical };
	}

	createUShape ( size = 50, reverse = false ): AbstractSpline {

		const sign = reverse ? -1 : 1;

		const positions = [
			new Vector3( -size, size * sign, 0 ),
			new Vector3( -size, -size * sign, 0 ),
			new Vector3( size, -size * sign, 0 ),
			new Vector3( size, size * sign, 0 )
		];

		const spline = SplineFactory.createFromPoints( [] );

		positions.forEach( position => spline.addControlPoint( position ) );

		this.splineService.add( spline );

		return spline;
	}

	createAngleT2RoadJunction () {

		const splineA = this.createStraightSpline( new Vector3( 0, 0, 0 ), 100, 90 );
		const splineB = this.createStraightSpline( new Vector3( 100, 0, 0 ), 135, 135 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );
	}

	async createAJunction ( random = false ) {

		const splineA = this.createStraightSpline( new Vector3( -100, 0, 0 ), 200 );
		const splineC = this.createStraightSpline( new Vector3( -50, -100, 0 ), 200, 65 );
		const splineB = this.createStraightSpline( new Vector3( 50, -100, 0 ), 200, 105 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );

	}

	createHShapeWithXJunctions (): { verticalLeft: AbstractSpline; verticalRight: AbstractSpline; horizontal: AbstractSpline; } {

		const verticalLeft = this.createStraightSpline( new Vector3( -100, -100, 0 ), 200, 90 );
		const verticalRight = this.createStraightSpline( new Vector3( 100, -100, 0 ), 200, 90 );

		const horizontal = this.createStraightSpline( new Vector3( -150, 0, 0 ), 300, 0 );

		this.splineService.add( verticalLeft );
		this.splineService.add( verticalRight );
		this.splineService.add( horizontal );

		return { verticalLeft, verticalRight, horizontal };
	}

	createHShapeWithTJunctions (): { verticalLeft: AbstractSpline; verticalRight: AbstractSpline; horizontal: AbstractSpline; } {

		const verticalLeft = this.createStraightSpline( new Vector3( -100, -100, 0 ), 200, 90 );
		const verticalRight = this.createStraightSpline( new Vector3( 100, -100, 0 ), 200, 90 );

		const horizontal = this.createStraightSpline( new Vector3( -200 / 2, 0, 0 ), 200, 0 );

		this.splineService.add( verticalLeft );
		this.splineService.add( verticalRight );
		this.splineService.add( horizontal );

		return { verticalLeft, verticalRight, horizontal };
	}

	async createXJunctionWithFourRoads ( random: boolean ) {


		/**
		 *
		 *
		 *
		 * 					   1
		 * 					   v
		 *
		 * ======= 0 =======> J 0,0,0 <====== 2 =======
		 *
		 *					   3
		 *
		 *
		 *
		 *
		 */

		// 4 roads coming from all directions and meeting at 0,0,0
		const splineA = this.createStraightSpline( new Vector3( -100, 0, 0 ), 100, 0 );
		const splineB = this.createStraightSpline( new Vector3( 0, 100, 0 ), 100, -90 );
		const splineC = this.createStraightSpline( new Vector3( 100, 0, 0 ), 100, 180 );
		const splineD = this.createStraightSpline( new Vector3( 0, -100, 0 ), 100, 90 );

		const splines = [ splineA, splineB, splineC, splineD ];

		await this.addInRandomOrder( splines, random );

	}

	async createXJunctionWithTwoRoads ( random: boolean, length = 200 ) {

		const splineA = this.createStraightSpline( new Vector3( -length * 0.5, 0, 0 ), length, 0 );
		const splineB = this.createStraightSpline( new Vector3( 0, -length * 0.5, 0 ), length, 90 );

		await this.addInRandomOrder( [ splineA, splineB ], random );

	}

	async createTJunctionWith3Roads ( random = false ) {

		const splineA = this.createStraightSpline( new Vector3( -100, 0, 0 ), 100 );
		const splineB = this.createStraightSpline( new Vector3( 0, 0, 0 ), 100 );
		const splineC = this.createStraightSpline( new Vector3( 0, -100, 0 ), 100, 90 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );
	}

	createDoubleTJunctionWith3Roads () {

		const horizontal = this.addStraightRoadSpline( new Vector3( -100, 0, 0 ), 300 );
		const verticalRight = this.addStraightRoadSpline( new Vector3( 100, -100, 0 ), 100, 90 );
		const verticalLeft = this.addStraightRoadSpline( new Vector3( 0, -100, 0 ), 100, 90 );

		return { horizontal, verticalRight, verticalLeft };
	}

	private async addInRandomOrder ( splines: AbstractSpline[], random = true ) {

		// shuffle the splines
		if ( random ) splines.sort( () => Math.random() - 0.5 );

		for ( let i = 0; i < splines.length; i++ ) {

			await this.delay( i * 100 );

			this.splineService.add( splines[ i ] );

		}


	}

	private delay ( ms: number ): Promise<void> {

		return new Promise( resolve => setTimeout( resolve, ms ) );

	}

	addCustomJunctionWith2Roads () {

		this.create2RoadsForCustomJunction();

		const leftRoad = this.mapService.findRoad( 1 );
		const rightRoad = this.mapService.findRoad( 2 );

		const links = [
			LinkFactory.createRoadLink( leftRoad, TvContactPoint.END ),
			LinkFactory.createRoadLink( rightRoad, TvContactPoint.START )
		]

		// TODO: use service or factory to create junction
		const junction = this.junctionToolHelper.createCustomJunction( links );

		this.junctionService.fireCreatedEvent( junction );

		return junction;

	}

	create2CustomJunctionWith3Roads () {

		const left = this.createStraightSpline( new Vector3( -120, 0, 0 ), 100 );
		const middle = this.createStraightSpline( new Vector3( 0, 0, 0 ), 100 );
		const right = this.createStraightSpline( new Vector3( 120, 0, 0 ), 100 );

		this.splineService.add( left );
		this.splineService.add( middle );
		this.splineService.add( right );

		const leftRoad = this.mapService.findRoad( 1 );
		const middleRoad = this.mapService.findRoad( 2 );
		const rightRoad = this.mapService.findRoad( 3 );

		const junction1 = this.junctionToolHelper.createCustomJunction( [
			LinkFactory.createRoadLink( leftRoad, TvContactPoint.END ),
			LinkFactory.createRoadLink( middleRoad, TvContactPoint.START ),
		] );

		const junction2 = this.junctionToolHelper.createCustomJunction( [
			LinkFactory.createRoadLink( middleRoad, TvContactPoint.END ),
			LinkFactory.createRoadLink( rightRoad, TvContactPoint.START )
		] );


		this.junctionService.fireCreatedEvent( junction1 );
		this.junctionService.fireCreatedEvent( junction2 );

	}

	create2RoadsForCustomJunction () {

		const left = this.createStraightSpline( new Vector3( -120, 0, 0 ), 100 );
		const right = this.createStraightSpline( new Vector3( 20, 0, 0 ), 100 );

		this.splineService.add( left );
		this.splineService.add( right );

		return { left, right };

	}

	create3RoadsForCustomJunction () {

		const left = this.createStraightSpline( new Vector3( -120, 0, 0 ), 100 );
		const right = this.createStraightSpline( new Vector3( 20, 0, 0 ), 100 );
		const bottom = this.createStraightSpline( new Vector3( 0, -120, 0 ), 100, 90 );

		this.splineService.add( left );
		this.splineService.add( right );
		this.splineService.add( bottom );

		return { left, right, bottom };

	}

	add3ConnectedSplines () {

		/**

		 * -------------------------------
		 *  	1 	=> 	|	  2	 => 	| 	=>	3
		 * -------------------------------

		 */

		const left = this.createStraightSpline( new Vector3( -100, 0, 0 ), 100 );
		const middle = this.createStraightSpline( new Vector3( 0, 0, 0 ), 100 );
		const right = this.createStraightSpline( new Vector3( 100, 0, 0 ), 100 );

		const leftRoad = this.roadFactory.createDefaultRoad();
		const middleRoad = this.roadFactory.createDefaultRoad();
		const rightRoad = this.roadFactory.createDefaultRoad();

		left.addSegment( 0, leftRoad );
		middle.addSegment( 0, middleRoad );
		right.addSegment( 0, rightRoad );

		leftRoad.spline = left;
		middleRoad.spline = middle;
		rightRoad.spline = right;

		leftRoad.setSuccessorRoad( middleRoad, TvContactPoint.START );
		middleRoad.setPredecessorRoad( leftRoad, TvContactPoint.END );
		middleRoad.setSuccessorRoad( rightRoad, TvContactPoint.START );
		rightRoad.setPredecessorRoad( middleRoad, TvContactPoint.END );

		this.splineService.add( left );
		this.splineService.add( middle );
		this.splineService.add( right );


		return { left, middle, right };
	}

	add3ConnectedSplinesv2 () {

		/**

		 * -------------------------------
		 *  	1  =>	|	<=  2	 	| => 3
		 * -------------------------------

		 */
		const left = this.createStraightSpline( new Vector3( -100, 0, 0 ), 100 );
		const middle = this.createStraightSpline( new Vector3( 100, 0, 0 ), 100, 180 );
		const right = this.createStraightSpline( new Vector3( 100, 0, 0 ), 100 );

		const leftRoad = this.roadFactory.createDefaultRoad();
		const middleRoad = this.roadFactory.createDefaultRoad();
		const rightRoad = this.roadFactory.createDefaultRoad();

		left.addSegment( 0, leftRoad );
		middle.addSegment( 0, middleRoad );
		right.addSegment( 0, rightRoad );

		leftRoad.spline = left;
		middleRoad.spline = middle;
		rightRoad.spline = right;

		leftRoad.setSuccessorRoad( middleRoad, TvContactPoint.END );
		middleRoad.setSuccessorRoad( leftRoad, TvContactPoint.END );
		middleRoad.setPredecessorRoad( rightRoad, TvContactPoint.START );
		rightRoad.setPredecessorRoad( middleRoad, TvContactPoint.START );

		this.splineService.add( left );
		this.splineService.add( middle );
		this.splineService.add( right );


		return { left, middle, right };
	}
}
