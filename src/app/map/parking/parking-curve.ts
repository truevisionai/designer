/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { CatmullRomSpline } from "app/core/shapes/catmull-rom-spline";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Maths } from "app/utils/maths";
import { Vector3 } from "three";
import { MathUtils } from "three/src/math/MathUtils";
import { ParkingGraph } from "./parking-graph";
import { EdgeMarkingColor, EdgeMarkingStyle, ParkingEdge, ParkingEdgeType } from "./parking-edge";
import { ParkingNode } from "./parking-node";
import { ParkingRegion } from "./parking-region";
import { readXmlArray } from "app/utils/xml-utils";
import { ParkingCurvePoint } from "app/modules/parking-spot/objects/parking-curve-point";

export enum ParkingSide {
	LEFT = 'left',
	RIGHT = 'right',
	BOTH = 'both'
}

export class ParkingCurve {

	public static tag = 'parkingCurve';

	public id: string;
	private spline: AbstractSpline;

	// Width along the center line for each stall
	private stallWidth: number = 2.5;
	// Depth outward from center line (perpendicular)
	private stallDepth: number = 5.0; // Adjust as needed

	// Angle offset for stalls (in radians)
	// Positive angle rotates counter-clockwise from the road direction
	private stallAngle: number = 0;

	// Which side(s) of the curve should have parking spots
	private side: ParkingSide = ParkingSide.BOTH;

	private color: EdgeMarkingColor = EdgeMarkingColor.WHITE;

	private parkingGraph: ParkingGraph;

	constructor ( spline?: AbstractSpline ) {
		this.id = MathUtils.generateUUID();
		this.spline = spline || new CatmullRomSpline( false, 'catmullrom', 0.001 );
	}

	getParkingGraph (): ParkingGraph {
		return this.parkingGraph;
	}

	setParkingGraph ( parkingGraph: ParkingGraph ): void {
		this.parkingGraph = parkingGraph;
	}

	update (): void {

	}

	getWidth (): number {
		return this.stallWidth;
	}

	setWidth ( width: number ): void {
		this.stallWidth = width;
	}

	getLength (): number {
		return this.stallDepth;
	}

	setLength ( length: number ): void {
		this.stallDepth = length;
	}

	getAngle (): number {
		return this.stallAngle;
	}

	setAngle ( angle: number ): void {
		this.stallAngle = angle;
	}

	/**
	 * Get stall angle in degrees
	 */
	getAngleDegrees (): number {
		return this.stallAngle * ( 180 / Math.PI );
	}

	/**
	 * Set stall angle in degrees
	 */
	setAngleDegrees ( degrees: number ): void {
		this.stallAngle = degrees * ( Math.PI / 180 );
	}

	getSide (): ParkingSide {
		return this.side;
	}

	setSide ( side: ParkingSide ): void {
		this.side = side;
	}

	/**
	 * Check if parking spots should be generated on the left side
	 */
	hasLeftSide (): boolean {
		return this.side === ParkingSide.LEFT || this.side === ParkingSide.BOTH;
	}

	/**
	 * Check if parking spots should be generated on the right side
	 */
	hasRightSide (): boolean {
		return this.side === ParkingSide.RIGHT || this.side === ParkingSide.BOTH;
	}

	getColor (): EdgeMarkingColor {
		return this.color;
	}

	setColor ( color: EdgeMarkingColor ): void {
		this.color = color;
	}

	addPoint ( point: AbstractControlPoint ): void {
		this.spline.addControlPoint( point );
	}

	getSpline (): AbstractSpline {
		return this.spline;
	}

	setSpline ( spline: AbstractSpline ): void {
		this.spline = spline;
	}

	setControlPoints ( points: AbstractControlPoint[] ): void {
		this.spline.setControlPoints( points );
	}

	getControlPoints (): AbstractControlPoint[] {
		return this.spline.getControlPoints();
	}

	// ------------------------------------------
	// PREVIEW: SIDE-AWARE PARKING
	// ------------------------------------------

