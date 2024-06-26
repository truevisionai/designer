/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { Object3D } from "three";
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugLine } from '../../objects/debug-line';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { DebugState } from 'app/services/debug/debug-state';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { ExplicitSplineHelper } from "./explicit-spline.helper";
import { AutoSplineHelper } from "./auto-spline.helper";
import { TextObjectService } from '../text-object.service';
import { TvGeometryType } from 'app/map/models/tv-common';
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { Maths } from 'app/utils/maths';
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvLane } from "../../map/models/tv-lane";
import { TvLaneSection } from "../../map/models/tv-lane-section";

const LINE_WIDTH = 2.0;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 5;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService extends BaseDebugger<AbstractSpline> {

	private referenceLines = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private borders = new Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>();

	private arrows = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private texts = new Object3DArrayMap<AbstractSpline, Object3D[]>();

	private autoSplineHelper: BaseDebugger<AbstractSpline>;

	private explicitSplineHelper: BaseDebugger<AbstractSpline>;

	constructor (
		// private roadDebugger: RoadDebugService,
		private debugService: DebugDrawService,
		private textService: TextObjectService,
	) {
		super();
		this.autoSplineHelper = new AutoSplineHelper();
		this.explicitSplineHelper = new ExplicitSplineHelper();
	}

	setDebugState ( spline: AbstractSpline, state: DebugState ) {

		if ( !spline ) return;

		this.setBaseState( spline, state );

		if ( spline.type == SplineType.AUTOV2 || spline.type == SplineType.AUTO ) {

			this.autoSplineHelper?.setDebugState( spline, state );

		} else if ( spline.type == SplineType.EXPLICIT ) {

			this.explicitSplineHelper.setDebugState( spline, state );

		}
	}

	onDefault ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.showBorder( spline );

	}

	onHighlight ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

	}

	onSelected ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.removeBorder( spline );
		this.showBorder( spline, LINE_WIDTH * 3, COLOR.RED );

		this.arrows.removeKey( spline );
		this.showArrows( spline );

		this.showReferenceLine( spline );

		this.showCurvature( spline );
	}

	showCurvature ( spline: AbstractSpline ) {

		this.texts.removeKey( spline );

		for ( const road of spline.getRoads() ) {

			road.geometries.filter( g => g.geometryType == TvGeometryType.ARC ).forEach( ( geometry: TvArcGeometry ) => {

				let text = `Radius: ` + Maths.round( geometry.radius ) + ' m';

				// Calculate the central angle of the arc
				// const centralAngle = ( geometry.length / geometry.radius ) * Maths.Rad2Deg;
				// text += ' ' + Maths.round( centralAngle ) + '*';

				const textObject3d = this.textService.createFromText( text );

				// Calculate the position for the text
				// Ensure the text is placed near the arc's midpoint, but slightly elevated or offset to improve visibility
				const midPoint = geometry.middleV3; // Assuming this is the midpoint on the arc
				const offsetDirection = midPoint.clone().sub( geometry.centre ).normalize(); // Direction from center to midpoint
				const offsetDistance = 15; // Adjust this value as needed to ensure visibility without clutter
				const position = midPoint.clone().sub( offsetDirection.multiplyScalar( offsetDistance ) );

				textObject3d.position.set( position.x, position.y, position.z + 0.5 );

				this.texts.addItem( spline, textObject3d );

			} )

		}

	}

	removeCurvature ( spline: AbstractSpline ) {

		this.texts.removeKey( spline );

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		this.arrows.removeKey( spline );

		this.referenceLines.removeKey( spline );

		this.texts.removeKey( spline );

	}

	onRemoved ( spline: AbstractSpline ) {

		this.referenceLines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.texts.removeKey( spline );

		this.highlighted.delete( spline );

		this.selected.delete( spline );

		this.removeBorder( spline );

	}

	highlight ( spline: AbstractSpline ) {

		if ( this.selected.has( spline ) ) return;

		if ( this.highlighted.has( spline ) ) return;

		this.referenceLines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

		this.highlighted.add( spline );

	}

	onUnhighlight ( spline: AbstractSpline ) {

		this.referenceLines.removeKey( spline );

		this.arrows.removeKey( spline );

	}

	////// PRIVATE
	showReferenceLine ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		const points = spline.getPoints( LINE_STEP ).map( point => point );

		points.forEach( point => point.z += LINE_ZOFFSET );

		try {

			const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH );

			this.referenceLines.addItem( spline, line );

		} catch ( error ) {

			console.error( error );

		}

	}

	removeReferenceLine ( spline: AbstractSpline ) {

		this.referenceLines.removeKey( spline );

	}

	showBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ) {

		const add = ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) => {

			const points = this.debugService.getPositions( road, laneSection, lane, 0, laneSection.length, LINE_STEP );

			const positions = points.map( point => point.position );

			const line = this.debugService.createDebugLine( road, positions, lineWidth, color );

			this.borders.addItem( spline, line );
		}

		spline.getRoads().forEach( road => {

			road.laneSections?.forEach( laneSection => {

				add( road, laneSection, laneSection.getRightMostLane() );

				add( road, laneSection, laneSection.getLeftMostLane() );

			} )
		} )

	}

	removeBorder ( spline: AbstractSpline ) {

		this.borders.removeKey( spline );

	}

	showArrows ( spline: AbstractSpline ) {

		for ( const road of spline.getRoads() ) {

			for ( const point of road.getReferenceLinePoints( ARROW_STEP ) ) {

				const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

				this.arrows.addItem( spline, arrow );


			}

		}

	}

	removeArrows ( spline: AbstractSpline ) {

		this.arrows.removeKey( spline );

	}

	clear () {

		super.clear();

		this.referenceLines.clear();

		this.arrows.clear();

		this.texts.clear();

		this.autoSplineHelper?.clear();

		this.explicitSplineHelper?.clear();

	}

}
