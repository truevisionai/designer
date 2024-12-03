/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugDrawService } from './debug-draw.service';
import { Box3Helper, Object3D, Vector2 } from "three";
import { COLOR } from 'app/views/shared/utils/colors.service';
import { DebugLine } from '../../objects/debug-line';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { DebugState } from 'app/services/debug/debug-state';
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { ExplicitSplineHelper } from "./explicit-spline.helper";
import { AutoSplineHelper } from "./auto-spline.helper";
import { TextObjectService } from '../text-object.service';
import { TvContactPoint, TvGeometryType } from 'app/map/models/tv-common';
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { Maths } from 'app/utils/maths';
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { TvRoad } from "../../map/models/tv-road.model";
import { SplineService } from "../spline/spline.service";
import { RoadDebugService } from './road-debug.service';
import { RoadNode } from 'app/objects/road/road-node';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { RoadControlPoint } from "../../objects/road/road-control-point";
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RoadWidthService } from '../road/road-width.service';

const LINE_WIDTH = 2.0;
const LINE_STEP = 0.1;
const LINE_ZOFFSET = 0.1;

const ARROW_SIZE = 1.5;
const ARROW_STEP = 10;
const ARROW_COLOR = COLOR.YELLOW;

@Injectable( {
	providedIn: 'root'
} )
export class SplineDebugService extends BaseDebugger<AbstractSpline> {

	private polylines: Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>;

	private referenceLines: Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>;

	private borders: Object3DArrayMap<AbstractSpline, DebugLine<AbstractSpline>[]>;

	private arrows: Object3DArrayMap<AbstractSpline, Object3D[]>;

	private boundingBoxes: Object3DArrayMap<AbstractSpline, Object3D[]>;

	private texts: Object3DArrayMap<AbstractSpline, Object3D[]>;

	private points: Object3DArrayMap<AbstractSpline, Object3D[]>;

	private nodes: Object3DArrayMap<AbstractSpline, Object3D[]>;

	private autoSplineHelper: BaseDebugger<AbstractSpline>;

	private explicitSplineHelper: BaseDebugger<AbstractSpline>;

	constructor (
		private splineService: SplineService,
		private debugService: DebugDrawService,
		private textService: TextObjectService,
		private roadDebugger: RoadDebugService,
	) {
		super();

		this.polylines = new Object3DArrayMap();

		this.referenceLines = new Object3DArrayMap();

		this.borders = new Object3DArrayMap();

		this.arrows = new Object3DArrayMap();

		this.texts = new Object3DArrayMap();

		this.points = new Object3DArrayMap();

		this.nodes = new Object3DArrayMap();

		this.boundingBoxes = new Object3DArrayMap();

		this.autoSplineHelper = new AutoSplineHelper();

		this.explicitSplineHelper = new ExplicitSplineHelper();

	}

	setDebugState ( spline: AbstractSpline, state: DebugState ): void {

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
		this.showBorder( spline, LINE_WIDTH, COLOR.RED );

		this.arrows.removeKey( spline );
		this.showArrows( spline );

		this.showReferenceLine( spline );

		this.showCurvature( spline );
	}