	/**
	 * Generates ephemeral ParkingRegions for UI preview.
	 * Respects the 'side' property to generate stalls on left, right, or both sides.
	 */
	generatePreviewRegions (): ParkingRegion[] {

		const centers = this.getPotentialSpots();
		const previewRegions: ParkingRegion[] = [];

		centers.forEach( ( center, index ) => {

			// Generate left stall if left side is enabled
			if ( this.hasLeftSide() ) {
				previewRegions.push( this.createPreviewRegion( center, +1 ) );
			}

			// Generate right stall if right side is enabled
			if ( this.hasRightSide() ) {
				previewRegions.push( this.createPreviewRegion( center, -1 ) );
			}

		} );

		return previewRegions;

	}

	private createPreviewRegion ( center: TvPosTheta, offsetSign: number ): ParkingRegion {

		const corners = this.computeRectCorners( center, offsetSign );
		const tempNodes = corners.map( pos => new ParkingNode( pos ) );
		const tempEdges: ParkingEdge[] = [];

		for ( let i = 0; i < tempNodes.length; i++ ) {

			const start = tempNodes[ i ];
			const end = tempNodes[ ( i + 1 ) % tempNodes.length ];

			const edge = new ParkingEdge( start, end );

			edge.setMarkingColor( this.color );

			if ( i == 0 ) {
				edge.setType( ParkingEdgeType.ENTRY );
				edge.setMarkingStyle( EdgeMarkingStyle.NONE );
			} else {
				edge.setType( ParkingEdgeType.BOUNDARY );
				edge.setMarkingStyle( EdgeMarkingStyle.SOLID );
			}

			tempEdges.push( edge );
		}

		// Stall heading is perpendicular to road plus the stall angle offset
		const perpAngle = center.hdg + offsetSign * Math.PI / 2;
		const heading = perpAngle + offsetSign * this.stallAngle;
		const region = new ParkingRegion( heading );
		region.setEdges( tempEdges );
		return region;

	}

