/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Metadata {
	guid: string;
	path: string;
	isFolder?: boolean;
	importer: MetaImporter;
	data: any;
	preview?: any;
}

export interface DynamicMeta<T> {
	guid: string;
	path: string;
	importer: string;
	data: T;
}

export enum MetaImporter {
	SCENE = 'SceneImporter',
	OPENDRIVE = 'OpenDriveImporter',
	OPENSCENARIO = 'OpenScenarioImporter',
	TEXTURE = 'TextureImporter',
	MATERIAL = 'MaterialImporter',
	SIGN = 'SignImporter',
	MODEL = 'ModelImporter',
	PREFAB = 'PrefabImporter',
	OBJECT = 'ObjectImporter',
	GEOMETRY = 'GeometryImporter',
	ROAD_STYLE = 'RoadStyleImporter',
	ROAD_MARKING = 'RoadMarkingImporter',
	ENTITY = 'EntityImporter',
}
