/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RouteStrategy } from './osc-enums';
import { AbstractPosition } from './osc-interfaces';
import { ParameterDeclaration } from './osc-parameter-declaration';

export class Waypoint {

	constructor (
		public position: AbstractPosition,
		public strategy: RouteStrategy
	) {
	}
}

export class Route {

	public name: string;
	public closed: boolean;

	public parameterDeclaration: ParameterDeclaration[] = [];
	public waypoints: Waypoint[] = [];

}
