/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from '../../../core/game-object';

class LaneData {

	public parent: GameObject;
	public cumulativeWidth: number;

	public elevation: number;
	public elevationAccum: number;

	public cosAngleLeft: number;
	public cosAngleRight: number;
	public sinAngleLeft: number;
	public sinAngleRight: number;
	public laneOffset: number;

	public Clear (): void {

		this.cumulativeWidth = 0;
		this.elevationAccum = 0;
		this.cosAngleLeft = 0;
		this.cosAngleRight = 0;
		this.sinAngleLeft = 0;
		this.sinAngleRight = 0;
	}
}
