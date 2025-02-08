import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { CatmullRomSpline } from "app/core/shapes/catmull-rom-spline";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Maths } from "app/utils/maths";
import { Vector3 } from "three";
import { MathUtils } from "three/src/math/MathUtils";
import { ParkingGraph } from "./parking-graph";
import { ParkingEdge } from "./parking-edge";
import { ParkingNode } from "./parking-node";
import { ParkingRegion } from "./parking-region";

/**
 * @deprecated
 */
export class ParkingSpot {

	public static DEFAULT_WIDTH = 2.5;
	public static DEFAULT_LENGTH = 5.5;

	public readonly id: string;

	private position: Vector3;

	constructor ( id?: string, position?: Vector3, public width = 4, public length = 2, public heading = 0 ) {
		this.id = id ?? MathUtils.generateUUID();
		this.position = position;
	}

	setPosition ( position: Vector3 ): void {
		this.position = position;
	}

	getPosition (): Vector3 {
		return this.position;
	}

}

/**
 * @deprecated
 */
export class OldParkingCurve {

	public static tag = 'parkingCurve';

	public readonly id: string;

	private parkingSpots: ParkingSpot[] = [];

	private parkingSpotWidth: number = ParkingSpot.DEFAULT_WIDTH;
	private parkingSpotLength: number = ParkingSpot.DEFAULT_LENGTH;

	constructor ( id?: string, private spline?: AbstractSpline ) {
		this.id = id ?? MathUtils.generateUUID();
		this.spline = spline || new CatmullRomSpline( false, 'catmullrom', 0.001 );
	}

	getWidth (): number {
		return this.parkingSpotWidth;
	}

	setWidth ( width: number ): void {
		this.parkingSpotWidth = width;
	}

	getLength (): number {
		return this.parkingSpotLength;
	}

	setLength ( length: number ): void {
		this.parkingSpotLength = length;
	}

	getParkingSpots (): readonly ParkingSpot[] {
		return this.parkingSpots;
	}

	getSpline (): AbstractSpline {
		return this.spline;
	}

	setSpline ( spline: AbstractSpline ): void {
		this.spline = spline;
	}

	addPoint ( point: AbstractControlPoint ): void {
		this.spline.addControlPoint( point );
	}

	removePoint ( point: AbstractControlPoint ): void {
		this.spline.removeControlPoint( point );
	}

	getPotentialSpots (): TvPosTheta[] {

		const centerPositions: TvPosTheta[] = [];

		const spotWidth = this.parkingSpotWidth ?? ParkingSpot.DEFAULT_WIDTH;

		for ( let i = 0; i < this.spline.controlPointPositions.length - 1; i++ ) {

			const start = this.spline.controlPointPositions[ i ];
			const end = this.spline.controlPointPositions[ i + 1 ];

			const dx = end.x - start.x;
			const dy = end.y - start.y;
			const segmentLength = Math.sqrt( dx * dx + dy * dy );

			// Number of parking spots that fit this segment
			const spotsPerSegment = Math.floor( segmentLength / spotWidth );

			for ( let j = 0; j < spotsPerSegment; j++ ) {

				// Compute position along the segment
				const t = ( j + 0.5 ) * spotWidth / segmentLength;

				const baseX = start.x + t * dx;
				const baseY = start.y + t * dy;
				const heading = Math.atan2( dy, dx );

				centerPositions.push( new TvPosTheta( baseX, baseY, heading ) );
			}
		}

		return centerPositions;
	}

	getActualSpots (): ParkingSpot[] {

		const positions: ParkingSpot[] = [];

		this.getPotentialSpots().forEach( spot => {

			const spotLength = this.parkingSpotLength / 2

			const leftPosition = new Vector3(
				spot.x + Math.cos( spot.hdg + Maths.PI / 2 ) * spotLength,
				spot.y + Math.sin( spot.hdg + Maths.PI / 2 ) * spotLength,
				0
			);

			const rightPosition = new Vector3(
				spot.x + Math.cos( spot.hdg - Maths.PI / 2 ) * spotLength,
				spot.y + Math.sin( spot.hdg - Maths.PI / 2 ) * spotLength,
				0
			);

			positions.push( new ParkingSpot( null, leftPosition, this.parkingSpotWidth, this.parkingSpotLength, spot.hdg - Maths.PI2 ) );
			positions.push( new ParkingSpot( null, rightPosition, this.parkingSpotWidth, this.parkingSpotLength, spot.hdg + Maths.PI2 ) );

		} );


		return positions;
	}

	update (): void {
		this.parkingSpots = [];
		this.parkingSpots = this.getActualSpots();
	}
}

export class ParkingCurve {

	public static tag = 'parkingCurve';

	public readonly id: string;
	private spline: AbstractSpline;

	// Width along the center line for each stall
	private stallWidth: number = 2.5;
	// Depth outward from center line (perpendicular)
	private stallDepth: number = 5.0; // Adjust as needed

	constructor ( id?: string, spline?: AbstractSpline ) {
		this.id = id ?? MathUtils.generateUUID();
		this.spline = spline || new CatmullRomSpline( false, 'catmullrom', 0.001 );
	}

