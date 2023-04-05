/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { IFile } from 'app/core/models/file';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { PropCurve } from 'app/modules/tv-map/models/prop-curve';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoadTypeClass } from 'app/modules/tv-map/models/tv-road-type.class';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { OdWriter } from 'app/modules/tv-map/services/open-drive-writer.service';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { XMLBuilder } from 'fast-xml-parser';

import { saveAs } from 'file-saver';

import { Euler, Vector3 } from 'three';
import { FileService } from './file.service';
import { SnackBar } from './snack-bar.service';
import { TvElectronService } from './tv-electron.service';

export interface Scene {

	road: { guid: string },

	props: { guid: string, position: Vector3, rotation: Euler, scale: Vector3 }[],

	propCurves: []
}

@Injectable( {
	providedIn: 'root'
} )
export class SceneExporterService {

	private readonly extension = 'scene';

	private map: TvMap;

	constructor (
		private openDriveWriter: OdWriter,
		private fileService: FileService,
		private electron: TvElectronService
	) {
	}

	get currentFile (): IFile {
		return TvMapInstance.currentFile;
	}

	set currentFile ( value: IFile ) {
		TvMapInstance.currentFile = value;
	}

	export ( map?: TvMap ): string {

		const defaultOptions = {
			attributeNamePrefix: 'attr_',
			attrNodeName: false,
			ignoreAttributes: false,
			supressEmptyNode: true,
			format: true,
			trimValues: true,
		};

		const builder = new XMLBuilder( defaultOptions );

		this.map = map || TvMapInstance.map;

		const scene = this.exportMap( this.map );

		const xmlDocument = builder.build( scene );

		return xmlDocument;
	}

	saveAs () {

		const contents = this.export();

		if ( this.electron.isElectronApp ) {

			this.fileService.saveFileWithExtension(
				this.fileService.projectFolder, contents, this.extension, ( file: IFile ) => {

					this.currentFile.path = file.path;
					this.currentFile.name = file.name;

				} );

		} else {

			saveAs( new Blob( [ contents ] ), `road.${ this.extension }` );

		}

	}

	exportMap ( map: TvMap ) {

		return {
			version: 0.1,
			road: this.exportRoads( [ ...this.map.roads.values() ] ),
			prop: this.exportProps( map.props ),
			propCurve: this.exportPropCurves( map.propCurves ),
			propPolygon: this.exportPropPolygons( map.propPolygons ),
			surface: this.exportSurfaces( map.surfaces ),
			junction: this.exportJunctions( [ ...map.junctions.values() ] ),
		};

	}

	exportRoads ( roads: TvRoad[] ) {

		return roads.map( road => this.exportRoad( road ) );

	}

	exportRoad ( road: TvRoad ) {

		const xml = {
			attr_id: road.id,
			attr_name: road.name,
			attr_length: road.length,
			attr_junction: road.junction,
			drivingMaterialGuid: road.drivingMaterialGuid,
			sidewalkMaterialGuid: road.sidewalkMaterialGuid,
			borderMaterialGuid: road.borderMaterialGuid,
			shoulderMaterialGuid: road.shoulderMaterialGuid,
			spline: this.exportRoadSpline( road.spline ),
		};

		this.openDriveWriter.writeRoadLinks( xml, road );

		this.openDriveWriter.writeRoadType( xml, road );

		// no need as geometry is being stored via spline
		// this.openDriveWriter.writePlanView( xml, road );

		this.openDriveWriter.writeElevationProfile( xml, road );

		this.openDriveWriter.writeLateralProfile( xml, road );

		this.openDriveWriter.writeLanes( xml, road );

		// TODO: maybe not required here
		this.openDriveWriter.writeObjects( xml, road );

		// TODO: maybe not required here
		this.openDriveWriter.writeSignals( xml, road );


		return xml;
	}

	exportRoadSpline ( spline: AbstractSpline ) {

		if ( spline instanceof AutoSpline ) {

			return {
				attr_type: spline.type,
				point: spline.controlPointPositions.map( point => ( {
					attr_x: point.x,
					attr_y: point.y,
					attr_z: point.z
				} ) )
			};


		} else if ( spline instanceof ExplicitSpline ) {

			return {
				attr_type: spline.type,
				point: spline.controlPoints.map( ( point: RoadControlPoint ) => ( {
					attr_x: point.position.x,
					attr_y: point.position.y,
					attr_z: point.position.z,
					attr_hdg: point.hdg,
					attr_type: point.segmentType,
				} ) )
			};

		} else {

			SnackBar.error( 'Not able to export this spline type' );

		}

	}

