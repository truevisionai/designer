import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BUILD_PROVIDERS } from 'app/core/builders/mesh.builder';
import { PropCurveBuilder } from './prop-curve.builder';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { AssetService } from 'app/assets/asset.service';
import { SplineBuilder } from 'app/services/spline/spline.builder';

@NgModule( {
	imports: [
		CommonModule
	],
	declarations: [],
	providers: [
		{
			provide: BUILD_PROVIDERS,
			useFactory: ( assetService: AssetService, splineBuilder: SplineBuilder ) => ( {
				key: PropCurve,
				builder: new PropCurveBuilder( assetService, splineBuilder ) // Pass dependencies
			} ),
			deps: [ AssetService, SplineBuilder ], // Specify the dependencies
			multi: true,
		},
	]
} )
export class BuilderModule { }
