import { CommandHistory } from './command-history';
import { ICommand } from './command';

class MockCommand implements ICommand {
	execute (): void {
		// Mock implementation
	}
	undo (): void {
		// Mock implementation
	}
	redo (): void {
		// Mock implementation
	}
}

describe( 'CommandHistory', () => {

	let mockCommand: MockCommand;

	beforeEach( () => {
		mockCommand = new MockCommand();
		CommandHistory.clear();
	} );

	it( 'should clear history', () => {
		CommandHistory.execute( mockCommand );
		CommandHistory.clear();
		expect( CommandHistory.getUndosCount() ).toBe( 0 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );

	it( 'should execute a command and add it to undos', () => {
		spyOn( mockCommand, 'execute' );
		CommandHistory.execute( mockCommand );
		expect( mockCommand.execute ).toHaveBeenCalled();
		expect( CommandHistory.getUndosCount() ).toBe( 1 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );

	it( 'should execute multiple commands using executeMany', () => {
		const mockCommand2 = new MockCommand();
		spyOn( mockCommand, 'execute' );
		spyOn( mockCommand2, 'execute' );
		CommandHistory.executeMany( mockCommand, mockCommand2 );
		expect( mockCommand.execute ).toHaveBeenCalled();
		expect( mockCommand2.execute ).toHaveBeenCalled();
		expect( CommandHistory.getUndosCount() ).toBe( 1 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );

	it( 'should undo the last executed command', () => {
		spyOn( mockCommand, 'undo' );
		CommandHistory.execute( mockCommand );
		CommandHistory.undo();
		expect( mockCommand.undo ).toHaveBeenCalled();
		expect( CommandHistory.getUndosCount() ).toBe( 0 );
		expect( CommandHistory.getRedosCount() ).toBe( 1 );
	} );

	it( 'should redo the last undone command', () => {
		spyOn( mockCommand, 'redo' );
		CommandHistory.execute( mockCommand );
		CommandHistory.undo();
		CommandHistory.redo();
		expect( mockCommand.redo ).toHaveBeenCalled();
		expect( CommandHistory.getUndosCount() ).toBe( 1 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );

	it( 'should not undo if there are no commands to undo', () => {
		CommandHistory.undo();
		expect( CommandHistory.getUndosCount() ).toBe( 0 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );

	it( 'should not redo if there are no commands to redo', () => {
		CommandHistory.redo();
		expect( CommandHistory.getUndosCount() ).toBe( 0 );
		expect( CommandHistory.getRedosCount() ).toBe( 0 );
	} );
} );