	public update (): void {

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

	public addPoint ( point: AbstractControlPoint ): void {
		this.spline.addControlPoint( point );
	}

	public getSpline (): AbstractSpline {
		return this.spline;
	}

	public setSpline ( spline: AbstractSpline ): void {
		this.spline = spline;
	}

	public setControlPoints ( points: AbstractControlPoint[] ): void {
		this.spline.setControlPoints( points );
	}

	public getControlPoints (): AbstractControlPoint[] {
		return this.spline.getControlPoints();
	}

	// ------------------------------------------
	// PREVIEW: DOUBLE-SIDED PARKING
	// ------------------------------------------

	/**
	 * Generates ephemeral ParkingRegions for UI preview.
	 * Each "center" spawns two stalls: left & right.
	 */
	public generatePreviewRegions (): ParkingRegion[] {

		const centers = this.getPotentialSpots();
		const previewRegions: ParkingRegion[] = [];

		centers.forEach( ( center, index ) => {

			// Left stall
			{
				const corners = this.computeRectCorners( center, +1 );  // +1 => above centerline
				const tempNodes = corners.map( pos => new ParkingNode( pos ) );
				const tempEdges: ParkingEdge[] = [];

				for ( let i = 0; i < tempNodes.length; i++ ) {
					const start = tempNodes[ i ];
					const end = tempNodes[ ( i + 1 ) % tempNodes.length ];
					tempEdges.push( new ParkingEdge( start, end ) );
				}

				const region = new ParkingRegion( `preview-L-${ this.id }-${ index }`, center.hdg - Maths.PI2 );
				region.setEdges( tempEdges );
				previewRegions.push( region );
			}

			// Right stall
			{
				const corners = this.computeRectCorners( center, -1 ); // -1 => below centerline
				const tempNodes = corners.map( pos => new ParkingNode( pos ) );
				const tempEdges: ParkingEdge[] = [];

				for ( let i = 0; i < tempNodes.length; i++ ) {
					const start = tempNodes[ i ];
					const end = tempNodes[ ( i + 1 ) % tempNodes.length ];
					tempEdges.push( new ParkingEdge( start, end ) );
				}

				const region = new ParkingRegion( `preview-R-${ this.id }-${ index }`, center.hdg + Maths.PI2 );
				region.setEdges( tempEdges );
				previewRegions.push( region );
			}

		} );

		return previewRegions;

	}

	/**
	 * Creates permanent ParkingRegions in the ParkingGraph for each center.
	 * Each center spawns two stalls: left & right.
	 */
	public bake ( graph: ParkingGraph ): ParkingRegion[] {

		const centers = this.getPotentialSpots();
		const newRegions: ParkingRegion[] = [];

		for ( let i = 0; i < centers.length; i++ ) {

			const center = centers[ i ];

			// Left stall
			{
				const corners = this.computeRectCorners( center, +1 );
				const cornerNodes = corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					edges.push( graph.getOrCreateEdge( startNode, endNode ) );
				}

				const region = graph.createRegion( edges );
				newRegions.push( region );
			}

			// Right stall
			{
				const corners = this.computeRectCorners( center, -1 );
				const cornerNodes = corners.map( pos => graph.getOrCreateNode( pos ) );
				const edges: ParkingEdge[] = [];

				for ( let c = 0; c < cornerNodes.length; c++ ) {
					const startNode = cornerNodes[ c ];
					const endNode = cornerNodes[ ( c + 1 ) % cornerNodes.length ];
					edges.push( graph.getOrCreateEdge( startNode, endNode ) );
				}

				const region = graph.createRegion( edges );
				newRegions.push( region );
			}

		}

		return newRegions;
	}

	/**
	 * Computes the corners of one rectangular stall.  We assume:
	 * - 'stallWidth' is along the spline direction
	 * - 'stallDepth' extends outwards from the center line
	 * - offsetSign = +1 => left side, -1 => right side
	 */
	private computeRectCorners ( center: TvPosTheta, offsetSign: number ): Vector3[] {

		const w = this.stallWidth;
		const d = this.stallDepth;

		// Define local corners with the centerline at local Y=0
		// and the outer edge at local Y= offsetSign * d
		const halfW = w * 0.5;
		const localCorners = [
			new Vector3( -halfW, 0, 0 ),
			new Vector3( +halfW, 0, 0 ),
			new Vector3( +halfW, offsetSign * d, 0 ),
			new Vector3( -halfW, offsetSign * d, 0 ),
		];

		// Rotate by the road heading
		const cosH = Math.cos( center.hdg );
		const sinH = Math.sin( center.hdg );

		const worldCorners = localCorners.map( local => {

			// Rotate around origin
			const rx = local.x * cosH - local.y * sinH;
			const ry = local.x * sinH + local.y * cosH;

			// Translate to the stall's center
			return new Vector3(
				center.x + rx,
				center.y + ry,
				0
			);
		} );

		return worldCorners;
	}

	private getPotentialSpots (): TvPosTheta[] {

		const centers: TvPosTheta[] = [];
		const w = this.stallWidth;

		const ctrlPts = this.spline.controlPointPositions;
		for ( let i = 0; i < ctrlPts.length - 1; i++ ) {

			const start = ctrlPts[ i ];
			const end = ctrlPts[ i + 1 ];

			const dx = end.x - start.x;
			const dy = end.y - start.y;
			const segLen = Math.sqrt( dx * dx + dy * dy );

			// how many stalls fit in this segment
			const spotsPerSegment = Math.floor( segLen / w );

			for ( let j = 0; j < spotsPerSegment; j++ ) {

				const t = ( j + 0.5 ) * w / segLen;
				const cx = start.x + t * dx;
				const cy = start.y + t * dy;
				const hdg = Math.atan2( dy, dx ); // direction along the segment

				centers.push( new TvPosTheta( cx, cy, hdg ) );
			}
		}

		return centers;
	}
}