	exportTypes ( types: TvRoadTypeClass[] ) {

		return types.map( type => {

			return {
				attr_s: type.s,
				attr_type: type.type,
				speed: {
					attr_max: type.speed.max,
					attr_unit: type.speed.unit
				},
			};

		} );

	}

	exportJunctions ( junctions: TvJunction[] ) {

		return junctions.map( junction => this.exportJunction( junction ) );

	}

	exportJunction ( junction: TvJunction ) {

		const xml = {
			attr_id: junction.id,
			attr_name: junction.name,
			position: {
				attr_x: junction.position ? junction.position.x : 0,
				attr_y: junction.position ? junction.position.y : 0,
				attr_z: junction.position ? junction.position.z : 0,
			},
			connection: [],
			priority: [],
			controller: []
		};

		this.openDriveWriter.writeJunctionConnection( xml, junction );

		// TODO: Add controller and priority as well

		// this.openDriveWriter.writeJunctionController( xml, junction );

		// this.openDriveWriter.writeJunctionPriority( xml, junction );

		return xml;
	}

	exportProps ( props: PropInstance[] ) {

		return props.map( prop => this.exportProp( prop ) );

	}

	exportProp ( prop: PropInstance ) {

		return {
			attr_guid: prop.guid,
			position: {
				attr_x: prop.object.position.x,
				attr_y: prop.object.position.y,
				attr_z: prop.object.position.z,
			},
			rotation: {
				attr_x: prop.object.rotation.x,
				attr_y: prop.object.rotation.y,
				attr_z: prop.object.rotation.z,
			},
			scale: {
				attr_x: prop.object.scale.x,
				attr_y: prop.object.scale.y,
				attr_z: prop.object.scale.z,
			}
		};

	}

	exportPropCurves ( curves: PropCurve[] ) {

		return curves.map( curve => this.exportPropCurve( curve ) );

	}

	exportPropCurve ( curve: PropCurve ) {

		return {
			attr_rotation: curve.rotation,
			attr_positionVariance: curve.positionVariance,
			attr_reverse: curve.reverse,
			attr_guid: curve.propGuid,
			props: curve.props.map( prop => ( {
				attr_guid: curve.propGuid,
				position: {
					attr_x: prop.position.x,
					attr_y: prop.position.y,
					attr_z: prop.position.z,
				},
				rotation: {
					attr_x: prop.rotation.x,
					attr_y: prop.rotation.y,
					attr_z: prop.rotation.z,
				},
				scale: {
					attr_x: prop.scale.x,
					attr_y: prop.scale.y,
					attr_z: prop.scale.z,
				}
			} ) ),
			spline: {
				attr_type: curve.spline.type,
				attr_closed: curve.spline.closed,
				attr_tension: curve.spline.tension,
				point: curve.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}

	exportPropPolygons ( polygons: PropPolygon[] ) {

		return polygons.map( polygon => this.exportPropPolygon( polygon ) );

	}

	exportPropPolygon ( polygon: PropPolygon ) {

		return {
			attr_guid: polygon.propGuid,
			attr_density: polygon.density,
			props: polygon.props.map( prop => ( {
				attr_guid: polygon.propGuid,
				position: {
					attr_x: prop.position.x,
					attr_y: prop.position.y,
					attr_z: prop.position.z,
				},
				rotation: {
					attr_x: prop.rotation.x,
					attr_y: prop.rotation.y,
					attr_z: prop.rotation.z,
				},
				scale: {
					attr_x: prop.scale.x,
					attr_y: prop.scale.y,
					attr_z: prop.scale.z,
				}
			} ) ),
			spline: {
				attr_type: polygon.spline.type,
				attr_closed: polygon.spline.closed,
				attr_tension: polygon.spline.tension,
				point: polygon.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}

	exportSurfaces ( surfaces: TvSurface[] ) {

		return surfaces.map( surface => this.exportSurface( surface ) );

	}

	exportSurface ( surface: TvSurface ) {

		return surface.toJson();

	}


}
