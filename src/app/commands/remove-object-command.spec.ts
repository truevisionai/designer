import { MapEvents } from 'app/events/map-events';
import { RemoveObjectCommand } from './remove-object-command';

describe( 'RemoveObjectCommand', () => {

	let command: RemoveObjectCommand;
	let object: any;
	let fireUnselectEvent: boolean;

	beforeEach( () => {

		object = { id: 1 };

		fireUnselectEvent = true;

		spyOn( MapEvents.objectAdded, 'emit' );
		spyOn( MapEvents.objectRemoved, 'emit' );
		spyOn( MapEvents.objectSelected, 'emit' );
		spyOn( MapEvents.objectUnselected, 'emit' );

		command = new RemoveObjectCommand( object, fireUnselectEvent );

	} );

	describe( 'execute', () => {

		it( 'should emit objectUnselected event when fireUnselectEvent is true', () => {
			command.execute();
			expect( MapEvents.objectUnselected.emit ).toHaveBeenCalledTimes( 1 );
			expect( MapEvents.objectUnselected.emit ).toHaveBeenCalledWith( object );
		} );

		it( 'should not emit objectUnselected event when fireUnselectEvent is false', () => {
			command = new RemoveObjectCommand( object, false );
			command.execute();
			expect( MapEvents.objectUnselected.emit ).not.toHaveBeenCalled();
		} );

		it( 'should emit objectRemoved event', () => {
			command.execute();
			expect( MapEvents.objectRemoved.emit ).toHaveBeenCalledTimes( 1 );
			expect( MapEvents.objectRemoved.emit ).toHaveBeenCalledWith( object );
		} );
	} );

	describe( 'undo', () => {
		it( 'should emit objectAdded event', () => {
			command.undo();
			expect( MapEvents.objectAdded.emit ).toHaveBeenCalledTimes( 1 );
			expect( MapEvents.objectAdded.emit ).toHaveBeenCalledWith( object );
		} );

		it( 'should emit objectSelected event when fireUnselectEvent is true', () => {
			command.undo();
			expect( MapEvents.objectSelected.emit ).toHaveBeenCalledTimes( 1 );
			expect( MapEvents.objectSelected.emit ).toHaveBeenCalledWith( object );
		} );

		it( 'should not emit objectSelected event when fireUnselectEvent is false', () => {
			command = new RemoveObjectCommand( object, false );
			command.undo();
			expect( MapEvents.objectSelected.emit ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'redo', () => {
		it( 'should call execute method', () => {
			const executeSpy = spyOn( command, 'execute' );
			command.redo();
			expect( executeSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
