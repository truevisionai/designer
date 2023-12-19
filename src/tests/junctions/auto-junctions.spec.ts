import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { RoadEventListener } from 'app/listeners/road-event-listener';
import { JunctionService } from 'app/services/junction/junction.service';
import { RoadService } from 'app/services/road/road.service';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';
import { Vector3 } from 'three';

describe( 'automatic junctions', () => {

	let tool: RoadTool;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

	} );

	it( 'should create tool', () => {

		expect( tool ).toBeDefined();

	} );

	it( 'should create 4-way junction', inject( [ RoadService, JunctionService, RoadEventListener ], (
		roadService: RoadService,
		junctionService: JunctionService,
		roadEventListener: RoadEventListener,
	) => {

		const leftRightRoad = roadService.createDefaultRoad();
		leftRightRoad.spline.addControlPointAt( new Vector3( -50, 0, 0 ) );
		leftRightRoad.spline.addControlPointAt( new Vector3( 50, 0, 0 ) );

		const topDownRoad = roadService.createDefaultRoad();
		topDownRoad.spline.addControlPointAt( new Vector3( 0, -50, 0 ) );
		topDownRoad.spline.addControlPointAt( new Vector3( 0, 50, 0 ) );

		roadService.addRoad( leftRightRoad );
		roadService.addRoad( topDownRoad );

		roadEventListener.checkIntersections( topDownRoad );

		const junction = junctionService.junctions[ 0 ];
		const connections = junction.getConnections();

		// expect( leftRightRoad.length ).toBe( 100 );

		expect( junction.id ).toBe( 1 );
		expect( connections.length ).toBe( 12 );
		expect( roadService.roads.length ).toBe( 16 );

		for ( let i = 1; i <= 12; i++ ) {

			const road = roadService.getRoad( i );

			expect( road ).toBeDefined();
			expect( road.getRoadCoordAt( 0 ) ).toBeDefined();

			if ( road.spline.controlPoints.length == 2 ) {

				expect( road.spline.controlPoints.length ).toBe( 2 );
				expect( road.geometries.length ).toBe( 1 );

			} else {

				expect( road.spline.controlPoints.length ).toBe( 4 );

			}

		}

		for ( let i = 0; i < connections.length; i++ ) {

			expect( junction.connections.get( i ) ).toBeDefined();
			expect( junction.connections.get( i ).laneLink.length ).toBe( 3 );
			expect( junction.connections.get( i ).connectingRoad.spline.controlPoints.length ).toBe( 4 );

		}

		expect( junction.connections.get( 0 ).incomingRoad.id ).toBe( 2 );
		expect( junction.connections.get( 0 ).outgoingRoad.id ).toBe( 1 );
		expect( junction.connections.get( 0 ).connectingRoad.id ).toBe( 5 );

		const connectingRoad4to5 = junction.connections.get( 0 ).connectingRoad;

		expect( connectingRoad4to5.geometries.length ).toBe( 5 );

	} ) );


} );
