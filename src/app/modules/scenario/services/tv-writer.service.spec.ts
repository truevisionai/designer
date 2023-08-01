/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	EnumTrajectoryDomain,
	ClothoidShape,
	ControlPoint,
	PolylineShape,
	SplineShape,
	Trajectory,
	Vertex
} from '../models/tv-trajectory';
import { WorldPosition } from '../models/positions/tv-world-position';
import { WriterService } from './tv-writer.service';
import { ScenarioEntity } from '../models/entities/scenario-entity';
import { VehicleEntity } from '../models/entities/vehicle-entity';
import { DynamicsShape, OpenScenarioVersion } from '../models/tv-enums';
import { LaneOffsetAction } from '../models/actions/tv-lane-offset-action';
import { RelativeTarget } from '../models/actions/tv-relative-target';

describe( 'WriterService', () => {

	let writer: WriterService;

	beforeEach( () => {
		writer = new WriterService();
	} );

	it( 'should write trajectory correctly', () => {

		const trajectory = new Trajectory(
			'TrajectoryName', true, EnumTrajectoryDomain.Distance
		);

		const xml = writer.writeTrajectory( trajectory );

		expect( xml.attr_name ).toBe( trajectory.name );
		expect( xml.attr_domain ).toBe( trajectory.domain );
		expect( xml.attr_closed ).toBe( trajectory.closed );

	} );

	it( 'should write vertex correctly', () => {

		spyOnProperty( writer, 'version', 'get' ).and.returnValue( OpenScenarioVersion.v0_9 );

		const vertex = new Vertex();
		vertex.position = new WorldPosition( 1, 2, 3 );
		vertex.time = 1;
		vertex.shape = new PolylineShape;

		const xml = writer.writeVertex( vertex );

		expect( xml.attr_reference ).toBe( vertex.time );

	} );

	// it( 'should write clothoid correcty', () => {

	// 	// const clothoid = new ClothoidShape();
	// 	// clothoid.curvature = 1;
	// 	// clothoid.curvatureDot = 2;
	// 	// clothoid.length = 3;

	// 	// const xml = writer.writeClothoid( clothoid );

	// 	// expect( xml.Clothoid.attr_curvature ).toBe( clothoid.curvature );
	// 	// expect( xml.Clothoid.attr_curvatureDot ).toBe( clothoid.curvatureDot );
	// 	// expect( xml.Clothoid.attr_length ).toBe( clothoid.length );

	// } );

	it( 'should write spline correctly', () => {

		const spline = new SplineShape;
		spline.controlPoint1 = new ControlPoint( 'one' );
		spline.controlPoint2 = new ControlPoint( 'two' );

		const xml = writer.writeSpline( spline );

		expect( xml.Spline.ControlPoint1.attr_status ).toBe( spline.controlPoint1.status );
		expect( xml.Spline.ControlPoint2.attr_status ).toBe( spline.controlPoint2.status );

	} );

	it( 'should write entities correctly 0.9', () => {

		spyOnProperty( writer, 'version', 'get' ).and.returnValue( OpenScenarioVersion.v0_9 );

		const root = {}

		writer.writeEntities( root, new Map<string, ScenarioEntity>() );

		expect( root[ 'Entities' ].Object.length ).toBe( 0 );

	} );

	it( 'should write entities correctly 1.0', () => {

		spyOnProperty( writer, 'version', 'get' ).and.returnValue( OpenScenarioVersion.v1_0 );

		const root = {}

		writer.writeEntities( root, new Map<string, ScenarioEntity>() );

		expect( root[ 'Entities' ].ScenarioObject.length ).toBe( 0 );

	} );

	it( 'should write LaneOffset correctly 0.9', () => {

		spyOnProperty( writer, 'version', 'get' ).and.returnValue( OpenScenarioVersion.v0_9 );

		const xml = writer.writePrivateAction( new LaneOffsetAction( false, 0.1, DynamicsShape.linear, new RelativeTarget( 'test', 1 ) ) );

		expect( xml.Lateral.LaneOffset.Dynamics.attr_continuous ).toBe( undefined );
		expect( xml.Lateral.LaneOffset.Dynamics.attr_maxLateralAcc ).toBe( 0.1 );
		expect( xml.Lateral.LaneOffset.Dynamics.attr_shape ).toBe( DynamicsShape.linear );

		expect( xml.Lateral.LaneOffset.Target.Relative.attr_object ).toBe( 'test' );
		expect( xml.Lateral.LaneOffset.Target.Relative.attr_value ).toBe( 1 );

	} );

	it( 'should write LaneOffset correctly 1.0', () => {

		spyOnProperty( writer, 'version', 'get' ).and.returnValue( OpenScenarioVersion.v1_0 );

		const xml = writer.writePrivateAction( new LaneOffsetAction( false, 0.1, DynamicsShape.linear, new RelativeTarget( 'test', 1 ) ) );

		expect( xml.LateralAction.LaneOffsetAction.attr_continuous ).toBe( false );
		expect( xml.LateralAction.LaneOffsetAction.LaneOffsetActionDynamics.attr_maxLateralAcc ).toBe( 0.1 );
		expect( xml.LateralAction.LaneOffsetAction.LaneOffsetActionDynamics.attr_dynamicsShape ).toBe( DynamicsShape.linear );

	} );


} );
