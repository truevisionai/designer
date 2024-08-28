import { AddObjectCommand } from "./add-object-command";
import { MapEvents } from "../events/map-events";
import { ICommand } from "./command";

describe( 'AddObjectCommand', () => {

	let addObjectCommand: ICommand;
	let object: object;

	beforeEach( () => {

		object = new Object(); // Replace with your test object

		addObjectCommand = new AddObjectCommand( object );

		spyOn( MapEvents.objectAdded, 'emit' );
		spyOn( MapEvents.objectRemoved, 'emit' );

	} );

	it( 'should emit objectAdded event when executed', () => {
		addObjectCommand.execute();
		expect( MapEvents.objectAdded.emit ).toHaveBeenCalledWith( object );
	} );

	it( 'should emit objectRemoved event when undone', () => {
		addObjectCommand.undo();
		expect( MapEvents.objectRemoved.emit ).toHaveBeenCalledWith( object );
	} );

	it( 'should execute the command when redone', () => {
		addObjectCommand.redo();
		expect( MapEvents.objectAdded.emit ).toHaveBeenCalledWith( object );
	} );

} );
