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

		expect( xml.Trajectory.attr_name ).toBe( trajectory.name );
		expect( xml.Trajectory.attr_domain ).toBe( trajectory.domain );
		expect( xml.Trajectory.attr_closed ).toBe( trajectory.closed );

	} );

	it( 'should write vertex correctly', () => {

		const vertex = new Vertex();
		vertex.position = new WorldPosition( 1, 2, 3 );
		vertex.reference = 1;
		vertex.shape = new PolylineShape;

		const xml = writer.writeVertex( vertex );

		expect( xml.attr_reference ).toBe( vertex.reference );

	} );

	it( 'should write clothoid correcty', () => {

		const clothoid = new ClothoidShape();
		clothoid.curvature = 1;
		clothoid.curvatureDot = 2;
		clothoid.length = 3;

		const xml = writer.writeClothoid( clothoid );

		expect( xml.Clothoid.attr_curvature ).toBe( clothoid.curvature );
		expect( xml.Clothoid.attr_curvatureDot ).toBe( clothoid.curvatureDot );
		expect( xml.Clothoid.attr_length ).toBe( clothoid.length );

	} );

	it( 'should write spline correctly', () => {

		const spline = new SplineShape;
		spline.controlPoint1 = new ControlPoint( 'one' );
		spline.controlPoint2 = new ControlPoint( 'two' );

		const xml = writer.writeSpline( spline );

		expect( xml.Spline.ControlPoint1.attr_status ).toBe( spline.controlPoint1.status );
		expect( xml.Spline.ControlPoint2.attr_status ).toBe( spline.controlPoint2.status );

	} );


} );
