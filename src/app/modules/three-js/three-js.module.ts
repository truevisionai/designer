/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from 'app/shared/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { PointerGuidesComponent } from './pointer-guides/pointer-guides.component';
import { ViewportComponent } from './viewport/viewport.component';

@NgModule( {
	declarations: [ ViewportComponent, PointerGuidesComponent ],
	exports: [
		ViewportComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		ColorPickerModule,
		MatInputModule,
		FlexModule,
		MatToolbarModule,
		MatTooltipModule,
	]
} )
export class ThreeJsModule {
}
