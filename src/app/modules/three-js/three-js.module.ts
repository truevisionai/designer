/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewportComponent } from './viewport/viewport.component';
import { PointerGuidesComponent } from './pointer-guides/pointer-guides.component';
import { SharedModule } from 'app/shared/shared.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatInputModule } from '@angular/material';
import { TextureFieldComponent } from './inspectors/texture-field/texture-field.component';

@NgModule( {
    declarations: [ ViewportComponent, PointerGuidesComponent, TextureFieldComponent ],
    imports: [
        CommonModule,
        SharedModule,
        ColorPickerModule,
        MatInputModule
    ],
    exports: [
        ViewportComponent,
    ]
} )
export class ThreeJsModule {
}
