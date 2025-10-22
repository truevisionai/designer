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

interface PolylineSegment {
	start: Vector3;
	end: Vector3;
	length: number;
	heading: number;
	cumulativeStart: number;
}

interface ParkingStallPlacement {
	center: TvPosTheta;
	centerDistance: number;
	startDistance: number;
	endDistance: number;
}

interface ParkingStallQuad {
	corners: Vector3[];
	heading: number;
	center: TvPosTheta;
	width: number;
	area: number;
	startIndex: number;
	endIndex: number;
}

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

		const segments = this.buildPolylineSegments();
		const placements = this.getStallPlacements( segments );
		const previewRegions: ParkingRegion[] = [];

		if ( placements.length === 0 ) {
			return previewRegions;
		}

		if ( this.hasLeftSide() ) {
			const leftQuads = this.buildStallQuadsForSide( segments, placements, +1 );
			leftQuads.forEach( quad => previewRegions.push( this.createPreviewRegion( quad ) ) );
		}

		if ( this.hasRightSide() ) {
			const rightQuads = this.buildStallQuadsForSide( segments, placements, -1 );
			rightQuads.forEach( quad => previewRegions.push( this.createPreviewRegion( quad ) ) );
		}

		return previewRegions;

	}

	private createPreviewRegion ( quad: ParkingStallQuad ): ParkingRegion {

		const tempNodes = quad.corners.map( pos => new ParkingNode( pos ) );
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
		const region = new ParkingRegion( quad.heading );
		region.setEdges( tempEdges );
		return region;

	}

	private configureEdgeAppearance ( edge: ParkingEdge, edgeIndex: number ): void {

		if ( edgeIndex === 0 ) {
			edge.setType( ParkingEdgeType.ENTRY );
			edge.setMarkingStyle( EdgeMarkingStyle.NONE );
		} else if ( edge.getType() !== ParkingEdgeType.ENTRY ) {
			edge.setType( ParkingEdgeType.BOUNDARY );
			edge.setMarkingStyle( EdgeMarkingStyle.SOLID );
		}

		edge.setMarkingColor( this.color );
	}

	/**
	 * Creates permanent ParkingRegions in the ParkingGraph.
	 * Respects the 'side' property to generate stalls on left, right, or both sides.
	 */
	bake ( graph: ParkingGraph ): ParkingRegion[] {

		const segments = this.buildPolylineSegments();
		const placements = this.getStallPlacements( segments );
		const newRegions: ParkingRegion[] = [];

		if ( placements.length === 0 ) {
			return newRegions;
		}

		if ( this.hasLeftSide() ) {
			const leftQuads = this.buildStallQuadsForSide( segments, placements, +1 );
			leftQuads.forEach( quad => {
				const cornerNodes = quad.corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					const edge = graph.getOrCreateEdge( startNode, endNode );
					this.configureEdgeAppearance( edge, c );
					edges.push( edge );
				}

				const region = graph.createRegion( edges );
				region.setHeading( quad.heading );
				newRegions.push( region );
			} );
		}

		if ( this.hasRightSide() ) {
			const rightQuads = this.buildStallQuadsForSide( segments, placements, -1 );
			rightQuads.forEach( quad => {
				const cornerNodes = quad.corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					const edge = graph.getOrCreateEdge( startNode, endNode );
					this.configureEdgeAppearance( edge, c );
					edges.push( edge );
				}

				const region = graph.createRegion( edges );
				region.setHeading( quad.heading );
				newRegions.push( region );
			} );
		}

		return newRegions;
	}

	private buildPolylineSegments (): PolylineSegment[] {

		const segments: PolylineSegment[] = [];
		const ctrlPts = this.spline.controlPointPositions;
		const EPS = 1e-6;

		if ( ctrlPts.length < 2 ) {
			return segments;
		}

		let cumulative = 0;

		for ( let i = 0; i < ctrlPts.length - 1; i++ ) {

			const start = ctrlPts[ i ];
			const end = ctrlPts[ i + 1 ];

			const dx = end.x - start.x;
			const dy = end.y - start.y;
			const segLen = Math.sqrt( dx * dx + dy * dy );

			if ( segLen <= EPS ) {
				cumulative += segLen;
				continue;
			}

			segments.push( {
				start,
				end,
				length: segLen,
				heading: Math.atan2( dy, dx ),
				cumulativeStart: cumulative
			} );

			cumulative += segLen;
		}

		return segments;
	}

	// eslint-disable-next-line max-lines-per-function
	private getStallPlacements ( segments: PolylineSegment[] ): ParkingStallPlacement[] {

		const placements: ParkingStallPlacement[] = [];
		const w = this.stallWidth;
		const EPS = 1e-6;

		if ( segments.length === 0 || w <= Maths.Epsilon ) {
			return placements;
		}

		const halfW = w * 0.5;
		const lastSegment = segments[ segments.length - 1 ];
		const totalLength = lastSegment.cumulativeStart + lastSegment.length;

		if ( totalLength <= EPS ) {
			return placements;
		}

		let nextCenterDistance = halfW;
		let segmentIndex = 0;

		while ( nextCenterDistance <= totalLength + EPS ) {

			while ( segmentIndex < segments.length &&
				nextCenterDistance > segments[ segmentIndex ].cumulativeStart + segments[ segmentIndex ].length + EPS ) {
				segmentIndex++;
			}

			if ( segmentIndex >= segments.length ) {
				break;
			}

			const segment = segments[ segmentIndex ];
			const distIntoSegment = nextCenterDistance - segment.cumulativeStart;

			if ( distIntoSegment < -EPS ) {
				nextCenterDistance = segment.cumulativeStart + halfW;
				continue;
			}

			const t = Maths.clamp( distIntoSegment / segment.length, 0, 1 );
			const cx = segment.start.x + t * ( segment.end.x - segment.start.x );
			const cy = segment.start.y + t * ( segment.end.y - segment.start.y );

			placements.push( {
				center: new TvPosTheta( cx, cy, segment.heading ),
				centerDistance: nextCenterDistance,
				startDistance: Math.max( 0, nextCenterDistance - halfW ),
				endDistance: Math.min( totalLength, nextCenterDistance + halfW )
			} );

			nextCenterDistance += w;
		}

		return placements;
	}

	private buildStallQuadsForSide ( segments: PolylineSegment[], placements: ParkingStallPlacement[], offsetSign: number ): ParkingStallQuad[] {

		const quads: ParkingStallQuad[] = [];

		if ( placements.length === 0 ) {
			return quads;
		}

		const EPS = 1e-6;
		const minWidth = this.stallWidth;
		const minArea = this.stallWidth * this.stallDepth;

		let index = 0;

		while ( index < placements.length ) {

			let startIndex = index;
			let endIndex = index;
			let quad = this.computeStallQuad( segments, placements, startIndex, endIndex, offsetSign );

			while ( endIndex < placements.length - 1 &&
				( quad.width + EPS < minWidth || quad.area + EPS < minArea ) ) {
				endIndex++;
				quad = this.computeStallQuad( segments, placements, startIndex, endIndex, offsetSign );
			}

			while ( ( quad.width + EPS < minWidth || quad.area + EPS < minArea ) && quads.length > 0 ) {

				const prev = quads.pop();

				if ( !prev ) {
					break;
				}

				startIndex = prev.startIndex;
				endIndex = Math.max( endIndex, prev.endIndex );
				quad = this.computeStallQuad( segments, placements, startIndex, endIndex, offsetSign );
			}

			if ( quad.width + EPS < minWidth || quad.area + EPS < minArea ) {
				break;
			}

			quad.startIndex = startIndex;
			quad.endIndex = endIndex;
			quads.push( quad );
			index = endIndex + 1;
		}

		return quads;
	}

	private computeStallQuad ( segments: PolylineSegment[], placements: ParkingStallPlacement[], startIndex: number, endIndex: number, offsetSign: number ): ParkingStallQuad {

		const depth = this.stallDepth;
		const startPlacement = placements[ startIndex ];
		const endPlacement = placements[ endIndex ];

		const startPose = this.getPointOnSegments( segments, startPlacement.startDistance );
		const endPose = this.getPointOnSegments( segments, endPlacement.endDistance );

		const startInner = new Vector3( startPose.x, startPose.y, startPose.z ?? 0 );
		const endInner = new Vector3( endPose.x, endPose.y, endPose.z ?? 0 );

		const startPerp = startPose.hdg + offsetSign * Math.PI / 2;
		const endPerp = endPose.hdg + offsetSign * Math.PI / 2;

		const startDirAngle = startPerp + offsetSign * this.stallAngle;
		const endDirAngle = endPerp + offsetSign * this.stallAngle;

		const startOuter = new Vector3(
			startInner.x + depth * Math.cos( startDirAngle ),
			startInner.y + depth * Math.sin( startDirAngle ),
			startInner.z
		);

		const endOuter = new Vector3(
			endInner.x + depth * Math.cos( endDirAngle ),
			endInner.y + depth * Math.sin( endDirAngle ),
			endInner.z
		);

		const corners = [ startInner, endInner, endOuter, startOuter ];
		const width = startInner.distanceTo( endInner );
		const area = this.computeQuadArea( startInner, endInner, endOuter, startOuter );

		const center = this.computeGroupCenter( placements, startIndex, endIndex );
		const meanHeading = center.hdg;
		const perpAngle = meanHeading + offsetSign * Math.PI / 2;
		const heading = perpAngle + offsetSign * this.stallAngle;

		return {
			corners,
			heading,
			center,
			width,
			area,
			startIndex,
			endIndex
		};
	}

	private computeQuadArea ( a: Vector3, b: Vector3, c: Vector3, d: Vector3 ): number {

		return Maths.areaOfTriangle( a, b, c ) + Maths.areaOfTriangle( a, c, d );
	}

	private computeGroupCenter ( placements: ParkingStallPlacement[], startIndex: number, endIndex: number ): TvPosTheta {

		let sumX = 0;
		let sumY = 0;
		let sumCos = 0;
		let sumSin = 0;
		let count = 0;

		for ( let i = startIndex; i <= endIndex; i++ ) {
			const center = placements[ i ].center;
			sumX += center.x;
			sumY += center.y;
			sumCos += Math.cos( center.hdg );
			sumSin += Math.sin( center.hdg );
			count++;
		}

		if ( count === 0 ) {
			return new TvPosTheta( 0, 0, 0 );
		}

		const avgX = sumX / count;
		const avgY = sumY / count;
		const avgHdg = Math.atan2( sumSin, sumCos );

		return new TvPosTheta( avgX, avgY, avgHdg );
	}

	private getPointOnSegments ( segments: PolylineSegment[], distance: number ): TvPosTheta {

		if ( segments.length === 0 ) {
			return new TvPosTheta( 0, 0, 0 );
		}

		const EPS = 1e-6;
		const lastSegment = segments[ segments.length - 1 ];
		const totalLength = lastSegment.cumulativeStart + lastSegment.length;
		const clampedDistance = Maths.clamp( distance, 0, totalLength );

		for ( const segment of segments ) {

			if ( clampedDistance <= segment.cumulativeStart + segment.length + EPS ) {

				const distIntoSegment = clampedDistance - segment.cumulativeStart;
				const ratio = segment.length > EPS ? Maths.clamp( distIntoSegment / segment.length, 0, 1 ) : 0;
				const x = segment.start.x + ratio * ( segment.end.x - segment.start.x );
				const y = segment.start.y + ratio * ( segment.end.y - segment.start.y );

				return new TvPosTheta( x, y, segment.heading );
			}
		}

		const finalSeg = segments[ segments.length - 1 ];
		return new TvPosTheta( finalSeg.end.x, finalSeg.end.y, finalSeg.heading );
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

		// Load marking color if present
		if ( json.attr_markingColor !== undefined ) {
			parkingCurve.color = json.attr_markingColor as EdgeMarkingColor;
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
			attr_markingColor: this.color,
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
