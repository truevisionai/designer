import { OscWriterService } from "./osc-writer.service";
import { OscTrajectory, EnumTrajectoryDomain, OscVertex, OscPolylineShape, OscClothoidShape, OscSplineShape, OscControlPoint } from '../models/osc-trajectory';
import { OscWorldPosition } from '../models/positions/osc-world-position';
import { write } from 'fs';

describe( 'OscWriterService', () => {

	let writer: OscWriterService;

	beforeEach( () => { writer = new OscWriterService(); } );

	it( 'should write trajectory correctly', () => {

		const trajectory = new OscTrajectory(
			"TrajectoryName", true, EnumTrajectoryDomain.Distance
		);

		const xml = writer.writeTrajectory( trajectory );

		expect( xml.Trajectory.attr_name ).toBe( trajectory.name );
		expect( xml.Trajectory.attr_domain ).toBe( trajectory.domain );
		expect( xml.Trajectory.attr_closed ).toBe( trajectory.closed );

	} );

	it( 'should write vertex correctly', () => {

		const vertex = new OscVertex();
		vertex.position = new OscWorldPosition( 1, 2, 3 );
		vertex.reference = 1;
		vertex.shape = new OscPolylineShape;

		const xml = writer.writeVertex( vertex );

		expect( xml.attr_reference ).toBe( vertex.reference );

	} );

	it( 'should write clothoid correcty', () => {

		const clothoid = new OscClothoidShape();
		clothoid.curvature = 1;
		clothoid.curvatureDot = 2;
		clothoid.length = 3;

		const xml = writer.writeClothoid( clothoid );

		expect( xml.Clothoid.attr_curvature ).toBe( clothoid.curvature );
		expect( xml.Clothoid.attr_curvatureDot ).toBe( clothoid.curvatureDot );
		expect( xml.Clothoid.attr_length ).toBe( clothoid.length );

	} );

	it( 'should write spline correctly', () => {

		const spline = new OscSplineShape;
		spline.controlPoint1 = new OscControlPoint( 'one' );
		spline.controlPoint2 = new OscControlPoint( 'two' );

		const xml = writer.writeSpline( spline );

		expect( xml.Spline.ControlPoint1.attr_status ).toBe( spline.controlPoint1.status );
		expect( xml.Spline.ControlPoint2.attr_status ).toBe( spline.controlPoint2.status );

	} );



} );
