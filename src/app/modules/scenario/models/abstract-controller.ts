import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { TvProperty } from './tv-properties';

export abstract class AbstractController {

	private parameterDeclarations: ParameterDeclaration[] = [];
	private properties: TvProperty[] = [];

	constructor ( public name: string ) {
	}

	update (): void {
		console.error( 'controller update method not overridden' );
	}

	get map () {
		return TvMapInstance.map;
	}

	addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ) {
		this.parameterDeclarations.push( parameterDeclaration );
	}

	addProptery ( property: TvProperty ) {
		this.properties.push( property );
	}
}
