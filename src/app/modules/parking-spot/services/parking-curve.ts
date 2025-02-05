import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { CatmullRomSpline } from "app/core/shapes/catmull-rom-spline";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { Maths } from "app/utils/maths";
import { Vector3 } from "three";
import { MathUtils } from "three/src/math/MathUtils";

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

export class ParkingCurve {

	public static tag = 'parkingCurve';

	public readonly id: string;

	private parkingSpots: ParkingSpot[] = [];

	constructor ( id?: string, private spline?: AbstractSpline ) {
		this.id = id ?? MathUtils.generateUUID();
		this.spline = spline || new CatmullRomSpline( false, 'catmullrom', 0.001 );
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

		const spotWidth = ParkingSpot.DEFAULT_WIDTH;

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

			const spotLength = ParkingSpot.DEFAULT_LENGTH / 2

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

			positions.push( new ParkingSpot( null, leftPosition, ParkingSpot.DEFAULT_WIDTH, ParkingSpot.DEFAULT_LENGTH, spot.hdg - Maths.PI2 ) );
			positions.push( new ParkingSpot( null, rightPosition, ParkingSpot.DEFAULT_WIDTH, ParkingSpot.DEFAULT_LENGTH, spot.hdg + Maths.PI2 ) );

		} );


		return positions;
	}

	update (): void {
		this.parkingSpots = [];
		this.parkingSpots = this.getActualSpots();
	}
}
