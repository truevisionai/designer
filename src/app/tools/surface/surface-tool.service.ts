import { Injectable } from '@angular/core';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { GameObject } from 'app/core/game-object';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { MapService } from 'app/services/map.service';
import { SceneService } from 'app/services/scene.service';
import { SplineService } from 'app/services/spline.service';
import { MeshLambertMaterial, RepeatWrapping, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { BaseToolService } from '../base-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	public pointStrategy: SelectStrategy<AbstractControlPoint>;
	public nodeStrategy: SelectStrategy<TvSurface>;

	constructor (
		private base: BaseToolService,
		private mapService: MapService,
		private splineService: SplineService,
		private controlPointFactory: ControlPointFactory,
	) {
		this.pointStrategy = new ControlPointStrategy();
		this.nodeStrategy = new NodeStrategy<TvSurface>( TvSurface.tag );
	}

	select ( e: PointerEventData ) {

		this.base.select( e, this.nodeStrategy, this.pointStrategy );

	}

	createSurface ( position: Vector3 ) {

		const surface = new TvSurface( 'grass', new CatmullRomSpline() );

		const point = this.controlPointFactory.createDynamic( surface, position );

		surface.addControlPoint( point );

		SceneService.addToolObject( surface.mesh );

		SceneService.addToolObject( point );

		return surface;

	}

	addControlPoint ( surface: TvSurface, position: Vector3 ) {

		const point = this.controlPointFactory.createDynamic( surface, position );

		SceneService.addToolObject( point );

		surface.addControlPoint( point );

	}

	hideSurfaceHelpers () {

		this.mapService.map.surfaces.forEach( surface => {

			this.hide( surface );

		} );

	}

	showSurfaceHelpers () {

		this.mapService.map.surfaces.forEach( surface => {

			this.show( surface );

		} );

	}

	hide ( surface: TvSurface ) {

		this.splineService.hide( surface.spline );
		this.splineService.hideControlPoints( surface.spline );

	}

	show ( surface: TvSurface ) {

		this.splineService.show( surface.spline );
		this.splineService.showControlPoints( surface.spline );


	}

	private createSurfaceMesh ( surface: TvSurface ) {

		const points: Vector2[] = surface.spline.getPoints( 50 ).map(
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

}
