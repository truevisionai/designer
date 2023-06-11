/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';

import { SharedModule } from 'app/shared/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { TextureFieldComponent } from './inspectors/texture-field/texture-field.component';
import { PointerGuidesComponent } from './pointer-guides/pointer-guides.component';
import { ViewportComponent } from './viewport/viewport.component';

@NgModule( {
	declarations: [ ViewportComponent, PointerGuidesComponent, TextureFieldComponent ],
	imports: [
		CommonModule,
		SharedModule,
		ColorPickerModule,
		MatInputModule,
		FlexModule
	],
	exports: [
		ViewportComponent,
	]
} )
export class ThreeJsModule {
}
