/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddSplineCommand } from "./add-spline-command";
import { MapEvents } from "../events/map-events";
import { AbstractSpline } from "../core/shapes/abstract-spline";
import { ICommand } from "./command";
import { SplineFactory } from "app/services/spline/spline.factory";
import { Vector3 } from "three";
import { AbstractControlPoint } from "../objects/abstract-control-point";

describe( 'AddSplineCommand', () => {

	let addSplineCommand: ICommand;
	let spline: AbstractSpline;
	let point: AbstractControlPoint;

	beforeEach( () => {

		spline = SplineFactory.createAtPosition( new Vector3() );

		addSplineCommand = new AddSplineCommand( spline );

		point = spline.getControlPoints()[ 0 ];

		spyOn( MapEvents.objectSelected, 'emit' );
		spyOn( MapEvents.objectUnselected, 'emit' );
		spyOn( MapEvents.objectAdded, 'emit' );
		spyOn( MapEvents.objectRemoved, 'emit' );

	} );

	it( 'should emit objectAdded and objectSelected events when executed', () => {

		addSplineCommand.execute();

		expect( MapEvents.objectAdded.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectSelected.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectSelected.emit ).toHaveBeenCalledWith( point );

	} );

	it( 'should not emit if spline has no control points when executed', () => {

		spyOn( spline, 'getControlPointCount' ).and.returnValue( 0 );

		addSplineCommand.execute();

		expect( MapEvents.objectAdded.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectSelected.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectSelected.emit ).not.toHaveBeenCalledWith( point );

	} );

	it( 'should emit objectUnselected and objectRemoved events when undone', () => {

		addSplineCommand.undo();

		expect( MapEvents.objectUnselected.emit ).toHaveBeenCalledWith( point );
		expect( MapEvents.objectUnselected.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectRemoved.emit ).toHaveBeenCalledWith( spline );

	} );

	it( 'should emit point if spline has no control points when undone', () => {

		spyOn( spline, 'getControlPointCount' ).and.returnValue( 0 );

		addSplineCommand.undo();

		expect( MapEvents.objectUnselected.emit ).not.toHaveBeenCalledWith( point );
		expect( MapEvents.objectUnselected.emit ).toHaveBeenCalledWith( spline );
		expect( MapEvents.objectRemoved.emit ).toHaveBeenCalledWith( spline );

	} );

	it( 'should execute the command when redone', () => {

		spyOn( addSplineCommand, 'execute' );

		addSplineCommand.redo();

		expect( addSplineCommand.execute ).toHaveBeenCalled();

	} );

} );
