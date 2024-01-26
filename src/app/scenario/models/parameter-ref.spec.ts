/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ScenarioService } from '../services/scenario.service';
import { ParameterRef } from './parameter-ref';
import { ParameterType } from './tv-enums';
import { Parameter, ParameterDeclaration } from './tv-parameter-declaration';

describe( 'ParameterRef', () => {

	beforeEach( () => {
		ScenarioService.scenario.parameterDeclarations.splice( 0, ScenarioService.scenario.parameterDeclarations.length );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$A', ParameterType.integer, '5' ) ) );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$B', ParameterType.double, '2.5' ) ) );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$C', ParameterType.integer, '8' ) ) );
	} );

	it( 'should identify and interpret literals string correctly', () => {
		const ref = new ParameterRef( '5.6' );
		expect( ref.getInterpretedValue() ).toBe( '5.6' );
	} );

	it( 'should identify and interpret literals number correctly', () => {
		const ref = new ParameterRef( 5.6 );
		expect( ref.getInterpretedValue() ).toBe( '5.6' );
		expect( ref.toFloat() ).toBe( 5.6 );
	} );

	it( 'should identify and interpret parameters correctly', () => {
		const ref = new ParameterRef( '$A' );
		expect( ref.getInterpretedValue() ).toBe( 5 );
	} );

	it( 'should identify and interpret expressions correctly', () => {
		const ref1 = new ParameterRef( '${$A + $B}' );
		expect( ref1.getInterpretedValue() ).toBe( 7.5 );

		const ref2 = new ParameterRef( '${pow($A, 2)}' );
		expect( ref2.getInterpretedValue() ).toBe( 25 );

		const ref3 = new ParameterRef( '${round(2.6)}' );
		expect( ref3.getInterpretedValue() ).toBe( 3 );
	} );

	it( 'should throw error for undefined parameters', () => {
		const ref = new ParameterRef( '$Undefined' );
		expect( () => ref.getInterpretedValue() ).toThrow( new Error( 'Parameter \'Undefined\' is not defined' ) );
	} );

	it( 'should throw error for unsafe or unsupported expressions', () => {
		const ref = new ParameterRef( '${console.log("This is unsafe")}' );
		expect( () => ref.getInterpretedValue() ).toThrow( new Error( 'Unsafe or unsupported expression' ) );
	} );

	// ... Additional tests as needed

} );


describe( 'ParameterRef Boolean Operators', () => {

	beforeEach( () => {
		ScenarioService.scenario.parameterDeclarations.splice( 0, ScenarioService.scenario.parameterDeclarations.length );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$A', ParameterType.boolean, 'true' ) ) );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$B', ParameterType.boolean, 'false' ) ) );
		ScenarioService.scenario.addParameterDeclaration( new ParameterDeclaration( new Parameter( '$C', ParameterType.boolean, 'false' ) ) );
	} );

	it( 'should evaluate NOT operator correctly', () => {
		const ref1 = new ParameterRef( '${not $A}' );
		expect( ref1.getInterpretedValue() ).toBe( false );  // Assuming $A returns true

		const ref2 = new ParameterRef( '${not $B}' );
		expect( ref2.getInterpretedValue() ).toBe( true );   // Assuming $B returns false
	} );

	it( 'should evaluate AND operator correctly', () => {
		const ref1 = new ParameterRef( '${$A and $B}' );
		expect( ref1.getInterpretedValue() ).toBe( false );  // Assuming $A returns true and $B returns false

		const ref2 = new ParameterRef( '${$A and not $B}' );
		expect( ref2.getInterpretedValue() ).toBe( true );   // Assuming $A returns true and $B returns false
	} );

	it( 'should evaluate OR operator correctly', () => {
		const ref1 = new ParameterRef( '${$A or $B}' );
		expect( ref1.getInterpretedValue() ).toBe( true );   // Assuming $A returns true, regardless of $B

		const ref2 = new ParameterRef( '${$B or not $A}' );
		expect( ref2.getInterpretedValue() ).toBe( false );   // Assuming $A returns true and $B returns false
	} );

	it( 'should evaluate complex boolean expressions correctly', () => {
		const ref1 = new ParameterRef( '${not $A and $B}' );
		expect( ref1.getInterpretedValue() ).toBe( false );  // Given: not true AND false => false

		const ref2 = new ParameterRef( '${$A or $B and not $C}' );
		expect( ref2.getInterpretedValue() ).toBe( true );   // Given: true OR (false AND not false) => true
	} );

	it( 'should handle precedence of boolean operators correctly', () => {
		const ref1 = new ParameterRef( '${$A or $B and not $C or not $A}' );
		// Assuming:
		// $A => true
		// $B => false
		// $C => false
		// The expression is equivalent to:
		// true OR (false AND not false) OR not true => true
		expect( ref1.getInterpretedValue() ).toBe( true );
	} );

} );
