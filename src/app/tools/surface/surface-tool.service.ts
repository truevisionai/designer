import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { MapService } from 'app/services/map.service';
import { SceneService } from 'app/services/scene.service';
import { Mesh, MeshLambertMaterial, Object3D, RepeatWrapping, Shape, ShapeGeometry, Texture, Vector2, Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { SelectionService } from '../selection.service';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { TvSurfaceBuilder } from 'app/modules/tv-map/builders/tv-surface.builder';
import { Object3DMap } from '../lane-width/object-3d-map';
import { DebugService, SurfaceDebugService } from './surface-debug.service';
import { DebugState } from 'app/services/debug/debug-state';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	private meshes = new Object3DMap<TvSurface, Mesh>();
	private debugService: DebugService<TvSurface>;

	constructor (
		public selection: SelectionService,
		public base: BaseToolService,
		private mapService: MapService,
		private controlPointFactory: ControlPointFactory,
		private surfaceBuilder: TvSurfaceBuilder,
		surfaceDebugService: SurfaceDebugService
	) {
		this.debugService = surfaceDebugService;
	}

	getSurfaceMesh ( object: TvSurface ) {

		return this.meshes.get( object );

	}

	createSurface ( materialGuid = 'grass', position?: Vector3, curve?: CatmullRomSpline ) {

		return new TvSurface( materialGuid, curve || new CatmullRomSpline( true, 'catmullrom', 0 ) );

	}

	createControlPoint ( surface: TvSurface, position: Vector3 ) {

		return this.controlPointFactory.createSimpleControlPoint( surface, position );

	}

	updateSurface ( surface: TvSurface ) {

		this.meshes.remove( surface );

		this.buildSurface( surface );

	}

	addSurface ( surface: TvSurface ) {

		this.mapService.map.addSurface( surface );

		this.buildSurface( surface );

	}

	buildSurface ( surface: TvSurface ) {

		const mesh = this.surfaceBuilder.buildSurface( surface );

		if ( !mesh ) return;

		this.meshes.add( surface, mesh );

	}

	rebuildSurface ( surface: TvSurface ) {

		this.meshes.remove( surface );

		this.buildSurface( surface );

		this.debugService.setDebugState( surface, DebugState.HIGHLIGHTED );

	}

	removeSurface ( surface: TvSurface ) {

		this.meshes.remove( surface );

		this.mapService.map.removeSurface( surface );

		this.debugService.setDebugState( surface, DebugState.REMOVED );

	}

	addControlPoint ( surface: TvSurface, point: AbstractControlPoint ) {

		point.mainObject = surface;

		surface.spline.insertPoint( point );

		surface.spline.update();

		this.rebuildSurface( surface );

		SceneService.addToolObject( point );

	}

	removeControlPoint ( surface: TvSurface, point: AbstractControlPoint ) {

		surface.removeControlPoint( point );

		surface.spline.update();

		this.rebuildSurface( surface );

		SceneService.removeFromMain( point );

	}

	onToolDisabled () {

		this.mapService.map.surfaces.forEach( surface => {

			this.debugService.setDebugState( surface, DebugState.REMOVED );

		} );

	}

	onToolEnabled () {

		this.mapService.map.surfaces.forEach( surface => {

			this.debugService.setDebugState( surface, DebugState.DEFAULT );

		} );

	}

	onUnselect ( surface: TvSurface ) {

		this.debugService.setDebugState( surface, DebugState.DEFAULT );

	}

	onSelect ( surface: TvSurface ) {

		this.debugService.setDebugState( surface, DebugState.SELECTED );

	}

	createFromAsset ( asset: AssetNode, position: Vector3 ) {

		if ( asset.type == AssetType.TEXTURE ) {

			const texture = AssetDatabase.getInstance<Texture>( asset.guid );

			const surfaceWidth = texture.image.width;

			const surfaceHeight = texture.image.height;

			const surface = this.createSurface( null, position, new CatmullRomSpline( true, 'catmullrom', 0 ) );

			surface.textureGuid = asset.guid;

			surface.repeat.set( 1 / surfaceWidth, 1 / surfaceHeight );

			// create 4 control points for the surface
			const p1 = this.createControlPoint( surface, new Vector3( 0, 0, 0 ) );
			const p2 = this.createControlPoint( surface, new Vector3( surfaceWidth, 0, 0 ) );
			const p3 = this.createControlPoint( surface, new Vector3( surfaceWidth, surfaceHeight, 0 ) );
			const p4 = this.createControlPoint( surface, new Vector3( 0, surfaceHeight, 0 ) );

			// add the control points to the surface
			this.addControlPoint( surface, p1 );
			this.addControlPoint( surface, p2 );
			this.addControlPoint( surface, p3 );
			this.addControlPoint( surface, p4 );

			return surface;
		}

	}

	updateSurfaceMeshByDimensions ( surface: TvSurface, width: number, height: number ) {

		this.meshes.remove( surface );

		// if surface is a rectangle
		if ( surface.spline?.controlPoints.length == 4 ) {

			surface.spline.controlPoints[ 0 ].position.set( 0, 0, 0 );
			surface.spline.controlPoints[ 1 ].position.set( width, 0, 0 );
			surface.spline.controlPoints[ 2 ].position.set( width, height, 0 );
			surface.spline.controlPoints[ 3 ].position.set( 0, height, 0 );

			surface.repeat.set( 1 / width, 1 / height );
		}

		const mesh = this.surfaceBuilder.buildMesh( surface );

		this.meshes.add( surface, mesh );

	}

}
