/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapInstance } from '../../map/services/tv-map-instance';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { TvProperty } from './tv-properties';

export abstract class AbstractController {

	private parameterDeclarations: ParameterDeclaration[] = [];
	private properties: TvProperty[] = [];

	constructor ( public name: string ) {
	}

	get map () {
		return TvMapInstance.map;
	}

	update (): void {
		console.error( 'controller update method not overridden' );
	}

	addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( parameterDeclaration );
	}

	addProptery ( property: TvProperty ): void {
		this.properties.push( property );
	}

	start (): void {
		console.error( 'controller start method not overridden' );
	}
}
