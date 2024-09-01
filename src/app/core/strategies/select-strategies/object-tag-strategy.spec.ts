/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Intersection, Object3D, Vector3 } from 'three';
import { PointerEventData } from '../../../events/pointer-event-data';
import { ObjectTagStrategy } from './object-tag-strategy';

describe( 'ObjectTagStrategy', () => {

	let strategy: ObjectTagStrategy<Object3D>;
	let intersections: Intersection[] = [];
	let object: Object3D;

	beforeEach( () => {

		intersections = [];

		strategy = new ObjectTagStrategy( 'tag' );

		object = new Object3D();

		object[ 'attributeName' ] = 'value';

		object[ 'tag' ] = 'tag';

		intersections.push( {
			object,
			distance: 0,
			point: new Vector3()
		} );

	} );

	afterEach( () => {

		strategy.dispose();

	} );

	it( 'should return the object when pointer is down', () => {

		const result = strategy.handleSelection( { intersections } as PointerEventData );

		expect( result ).toBe( object );

	} );

	it( 'should return the object when pointer is moved', () => {

		const result = strategy.onPointerMoved( { intersections } as PointerEventData );

		expect( result ).toBe( object );

	} );

	it( 'should return the object when pointer is up', () => {

		const result = strategy.onPointerUp( { intersections } as PointerEventData );

		expect( result ).toBe( object );

	} );

	it( 'should return null when no object is found', () => {

		intersections = [];

		const result = strategy.handleSelection( { intersections } as PointerEventData );

		expect( result ).toBeNull();

	} );

	it( 'should return the attribute of the object', () => {

		const strategy2 = new ObjectTagStrategy( 'tag', 'attributeName' );

		const result = strategy2.handleSelection( { intersections } as PointerEventData );

		expect( result ).toBe( object[ 'attributeName' ] );

	} );

} );
