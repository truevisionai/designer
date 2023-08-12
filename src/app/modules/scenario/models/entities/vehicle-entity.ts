/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector3 } from 'three';
import { TvAxles, TvBoundingBox, TvDimension, TvPerformance } from '../tv-bounding-box';
import { ScenarioEntity } from './scenario-entity';
import { ScenarioObjectType, VehicleCategory } from '../tv-enums';
import { TvProperty } from '../tv-properties';

export class VehicleEntity extends ScenarioEntity {

	public scenarioObjectType: ScenarioObjectType = ScenarioObjectType.vehicle;
	public model3d: string;

	constructor (
		public name: string,
		public vehicleCategory: VehicleCategory = VehicleCategory.car,
		public boundingBox: TvBoundingBox = new TvBoundingBox( new Vector3( 0, 0, 0 ), new TvDimension( 2.0, 4.2, 1.6 ) ),
		public performance: TvPerformance = new TvPerformance( 100, 4, 9 ),
		public axles: TvAxles = null,
		public properties: TvProperty[] = []
	) {
		super( name, boundingBox );
	}

	clone (): this {

		return new VehicleEntity(
			this.name,
			this.vehicleCategory,
			this.boundingBox.clone(),
			this.performance.clone(),
			this.axles ? this.axles.clone() : null,
			this.properties.map( p => p.clone() )
		) as this;

	}
}
