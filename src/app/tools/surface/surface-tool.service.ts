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
import { SplineService } from 'app/services/spline.service';
import { MeshLambertMaterial, RepeatWrapping, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';
import { SelectionService } from '../selection.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	constructor (
		public selection: SelectionService,
		public base: BaseToolService,
		private mapService: MapService,
		private splineService: SplineService,
		private controlPointFactory: ControlPointFactory,
	) {
	}

	select ( e: PointerEventData ) {

		// this.base.select( e, this.nodeStrategy, this.pointStrategy );

	}

	createSurface ( position?: Vector3 ) {

		return new TvSurface( 'grass', new CatmullRomSpline() );

	}

	createControlPoint ( surface: TvSurface, position: Vector3 ) {

		return this.controlPointFactory.createDynamic( surface, position );

	}

	addSurface ( surface: TvSurface ) {

		this.mapService.map.addSurface( surface );

		SceneService.addToMain( surface.mesh );

	}

	removeSurface ( surface: TvSurface ) {

		this.mapService.map.removeSurface( surface );

		SceneService.removeFromMain( surface.mesh );

	}

	addControlPoint ( surface: TvSurface, point: AbstractControlPoint ) {

		surface.addControlPoint( point );

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

	private createSurfaceMesh ( surface: TvSurface ) {

		const points: Vector2[] = surface.spline.getPoints( 0.1 ).map(
			point => new Vector2( point.x, point.y )
		);

		const shape = new Shape();

		const first = points.shift();

		shape.moveTo( first.x, first.y );

		shape.splineThru( points );

		const geometry = new ShapeGeometry( shape );

		let groundMaterial;

		if ( surface.materialGuid === undefined || surface.materialGuid === 'grass' ) {

			const texture = OdTextures.terrain().clone();
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.copy( surface.offset );
			texture.repeat.copy( surface.repeat );
			texture.anisotropy = 16;

			groundMaterial = new MeshLambertMaterial( { map: texture } );

		} else {

			groundMaterial = AssetDatabase.getInstance( surface.materialGuid );

		}

		const mesh = new GameObject( 'Surface', geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = TvSurface.tag;

		mesh.userData.surface = this;

		return mesh;

	}

	private updateSurfaceMesh ( surface: TvSurface ) {

	}
}