	/**
	 * Creates permanent ParkingRegions in the ParkingGraph.
	 * Respects the 'side' property to generate stalls on left, right, or both sides.
	 */
	bake ( graph: ParkingGraph ): ParkingRegion[] {

		const centers = this.getPotentialSpots();
		const newRegions: ParkingRegion[] = [];

		for ( let i = 0; i < centers.length; i++ ) {

			const center = centers[ i ];

			// Generate left stall if left side is enabled
			if ( this.hasLeftSide() ) {
				const corners = this.computeRectCorners( center, +1 );
				const cornerNodes = corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					edges.push( graph.getOrCreateEdge( startNode, endNode ) );
				}

				const region = graph.createRegion( edges );
				const perpAngle = center.hdg + Maths.PI2;
				region.setHeading( perpAngle + this.stallAngle );
				newRegions.push( region );
			}

			// Generate right stall if right side is enabled
			if ( this.hasRightSide() ) {
				const corners = this.computeRectCorners( center, -1 );
				const cornerNodes = corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					edges.push( graph.getOrCreateEdge( startNode, endNode ) );
				}

				const region = graph.createRegion( edges );
				const perpAngle = center.hdg - Maths.PI2;
				region.setHeading( perpAngle - this.stallAngle );
				newRegions.push( region );
			}

		}

		return newRegions;
	}

	/**
	 * Computes the corners of one rectangular stall for angled parking.
	 *
	 * Key insight: For angled parking, the stall's width direction should be
	 * along the road direction, while the depth extends at an angle.
	 *
	 * - 'stallWidth' is along the road/centerline direction
	 * - 'stallDepth' extends outward at 'stallAngle' from perpendicular
	 * - offsetSign = +1 => left side, -1 => right side
	 */
	private computeRectCorners ( center: TvPosTheta, offsetSign: number ): Vector3[] {

		const w = this.stallWidth;
		const d = this.stallDepth;
		const hdg = center.hdg;

		// Calculate perpendicular angle to the road
		const perpAngle = hdg + offsetSign * Math.PI / 2;

		// Apply stall angle: positive angle means the stall leans forward (in driving direction)
		// For offsetSign = +1 (left): lean counter-clockwise from perpendicular
		// For offsetSign = -1 (right): lean clockwise from perpendicular
		const stallDirection = perpAngle + offsetSign * this.stallAngle;

		// Unit vectors
		const roadDirX = Math.cos( hdg );
		const roadDirY = Math.sin( hdg );
		const stallDirX = Math.cos( stallDirection );
		const stallDirY = Math.sin( stallDirection );

		// Define corners relative to center:
		// Start from center and go along road direction for width,
		// then perpendicular outward for depth
		const halfW = w * 0.5;

		// Corner positions in world coordinates
		const corner0 = new Vector3(
			center.x - halfW * roadDirX,
			center.y - halfW * roadDirY,
			0
		);

		const corner1 = new Vector3(
			center.x + halfW * roadDirX,
			center.y + halfW * roadDirY,
			0
		);

		const corner2 = new Vector3(
			corner1.x + d * stallDirX,
			corner1.y + d * stallDirY,
			0
		);

		const corner3 = new Vector3(
			corner0.x + d * stallDirX,
			corner0.y + d * stallDirY,
			0
		);

		return [ corner0, corner1, corner2, corner3 ];
	}

	private getPotentialSpots (): TvPosTheta[] {

		const centers: TvPosTheta[] = [];
		const w = this.stallWidth;
		const EPS = 1e-6;

		if ( w <= Maths.Epsilon ) {
			return centers;
		}

		const ctrlPts = this.spline.controlPointPositions;

		if ( ctrlPts.length < 2 ) {
			return centers;
		}

		const halfW = w * 0.5;
		let accumulatedLength = 0;
		let nextCenterDistance = halfW;

		for ( let i = 0; i < ctrlPts.length - 1; i++ ) {

			const start = ctrlPts[ i ];
			const end = ctrlPts[ i + 1 ];

			const dx = end.x - start.x;
			const dy = end.y - start.y;
			const segLen = Math.sqrt( dx * dx + dy * dy );

			if ( segLen <= EPS ) {
				accumulatedLength += segLen;
				continue;
			}

			const hdg = Math.atan2( dy, dx );

			while ( nextCenterDistance <= accumulatedLength + segLen + EPS ) {

				const distIntoSegment = nextCenterDistance - accumulatedLength;

				if ( distIntoSegment < -EPS ) {
					// Numeric drift pushed the next center slightly behind this segment; nudge forward.
					nextCenterDistance = accumulatedLength + EPS;
					continue;
				}

				const t = Maths.clamp( distIntoSegment / segLen, 0, 1 );
				const cx = start.x + t * dx;
				const cy = start.y + t * dy;

				centers.push( new TvPosTheta( cx, cy, hdg ) );

				nextCenterDistance += w;
			}

			accumulatedLength += segLen;
		}

		return centers;
	}

	static fromSceneJSON ( json: any ): ParkingCurve {

		const spline = new CatmullRomSpline( false, 'catmullrom', 0.001 );

		const parkingCurve = new ParkingCurve( spline );

		parkingCurve.id = json.attr_id;

		// Load stall angle if present
		if ( json.attr_stallAngle !== undefined ) {
			parkingCurve.stallAngle = parseFloat( json.attr_stallAngle );
		}

		// Load stall width if present
		if ( json.attr_stallWidth !== undefined ) {
			parkingCurve.stallWidth = parseFloat( json.attr_stallWidth );
		}

		// Load stall depth if present
		if ( json.attr_stallDepth !== undefined ) {
			parkingCurve.stallDepth = parseFloat( json.attr_stallDepth );
		}

		// Load side if present
		if ( json.attr_side !== undefined ) {
			parkingCurve.side = json.attr_side as ParkingSide;
		}

		const controlPoints = [];

		readXmlArray( json.spline.point, ( point: any ) => {
			const position = new Vector3(
				parseFloat( point.attr_x ) ?? 0,
				parseFloat( point.attr_y ) ?? 0,
				parseFloat( point.attr_z ) ?? 0,
			);
			const controlPoint = new ParkingCurvePoint( parkingCurve, position );
			controlPoints.push( controlPoint );
		} )

		spline.setControlPoints( controlPoints );

		return parkingCurve;

	}

	toSceneJSON (): any {
		return {
			attr_id: this.id,
			attr_stallAngle: this.stallAngle,
			attr_stallWidth: this.stallWidth,
			attr_stallDepth: this.stallDepth,
			attr_side: this.side,
			spline: {
				attr_uuid: this.spline.uuid,
				attr_type: this.spline.type,
				point: this.spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) ),
			},
		};
	}
}
