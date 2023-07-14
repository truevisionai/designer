/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, MathUtils, Vector3 } from 'three';
import { XmlElement } from '../../tv-map/services/open-drive-parser.service';
import { OpenScenarioImporter } from '../services/open-scenario-importer.service';
import { ScenarioInstance } from '../services/scenario-instance';
import { ScenarioEntity } from './entities/scenario-entity';
import { OpenScenarioVersion, PositionType } from './tv-enums';
import { Orientation } from './tv-orientation';

export abstract class Position {

	abstract readonly type: PositionType;

	abstract readonly label: string;

	public vector3: THREE.Vector3 = new Vector3( 0, 0, 0 );

	abstract toVector3 (): Vector3;

	// abstract toXML (): XmlElement;

	setPosition ( point: Vector3 ) {
		throw new Error( 'Method not implemented.' );
	}

	toEuler (): Euler {
		return new Euler( 0, 0, 0 );
	}

	toOrientation (): Orientation {
		return new Orientation();
	}

	get position (): Vector3 {
		return this.toVector3();
	}

	get rotation (): Vector3 {
		const euler = this.toEuler();
		return new Vector3(
			euler.x,
			euler.y,
			euler.z
		);
	}

	get rotationInDegree (): Vector3 {
		return this.rotation.multiplyScalar( MathUtils.RAD2DEG );
	}

	protected getEntity ( entity: string ): ScenarioEntity {
		return ScenarioInstance.scenario.findEntityOrFail( entity );
	}

	static fromXML ( xml: XmlElement ): Position {
		return OpenScenarioImporter.readPosition( xml );
	}

	toXML ( version?: OpenScenarioVersion ) {
		return {};
	}
}
