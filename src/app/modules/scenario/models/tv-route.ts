/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Position } from './position';
import { RoutingAlgorithm } from './tv-enums';
import { ParameterDeclaration } from './tv-parameter-declaration';

export class Waypoint {

	constructor (
		public position: Position,
		public strategy: RoutingAlgorithm
	) {
	}
}

export class Route {

	public name: string;
	public closed: boolean;

	public parameterDeclaration: ParameterDeclaration[] = [];
	public waypoints: Waypoint[] = [];

}
