import { Injectable } from '@angular/core';
import { Vector3 } from "three";
import { AbstractSpline, SplineType } from "../../core/shapes/abstract-spline";
import { SplineService } from "./spline.service";
import { SplineFactory } from "./spline.factory";
import { RoadFactory } from "../../factories/road-factory.service";
import { RoadCircleToolService } from 'app/tools/road-circle/road-circle-tool.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { JunctionFactory } from 'app/factories/junction.factory';
import { MapService } from '../map/map.service';


@Injectable( {
	providedIn: 'root'
} )
export class SplineTestHelper {

	constructor (
		public mapService: MapService,
		public splineService: SplineService,
		public roadFactory: RoadFactory,
		public junctionFactory: JunctionFactory,
		public cirleToolService: RoadCircleToolService,
	) {
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

		this.cirleToolService.createCirclePoints( center, end, radius ).forEach( point => {

			spline.controlPoints.push( ControlPointFactory.createControl( spline, point ) );

		} );

		this.splineService.add( spline );

		return spline;
	}

	addStraightRoadSpline ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		const spline = this.createStraightSpline( start, length, degrees, type );

		this.splineService.add( spline );

		return spline;

	}

	createStraightSpline ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ) {

		return SplineFactory.createStraight( start, length, degrees, type );

	}

	addStraightRoadsFacingEachOther ( start: Vector3 ) {

		const splineA = SplineFactory.createStraight( start, 50 );
		const splineB = SplineFactory.createStraight( new Vector3( start.x + 150, start.y, start.z ), 50, 180 );

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

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 200, 90 );
		const splineC = SplineFactory.createStraight( new Vector3( -100, -100, 0 ), 200, 45 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );
		this.splineService.add( splineC );
	}

	createSimpleTJunction () {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 100, 90 );

		this.splineService.add( splineA );
		this.splineService.add( splineB );
	}

	async createAJunction ( random = false ) {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineC = SplineFactory.createStraight( new Vector3( -50, -100, 0 ), 200, 65 );
		const splineB = SplineFactory.createStraight( new Vector3( 50, -100, 0 ), 200, 105 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );

	}

	async createHJunction ( random = false ) {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineC = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 100, 90 );
		const splineB = SplineFactory.createStraight( new Vector3( -100, -100, 0 ), 200 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );

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
		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 100, 0 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, 100, 0 ), 100, -90 );
		const splineC = SplineFactory.createStraight( new Vector3( 100, 0, 0 ), 100, 180 );
		const splineD = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 100, 90 );

		const splines = [ splineA, splineB, splineC, splineD ];

		await this.addInRandomOrder( splines, random );

	}

	async createXJunctionWithTwoRoads ( random: boolean, length = 200 ) {

		const splineA = SplineFactory.createStraight( new Vector3( -length * 0.5, 0, 0 ), length, 0 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -length * 0.5, 0 ), length, 90 );

		await this.addInRandomOrder( [ splineA, splineB ], random );

	}

	async createTJunctionWith3Roads ( random = false ) {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 100 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, 0, 0 ), 100 );
		const splineC = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 100, 90 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );
	}

	async createDoubleTJunctionWith3Roads ( random = false ) {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 300 );
		const splineB = SplineFactory.createStraight( new Vector3( 100, -100, 0 ), 100, 90 );
		const splineC = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 100, 90 );

		const splines = [ splineA, splineB, splineC ];

		await this.addInRandomOrder( splines, random );
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

}
