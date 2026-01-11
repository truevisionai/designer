import { determineTurnType } from "app/map/models/connections/connection-utils";
import { TurnType, TvContactPoint } from "app/map/models/tv-common";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { Vector3 } from "three";

describe( 'determineTurnType', () => {

	interface CoordOptions {
		position: Vector3;
		heading: number;
		contact?: TvContactPoint;
		spline?: { equals: ( other: any ) => boolean };
	}

	function createCoord ( { position, heading, contact = TvContactPoint.END, spline }: CoordOptions ): TvRoadCoord {

		const posTheta = new TvPosTheta( position.x, position.y, heading );
		const splineRef = spline ?? {
			equals: function ( other: any ) {
				return other === this;
			}
		};

		const road = {
			spline: splineRef,
			getPosThetaByContact: () => posTheta.clone(),
		} as unknown as TvRoad;

		return {
			road,
			contact,
		} as TvRoadCoord;

	}

	function createLaneCoord ( options: { position: Vector3; heading: number; roadHeading?: number; contact?: TvContactPoint } ): TvLaneCoord {

		const roadHeading = options.roadHeading ?? options.heading;
		const posTheta = new TvPosTheta( options.position.x, options.position.y, roadHeading );

		const road = {
			spline: { equals: () => false },
			getPosThetaByContact: () => posTheta.clone(),
		} as unknown as TvRoad;

		return {
			road,
			contact: options.contact ?? TvContactPoint.END,
			lane: {} as any,
			position: options.position.clone(),
			getLaneHeading: () => options.heading,
		} as TvLaneCoord;

	}

	it( 'short circuits when entry and exit share the same spline', () => {

		const spline = { equals: ( other ) => other === spline };

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0, contact: TvContactPoint.END, spline } );
		const exit = createCoord( { position: new Vector3( 100, 0, 0 ), heading: 0, contact: TvContactPoint.START, spline } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );

	} );

	it( 'treats opposing straight roads as straight', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0, contact: TvContactPoint.END } );
		const exit = createCoord( { position: new Vector3( 10, 0, 0 ), heading: 0, contact: TvContactPoint.START } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );

	} );

	it( 'ignores lateral offsets for gentle deflections', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0 } );
		const exit = createCoord( { position: new Vector3( 10, 0.5, 0 ), heading: 0 } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );

	} );

	it( 'treats shallow deflection with large lateral offset as a right turn', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0, contact: TvContactPoint.END } );
		const exit = createCoord( { position: new Vector3( 20, -2, 0 ), heading: 0, contact: TvContactPoint.END } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.RIGHT );

	} );

	it( 'identifies right turns when exit heading rotates clockwise', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0 } );
		const exit = createCoord( { position: new Vector3( 0, -10, 0 ), heading: -Math.PI / 2 } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.RIGHT );

	} );

	it( 'identifies left turns when exit heading rotates counter-clockwise', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0 } );
		const exit = createCoord( { position: new Vector3( 0, 10, 0 ), heading: Math.PI / 2 } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.LEFT );

	} );

	it( 'treats coincident coordinates as straight', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0 } );
		const exit = createCoord( { position: new Vector3( 0.00001, 0, 0 ), heading: Math.PI / 4 } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );

	} );

	it( 'handles entry contact START by flipping heading to stay straight', () => {

		const entry = createCoord( { position: new Vector3( 10, 0, 0 ), heading: 0, contact: TvContactPoint.START } );
		const exit = createCoord( { position: new Vector3( 0, 0, 0 ), heading: Math.PI, contact: TvContactPoint.END } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.STRAIGHT );

	} );

	it( 'classifies a u-turn as left', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: 0 } );
		const exit = createCoord( { position: new Vector3( -10, 0, 0 ), heading: Math.PI } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.LEFT );

	} );

	it( 'prefers lane heading over road heading when available', () => {

		const entryLane = createLaneCoord( {
			position: new Vector3( 0, 0, 0 ),
			heading: Math.PI / 2,
			roadHeading: 0
		} );

		const exit = createCoord( { position: new Vector3( 10, 5, 0 ), heading: 0 } );

		expect( determineTurnType( entryLane, exit ) ).toBe( TurnType.RIGHT );

	} );

	it( 'uses exit heading when positional vector stays colinear', () => {

		const entry = createCoord( { position: new Vector3( 0, 0, 0 ), heading: Math.PI / 2, contact: TvContactPoint.END } );
		const exit = createCoord( { position: new Vector3( 0, 10, 0 ), heading: 0, contact: TvContactPoint.END } );

		expect( determineTurnType( entry, exit ) ).toBe( TurnType.RIGHT );

	} );

} );
