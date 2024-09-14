/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetPositionCommand } from './set-position-command';
import { IHasPosition } from '../objects/i-has-position';
import { Object3D, Vector3 } from 'three';

class MockObject extends Object3D implements IHasPosition {

	setPosition ( position: Vector3 ): void {
		this.position.copy( position );
	}

	getPosition (): Vector3 {
		return this.position.clone();
	}

}

describe( 'SetPositionCommand', () => {

	let object: IHasPosition;
	let newPosition: Vector3;
	let oldPosition: Vector3;
	let setPositionCommand: SetPositionCommand;

	beforeEach( () => {

		object = new MockObject();
		newPosition = new Vector3( 1, 2, 3 );
		oldPosition = new Vector3( 4, 5, 6 );

		setPositionCommand = new SetPositionCommand( object, newPosition, oldPosition );

		spyOn( object, 'setPosition' )
		spyOn( object, 'updateMatrixWorld' );

	} );

	it( 'should execute the command correctly', () => {

		setPositionCommand.execute();

		expect( object.setPosition ).toHaveBeenCalledWith( newPosition );
		expect( object.updateMatrixWorld ).toHaveBeenCalledWith( true );
		// Add more expectations here
	} );

	it( 'should undo the command correctly', () => {

		setPositionCommand.undo();

		expect( object.setPosition ).toHaveBeenCalledWith( oldPosition );
		expect( object.updateMatrixWorld ).toHaveBeenCalledWith( true );
		// Add more expectations here
	} );

	it( 'should redo the command correctly', () => {

		setPositionCommand.redo();

		expect( object.setPosition ).toHaveBeenCalledWith( newPosition );
		expect( object.updateMatrixWorld ).toHaveBeenCalledWith( true );
		// Add more expectations here
	} );

} );
