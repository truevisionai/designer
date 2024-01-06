import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Object3DArrayMap } from "../../tools/lane-width/object-3d-map";
import { Object3D } from "three";
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { DebugLine } from './debug-line';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { MapService } from '../map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

const LINE_WIDTH = 1.5;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService {

	private lines = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private arrows = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private highlighted = new Set<AbstractSpline>();

	private selected = new Set<AbstractSpline>();

	constructor (
		private debugService: DebugDrawService,
		private laneDebugService: LaneDebugService,
		private mapService: MapService,
	) {
	}

	get splines () {
		return this.mapService.splines;
	}

	remove ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.highlighted.delete( spline );

		this.selected.delete( spline );

		this.removeBorder( spline );
	}

	showBorders () {

		for ( let i = 0; i < this.splines.length; i++ ) {

			const spline = this.splines[ i ];

			this.showBorder( spline );

		}

	}

	updateSpline ( spline: AbstractSpline ) {

		this.updateArrows( spline );

		if ( this.selected.has( spline ) ) {
			this.unselect( spline );
			this.select( spline );
		}

		if ( this.highlighted.has( spline ) ) {
			this.unhighlight( spline );
			this.highlight( spline );
		}

	}

	showReferenceLine ( spline: AbstractSpline ) {

		const points = spline.getPoints( LINE_STEP ).map( point => point );

		points.forEach( point => point.z += LINE_ZOFFSET );

		const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH );

		this.lines.addItem( spline, line );

	}

	showBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		const leftPoints = [];
		const rightPoints = [];

		const roads = spline.getRoads();

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			if ( road.isJunction ) continue;

			road.laneSections?.forEach( laneSection => {

				const leftLane = laneSection.getLeftMostLane();
				const left = this.laneDebugService.getPoints( leftLane, 0, laneSection.length, LINE_STEP );

				const rightLane = laneSection.getRightMostLane();
				const right = this.laneDebugService.getPoints( rightLane, 0, laneSection.length, LINE_STEP );

				leftPoints.push( ...left );
				rightPoints.push( ...right );

			} );

			this.lines.addItem( spline, this.debugService.createDebugLine( spline, leftPoints, lineWidth, color ) );
			this.lines.addItem( spline, this.debugService.createDebugLine( spline, rightPoints, lineWidth, color ) );

		}

	}

	removeBorder ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

	}

	select ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 3, COLOR.RED );

		this.showArrows( spline );

		this.selected.add( spline );

	}

	unselect ( spline: AbstractSpline ) {

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.selected.delete( spline );

	}

	highlight ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		if ( this.highlighted.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

		this.highlighted.add( spline );

	}

	unhighlight ( spline: AbstractSpline ) {

		if ( !this.highlighted.has( spline ) ) return;

		this.lines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.highlighted.delete( spline );

	}

	removeHighlight () {

		this.highlighted.forEach( road => {

			if ( this.selected.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

			this.showBorder( road );

		} )

		this.highlighted.clear();

	}

	clearLines () {

		this.highlighted.forEach( road => {

			if ( this.selected.has( road ) ) return;

			this.lines.removeKey( road );

			this.arrows.removeKey( road );

		} )

		this.highlighted.clear();

	}

	upateBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH ) {

		this.lines.removeKey( spline );

		this.showBorder( spline, lineWidth );

	}

	showArrows ( spline: AbstractSpline ) {

		spline.getDirectedPoints( ARROW_STEP ).forEach( point => {

			const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

			this.arrows.addItem( spline, arrow );

		} )

	}

	updateArrows ( spline: AbstractSpline ) {

		this.arrows.removeKey( spline );

		this.showArrows( spline );

	}

	clear () {

		this.lines.clear();

		this.arrows.clear();

		this.removeHighlight();

		this.selected.clear();

	}

}
