import { Commands } from './commands';
import { CommandHistory } from './command-history';
import { Tool } from 'app/tools/tool';
import { Vector3 } from 'three';
import { SplineFactory } from 'app/services/spline/spline.factory';
import { ControlPointFactory } from 'app/factories/control-point.factory';

describe( 'Commands', () => {

	beforeEach( () => {
		spyOn( CommandHistory, 'execute' );
	} );

	it( 'should call execute for SetTool', () => {
		const tool = {} as Tool;
		Commands.SetTool( tool );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

	it( 'should call execute for SetValue', () => {
		const object = { attr: 'value' };
		Commands.SetValue( object, 'attr', 'newValue', 'oldValue' );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

	it( 'should call execute for Select', () => {
		const object = {};
		Commands.Select( object );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

	it( 'should call execute for Unselect', () => {
		const object = {};
		Commands.Unselect( object );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

	it( 'should call execute for SetPointPosition', () => {
		const spline = SplineFactory.createAtPosition( new Vector3() );
		const point = ControlPointFactory.createControl( spline, new Vector3() );
		const newPosition = new Vector3();
		Commands.SetPointPosition( spline, point, newPosition );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

	it( 'should call execute for DragSpline', () => {
		const spline = SplineFactory.createAtPosition( new Vector3() );
		const delta = new Vector3();
		Commands.DragSpline( spline, delta );
		expect( CommandHistory.execute ).toHaveBeenCalled();
	} );

} );
