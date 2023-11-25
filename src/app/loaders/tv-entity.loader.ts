import { readXmlArray } from 'app/tools/xml-utils';
import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';
import { VehicleEntity } from 'app/modules/scenario/models/entities/vehicle-entity';
import { TvAxle, TvAxles, TvBoundingBox, TvDimension, TvPerformance } from 'app/modules/scenario/models/tv-bounding-box';
import { Vector3 } from 'three';
import { XmlElement } from "../importers/xml.element";
import { Injectable } from '@angular/core';
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { StorageService } from 'app/io/storage.service';

@Injectable( {
	providedIn: 'root'
} )
export class TvEntityLoader {

	constructor (
		private storageService: StorageService
	) {
	}

	loadEntity ( asset: AssetNode ) {

		const contents = this.storageService.readSync( asset.path );

		const json = JSON.parse( contents );

		return this.parseEntity( json );

	}

	parseEntity ( json: any ): ScenarioEntity {

		const guid = json.guid;
		const name = json.name;
		const objectType = json.objectType;
		const vehicleCategory = json.vehicleCategory;
		const model3d = json.model3d;

		const boundingBox = this.parseBoundingBox( json.boundingBox );

		const performance = this.parsePerformance( json.performance );

		const axles = this.parseAxles( json.axles );

		const properties = [];

		if ( objectType == 'vehicle' ) {

			const vehicleEntity = new VehicleEntity( name, vehicleCategory, boundingBox, performance, axles, properties );

			vehicleEntity.uuid = guid;
			vehicleEntity.model3d = model3d || 'default';

			return vehicleEntity;
		}

		if ( objectType == 'pedestrian' ) {
		}

		if ( objectType == 'miscellaneous' ) {
		}

	}

	parseAxles ( json: XmlElement ) {

		const front = this.parseAxle( json.front );

		const rear = this.parseAxle( json.rear );

		const additional = [];

		readXmlArray( json.additional, json => additional.push( this.parseAxle( json ) ) );

		return new TvAxles( front, rear, additional );
	}

	parseAxle ( json: XmlElement ) {

		const maxSteering: number = parseFloat( json.maxSteering );
		const wheelDiameter: number = parseFloat( json.wheelDiameter );
		const trackWidth: number = parseFloat( json.trackWidth );
		const positionX: number = parseFloat( json.positionX );
		const positionZ: number = parseFloat( json.positionZ );

		return new TvAxle(
			maxSteering,
			wheelDiameter,
			trackWidth,
			positionX,
			positionZ
		);
	}

	parsePerformance ( json: XmlElement ): TvPerformance {

		return new TvPerformance(
			parseFloat( json?.maxSpeed ),
			parseFloat( json?.maxAcceleration ),
			parseFloat( json?.maxDeceleration ),
			parseFloat( json?.mass )
		);

	}

	parseBoundingBox ( json: XmlElement ): TvBoundingBox {

		const center = new Vector3(
			parseFloat( json?.center?.x ),
			parseFloat( json?.center?.y ),
			parseFloat( json?.center?.z )
		);

		const dimension = new TvDimension(
			parseFloat( json?.dimension?.width ),
			parseFloat( json?.dimension?.length ),
			parseFloat( json?.dimension?.height )
		);

		return new TvBoundingBox( center, dimension );
	}
}
