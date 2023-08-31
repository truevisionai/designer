/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils, Vector3 } from 'three';
import { TvAxles, TvBoundingBox, TvDimension, TvPerformance } from '../tv-bounding-box';
import { ScenarioEntity } from './scenario-entity';
import { ScenarioObjectType, VehicleCategory } from '../tv-enums';
import { TvProperty } from '../tv-properties';
import { SerializedField } from 'app/core/components/serialization';
import { AssetFactory } from 'app/core/asset/asset-factory.service';

export class VehicleEntity extends ScenarioEntity {

	public scenarioObjectType: ScenarioObjectType = ScenarioObjectType.vehicle;

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


	@SerializedField( { type: 'string' } )
	get entityName (): string {
		return this.name;
	}

	set entityName ( value: string ) {
		this.name = value;
	}

	@SerializedField( { type: 'enum', enum: VehicleCategory } )
	get entityType (): VehicleCategory {
		return this.vehicleCategory;
	}

	set entityType ( value: VehicleCategory ) {
		this.vehicleCategory = value;
	}

	@SerializedField( { type: 'float' } )
	get height (): number {
		return this.boundingBox.dimension.height;
	}

	set height ( value: number ) {
		this.boundingBox.dimension.height = value;
	}

	@SerializedField( { type: 'float' } )
	get length (): number {
		return this.boundingBox.dimension.length;
	}

	set length ( value: number ) {
		this.boundingBox.dimension.length = value;
	}

	@SerializedField( { type: 'gameobject' } )
	get modelName (): string {
		return this.model3d;
	}

	set modelName ( value: string ) {
		this.model3d = value;
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

	toJSON ( meta?: any ) {
		return {
			guid: this.uuid,
			objectType: this.scenarioObjectType,
			vehicleCategory: this.vehicleCategory,
			name: this.name,
			model3d: this.model3d,
			boundingBox: this.boundingBox.toJSON(),
			performance: this.performance.toJSON(),
			axles: this.axles.toJSON(),
		}
	}
}
