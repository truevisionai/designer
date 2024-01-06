import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/core/game-object';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { MapService } from 'app/services/map.service';
import { SceneService } from 'app/services/scene.service';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { Mesh, MeshLambertMaterial, Object3D, RepeatWrapping, Shape, ShapeGeometry, Texture, Vector2, Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { SelectionService } from '../selection.service';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { TvSurfaceBuilder } from 'app/modules/tv-map/builders/tv-surface.builder';
import { Object3DMap } from '../lane-width/object-3d-map';
import { RoadService } from 'app/services/road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	private meshes = new Object3DMap<TvSurface, Mesh>();

	constructor (
		public selection: SelectionService,
		public base: BaseToolService,
		private mapService: MapService,
		private splineService: AbstractSplineDebugService,
		private controlPointFactory: ControlPointFactory,
		private surfaceBuilder: TvSurfaceBuilder,
	) {
	}

	getSurfaceMesh ( object: TvSurface ) {

		return this.meshes.get( object );

	}

	select ( e: PointerEventData ) {

		// this.base.select( e, this.nodeStrategy, this.pointStrategy );

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

	}

	removeSurface ( surface: TvSurface ) {

		this.meshes.remove( surface );

		this.mapService.map.removeSurface( surface );

	}

	addControlPoint ( surface: TvSurface, point: AbstractControlPoint ) {

		surface.addControlPoint( point );

		this.rebuildSurface( surface );

		SceneService.addToolObject( point );

	}

	removeControlPoint ( surface: TvSurface, point: AbstractControlPoint ) {

		surface.removeControlPoint( point );

		SceneService.removeFromMain( point );

	}

	hideSurfaceHelpers () {

		this.mapService.map.surfaces.forEach( surface => {

			this.hideSurface( surface );

		} );

	}

	showSurfaceHelpers () {

		this.mapService.map.surfaces.forEach( surface => {

			this.showSurface( surface );

		} );


	}

	hideSurface ( surface: TvSurface ) {

		this.splineService.hideLines( surface.spline );
		this.splineService.hideControlPoints( surface.spline );

	}

	showSurface ( surface: TvSurface ) {

		this.splineService.showLines( surface.spline );
		this.splineService.showControlPoints( surface.spline );

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

		const mesh = this.meshes.get( surface );

		const geometry = mesh.geometry as ShapeGeometry;

		const shape = new Shape();

		shape.moveTo( 0, 0 );
		shape.lineTo( width, 0 );
		shape.lineTo( width, height );
		shape.lineTo( 0, height );
		shape.lineTo( 0, 0 );

		// also update the spline

		const spline = surface.spline;

		if ( spline?.controlPoints.length == 4 ) {
			spline.controlPoints[ 0 ].position.set( 0, 0, 0 );
			spline.controlPoints[ 1 ].position.set( width, 0, 0 );
			spline.controlPoints[ 2 ].position.set( width, height, 0 );
			spline.controlPoints[ 3 ].position.set( 0, height, 0 );
		}

		geometry.dispose();

		geometry.copy( new ShapeGeometry( shape ) );

		surface.repeat.set( 1 / width, 1 / height );

	}

}
