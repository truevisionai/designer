import { OscParameterDeclaration } from './osc-parameter-declaration';
import { OscRouteStrategy } from './osc-enums';
import { AbstractPosition } from './osc-interfaces';

export class OscWaypoint {

	constructor (
		public position: AbstractPosition,
		public strategy: OscRouteStrategy
	) {
	}
}

export class OscRoute {

	public name: string;
	public closed: boolean;

	public parameterDeclaration: OscParameterDeclaration[] = [];
	public waypoints: OscWaypoint[] = [];

}
