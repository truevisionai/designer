/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLateralProfileCrossfall } from './tv-lateral-profile-crossfall';
import { TvLateralProfileShape } from './tv-lateral-profile-shape';
import { TvLateralProfileSuperElevation } from './tv-lateral-profile-super-elevation';

export class TvLateralProfile {
	public superelelevation: TvLateralProfileSuperElevation[] = [];
	public crossfall: TvLateralProfileCrossfall[] = [];
	public shape: TvLateralProfileShape[] = [];
}
