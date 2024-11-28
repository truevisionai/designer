/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSide, TvLaneType } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { PropertyCopyService } from './property-copy.service';

describe( 'PropertyCopyService Test', () => {

	it( 'copy lane to lane', () => {

		const lane1 = new TvLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, null );
		const lane2 = new TvLane( TvLaneSide.RIGHT, 2, TvLaneType.border, false, null );

		PropertyCopyService.copyProperties( lane1 );
		PropertyCopyService.pasteProperties( lane2 );

		expect( lane2.type ).toBe( lane1.type );
		expect( lane2.level ).toBe( lane1.level );

	} );
} );