	showCurvature ( spline: AbstractSpline ): void {

		this.texts.removeKey( spline );

		for ( const road of spline.getRoadSegments() ) {

			road.getPlanView().getGeomtries().filter( g => g.geometryType == TvGeometryType.ARC ).forEach( ( geometry: TvArcGeometry ) => {

				const text = `Radius: ${ Maths.round( geometry.radius ) } m`;

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

	removeCurvature ( spline: AbstractSpline ): void {

		this.texts.removeKey( spline );

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.removeBorder( spline );

		this.arrows.removeKey( spline );

		this.referenceLines.removeKey( spline );

		this.texts.removeKey( spline );

	}

	onRemoved ( spline: AbstractSpline ): void {

		this.referenceLines.removeKey( spline );

		this.arrows.removeKey( spline );

		this.texts.removeKey( spline );

		this.highlighted.delete( spline );

		this.selected.delete( spline );

		this.removeBorder( spline );

	}

	highlight ( spline: AbstractSpline ): void {

		if ( this.selected.has( spline ) ) return;

		if ( this.highlighted.has( spline ) ) return;

		this.referenceLines.removeKey( spline );

		this.showBorder( spline, LINE_WIDTH * 2 );

		this.showArrows( spline );

		this.highlighted.add( spline );

	}

	onUnhighlight ( spline: AbstractSpline ): void {

		this.referenceLines.removeKey( spline );

		this.arrows.removeKey( spline );

	}

	////// PRIVATE
	showReferenceLine ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		const points = spline.getPoints( LINE_STEP );

		points.forEach( point => point.z += LINE_ZOFFSET );

		try {

			const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH );

			this.referenceLines.addItem( spline, line );

		} catch ( error ) {

			console.error( error );

		}

	}

	removeReferenceLine ( spline: AbstractSpline ): void {

		this.referenceLines.removeKey( spline );

	}

	showBorder ( spline: AbstractSpline, lineWidth = LINE_WIDTH, color = COLOR.CYAN ): void {

		if ( spline.getControlPointCount() < 2 ) return;

		const add = ( points: AbstractControlPoint[] ) => {

			if ( points.length < 2 ) return;

			const positions = points.map( point => point.position );

			const line = this.debugService.createDebugLine( spline, positions, lineWidth, color );

			this.borders.addItem( spline, line );

		}

		add( spline.leftPoints );
		add( spline.rightPoints );

	}

	removeBorder ( spline: AbstractSpline ): void {

		this.borders.removeKey( spline );

	}

	showArrows ( spline: AbstractSpline ): void {

		for ( const road of spline.getRoadSegments() ) {

			for ( const point of road.getReferenceLinePoints( ARROW_STEP ) ) {

				const arrow = this.debugService.createSharpArrow( point.position, point.hdg, ARROW_COLOR, ARROW_SIZE );

				this.arrows.addItem( spline, arrow );


			}

		}

	}

	removeArrows ( spline: AbstractSpline ): void {

		this.arrows.removeKey( spline );

	}

	showBoundingBox ( spline: AbstractSpline ): void {

		const box = new Box3Helper( Maths.convertToBox3d( spline.boundingBox ) );

		this.removeBoundingBox( spline );

		this.boundingBoxes.addItem( spline, box );

	}

	removeBoundingBox ( spline: AbstractSpline ): void {

		this.boundingBoxes.removeKey( spline );

	}

	clear (): void {

		super.clear();

		this.borders.clear();

		this.polylines.clear();

		this.referenceLines.clear();

		this.arrows.clear();

		this.texts.clear();

		this.nodes.clear();

		this.autoSplineHelper?.clear();

		this.explicitSplineHelper?.clear();

		this.roadDebugger.clear();

		this.points.clear();

	}

	showControlPoints ( spline: AbstractSpline ): void {

		for ( let i = 0; i < spline.controlPoints.length; i++ ) {

			const point = spline.controlPoints[ i ];

			this.points.addItem( spline, point );

			this.showTangents( spline, point );

		}

	}

	showTangents ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		if ( point instanceof RoadControlPoint ) {

			if ( !point.frontTangent || !point.backTangent ) {
				point.createTangentAndLine( point.hdg, 7, 7 );
			}

			const index = spline.controlPoints.indexOf( point );

			if ( index != spline.controlPoints.length - 1 ) {

				point.frontTangent.visible = true;

				this.points.addItem( spline, point.frontTangent )
			}

			if ( index != 0 ) {

				point.backTangent.visible = true;

				this.points.addItem( spline, point.backTangent )

			}

			if ( point.tangentLine ) {

				point.tangentLine.visible = true;

				this.points.addItem( spline, point.tangentLine )

			}

		}

	}

	removeControlPoints ( spline: AbstractSpline ): void {

		this.points.removeKey( spline );

	}

	showPolyline ( spline: AbstractSpline ): void {

		if ( spline.getControlPointCount() < 2 ) return;

		if ( spline.type == SplineType.EXPLICIT ) return;

		const points = spline.controlPoints.map( point => point.position );

		if ( spline.closed && points.length > 2 ) {
			points.push( points[ 0 ] );
		}

		const line = this.debugService.createDebugLine( spline, points, LINE_WIDTH, COLOR.WHITE );

		this.polylines.addItem( spline, line );

	}

	removePolyline ( spline: AbstractSpline ): void {

		this.polylines.removeKey( spline );

	}

	showNodes ( spline: AbstractSpline ): void {

		spline.getSegments().forEach( segment => {

			if ( segment instanceof TvRoad ) {

				const startNode = this.createNode( segment, TvContactPoint.START );
				const endNode = this.createNode( segment, TvContactPoint.END );

				this.nodes.addItem( spline, startNode );
				this.nodes.addItem( spline, endNode );

			}

		} )

	}

	removeNodes ( spline: AbstractSpline ): void {

		this.nodes.removeKey( spline );

	}

	showBoundPoints ( spline: AbstractSpline ): void {

		spline.leftPoints.forEach( point => this.points.addItem( spline, point ) );
		spline.rightPoints.forEach( point => this.points.addItem( spline, point ) );

	}

	removeBoundPoints ( spline: AbstractSpline ): void {

		this.points.removeKey( spline );

	}

	createNode ( road: TvRoad, contact: TvContactPoint ) {

		const node = new RoadNode( road, contact );

		const sCoord = contact == TvContactPoint.START ? 0 : road.length;

		const result = RoadWidthService.instance.findRoadWidthAt( road, sCoord );

		const start = road.getRoadPosition( sCoord, result.leftSideWidth );
		const end = road.getRoadPosition( sCoord, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();
		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		const lineMaterial = new LineMaterial( {
			color: RoadNode.defaultColor,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
			depthTest: false,
			depthWrite: false,
		} );

		const line = node.line = new Line2( lineGeometry, lineMaterial );

		line.name = RoadNode.lineTag;

		line[ 'tag' ] = RoadNode.lineTag;

		line.renderOrder = 3;

		node.add( line );

		return node;

	}

	updateNode ( node: RoadNode ): void {

		const sOffset = node.contact == TvContactPoint.START ? 0 : node.road.length;

		const result = RoadWidthService.instance.findRoadWidthAt( node.road, sOffset );

		const start = node.road.getRoadPosition( sOffset, result.leftSideWidth );
		const end = node.road.getRoadPosition( sOffset, -result.rightSideWidth );

		node.line.geometry.dispose();

		node.line.geometry.setPositions(
			[].concat( ...[ start.toVector3(), end.toVector3() ].map( ( v ) => [ v.x, v.y, v.z ] ) )
		);

	}

}
