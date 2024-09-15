import { Injectable } from "@angular/core";
import { BaseController } from "app/core/controllers/base-controller";
import { Surface } from "app/map/surface/surface.model";
import { SurfaceService } from "app/map/surface/surface.service";
import { TvSurfaceInspector } from "../inspectors/surface.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceController extends BaseController<Surface> {

	constructor ( private service: SurfaceService ) {
		super();
	}

	onAdded ( object: Surface ): void {

		this.service.add( object );

	}

	onUpdated ( object: Surface ): void {

		this.service.update( object );

	}

	onRemoved ( object: Surface ): void {

		this.service.remove( object );

	}

	showInspector ( surface: Surface ): void {

		const mesh = this.service.getSurfaceMesh( surface );

		this.setInspector(new TvSurfaceInspector( surface, mesh ))

	}

}
