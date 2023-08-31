/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Type } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { FileService } from 'app/core/io/file.service';
import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { CommandHistory } from 'app/services/command-history';
import { EntityManager } from 'app/services/entity-manager';
import { RoadStyle, RoadStyleService } from 'app/services/road-style.service';
import { DynamicFileInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { GeometryInspectorComponent } from 'app/views/inspectors/geometry-inspector/geometry-inspector.component';
import { MaterialInspector } from 'app/views/inspectors/material-inspector/material-inspector.component';
import { PrefabInspectorComponent } from 'app/views/inspectors/prefab-inspector/prefab-inspector.component';
import { PropInstanceInspectorComponent } from 'app/views/inspectors/prop-instance-inspector/prop-instance-inspector.component';
import { PropModelInspectorComponent } from 'app/views/inspectors/prop-model-inspector/prop-model-inspector.component';
import { RoadMarkingInspector } from 'app/views/inspectors/road-marking-inspector/road-marking-inspector.component';
import { RoadSignInspector } from 'app/views/inspectors/road-sign-inspector/road-sign-inspector.component';
import { RoadStyleInspector } from 'app/views/inspectors/road-style-inspector/road-style-inspector.component';
import { TextureInspector } from 'app/views/inspectors/texture-inspector/texture-inspector.component';
import { XodrFileInspectorComponent } from 'app/views/inspectors/xodr-file-inspector/xodr-file-inspector.component';
import { XoscFileInspectorComponent } from 'app/views/inspectors/xosc-file-inspector/xosc-file-inspector.component';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { IComponent } from '../game-object';
import { AppInspector } from '../inspector';
import { Metadata, MetaImporter } from '../models/metadata.model';

export enum InspectorType {
	prop_model_inspector = 'prop_model_inspector',
	prop_instance_inspector = 'prop_instance_inspector',
}

@Injectable( {
	providedIn: 'root'
} )
export class InspectorFactoryService {

	constructor () {
	}

	static setAssetInspector ( metadata: Metadata ) {

		const extension = FileService.getExtension( metadata.path );

		const inspector = this.getInspectorByExtension( extension );

		const inspectorData = this.getInspectorData( metadata );

		CommandHistory.execute( new SetInspectorCommand( inspector, inspectorData ) );

		if ( inspectorData instanceof ScenarioEntity ) {

			EntityManager.setEntity( inspectorData );

		}

	}

	static setByType ( type: InspectorType, data: any ) {

		switch ( type ) {

			case InspectorType.prop_instance_inspector:
				AppInspector.setInspector( PropInstanceInspectorComponent, data );
				break;

			case InspectorType.prop_model_inspector:
				AppInspector.setInspector( PropModelInspectorComponent, data );
				break;

			default:
				break;
		}

	}

	static getInspectorByExtension ( extension ): Type<IComponent> {

		let inspector: Type<IComponent>;

		switch ( extension ) {

			case 'prefab':
				inspector = PrefabInspectorComponent;
				break;

			case 'geometry':
				inspector = GeometryInspectorComponent;
				break;

			case 'obj':
				inspector = PropModelInspectorComponent;
				break;

			case 'fbx':
				inspector = PropModelInspectorComponent;
				break;

			case 'gltf':
				inspector = PropModelInspectorComponent;
				break;

			case 'glb':
				inspector = PropModelInspectorComponent;
				break;

			case 'png':
				inspector = TextureInspector;
				break;

			case 'jpg':
				inspector = TextureInspector;
				break;

			case 'jpeg':
				inspector = TextureInspector;
				break;

			case 'svg':
				inspector = TextureInspector;
				break;

			case 'material':
				inspector = MaterialInspector;
				break;

			case 'sign':
				inspector = RoadSignInspector;
				break;

			case 'roadstyle':
				inspector = RoadStyleInspector;
				break;

			case 'xodr':
				inspector = XodrFileInspectorComponent;
				break;

			case 'xosc':
				inspector = XoscFileInspectorComponent;
				break;

			case TvRoadMarking.extension:
				inspector = RoadMarkingInspector;
				break;

			case 'entity':
				inspector = DynamicFileInspectorComponent;
				break;

			default:
				break;
		}

		return inspector;
	}

	static getInpectorByFilename ( filename: string ): Type<IComponent> {

		const extension = FileService.getExtension( filename );

		return this.getInspectorByExtension( extension );
	}

	static getInspectorData ( metadata: Metadata ) {

		const instance = AssetDatabase.getInstance( metadata.guid );

		if ( metadata.importer === MetaImporter.MATERIAL ) {

			return {
				material: instance,
				guid: metadata.guid
			};

		} else if ( metadata.importer === MetaImporter.TEXTURE ) {

			return {
				texture: instance,
				guid: metadata.guid
			};

		} else if ( metadata.importer === MetaImporter.ROAD_STYLE ) {

			RoadStyleService.setCurrentStyle( instance as RoadStyle );

			return {
				roadStyle: instance,
				guid: metadata.guid
			};

		} else if ( metadata.importer === MetaImporter.MODEL ) {

			return metadata;

		} else if ( metadata.importer === MetaImporter.ROAD_MARKING ) {

			return {
				roadMarking: instance,
				guid: metadata.guid
			};

		} else {

			return instance;

		}

	}
}
