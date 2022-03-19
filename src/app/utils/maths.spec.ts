/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from './maths';

describe( 'Maths', () => {

    it( 'should give correct number for randomNumberBetweenExcept', () => {

        const numbers = [ 1, 2, 3, 4, 5 ];

        const result = Maths.randomNumberBetweenExcept( 0, 10, numbers );

        const includes = numbers.includes( result, 0 );

        expect( includes ).toBe( false );

    } );

} );
