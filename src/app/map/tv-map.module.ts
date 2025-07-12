/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from 'app/core/core.module';
import { SharedModule } from 'app/views/shared/shared.module';
import { GameObjectFieldComponent } from 'app/views/fields/game-object-field/game-object-field.component';
import {
	DynamicArrayInspectorComponent,
	DynamicInspectorComponent,
	FieldHostDirective
} from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { EsminiInspectorComponent } from 'app/views/inspectors/esmini-inspector/esmini-inspector.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MaterialFieldComponent } from '../views/fields/material-field/material-field.component';
import { TextureFieldComponent } from '../views/fields/texture-field/texture-field.component';
import { MaterialInspector } from '../views/inspectors/material-inspector/material-inspector.component';
import { AssetPreviewComponent } from '../views/inspectors/asset-preview/asset-preview.component';
import { RoadInspector } from '../views/inspectors/road-inspector/road-inspector.component';
import { TextureInspector } from '../views/inspectors/texture-inspector/texture-inspector.component';
import { EnvironmentInspectorComponent } from 'app/views/inspectors/environment-inspector/environment-inspector.component';
import { AssetInspectorComponent } from 'app/views/inspectors/asset-inspector/asset-inspector.component';
import { WorldSettingInspectorComponent } from 'app/views/inspectors/world-setting-inspector/world-setting-inspector.component';


@NgModule( {
	declarations: [
		RoadInspector,
		TextureInspector,
		MaterialInspector,
		AssetPreviewComponent,
		MaterialFieldComponent,
		GameObjectFieldComponent,
		TextureFieldComponent,
		EsminiInspectorComponent,
		DynamicInspectorComponent,
		DynamicArrayInspectorComponent,
		FieldHostDirective,
		EnvironmentInspectorComponent,
		WorldSettingInspectorComponent,
		AssetInspectorComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		PerfectScrollbarModule,
		CoreModule,
		FlexLayoutModule,
		FormsModule,
		MatSidenavModule,
		MatToolbarModule,
		MatButtonModule,
		MatMenuModule,
		MatDividerModule,
		MatIconModule,
		MatTabsModule,
		MatCardModule,
		MatGridListModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatTooltipModule,
		SatPopoverModule,
		TranslateModule,
		ColorPickerModule,
		MatFormFieldModule,
		MatInputModule,
	],
	exports: [
		AssetPreviewComponent,
		DynamicInspectorComponent,
		DynamicArrayInspectorComponent,
		AssetInspectorComponent,
	],
	entryComponents: [
		RoadInspector,
		TextureInspector,
		MaterialInspector,
		AssetPreviewComponent,
		EsminiInspectorComponent,
		DynamicInspectorComponent,
		AssetInspectorComponent,
		DynamicArrayInspectorComponent,
		EnvironmentInspectorComponent,
		WorldSettingInspectorComponent,
	]
} )
export class TvMapModule {
}
