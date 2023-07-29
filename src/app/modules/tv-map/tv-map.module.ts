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
import { SharedModule } from 'app/shared/shared.module';
import { PropPolygonInspectorComponent } from 'app/views/inspectors/prop-polygon-inspector/prop-polygon-inspector.component';
import { RoadMarkingInspector } from 'app/views/inspectors/road-marking-inspector/road-marking-inspector.component';
import { RoadStyleInspector } from 'app/views/inspectors/road-style-inspector/road-style-inspector.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MaterialFieldComponent } from '../../views/fields/material-field/material-field.component';
import { TextureFieldComponent } from '../../views/fields/texture-field/texture-field.component';
import { JunctionEntryInspector } from '../../views/inspectors/junction-entry-inspector/junction-entry-inspector.component';
import { LaneLinkInspector } from '../../views/inspectors/lane-link-inspector/lane-link-inspector.component';
import { LaneOffsetInspector } from '../../views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { LaneRoadmarkInspectorComponent } from '../../views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { LaneInspectorComponent } from '../../views/inspectors/lane-type-inspector/lane-inspector.component';
import { LaneWidthInspector } from '../../views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { MaterialInspector } from '../../views/inspectors/material-inspector/material-inspector.component';
import { ObjectPreviewComponent } from '../../views/inspectors/object-preview/object-preview.component';
import { PropCurveInspectorComponent } from '../../views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
import { PropInstanceInspectorComponent } from '../../views/inspectors/prop-instance-inspector/prop-instance-inspector.component';
import { PropModelInspectorComponent } from '../../views/inspectors/prop-model-inspector/prop-model-inspector.component';
import { RoadControlPointInspector } from '../../views/inspectors/road-control-point-inspector/road-control-point-inspector.component';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { RoadObjectInspectorComponent } from '../../views/inspectors/road-object-inspector/road-object-inspector.component';
import { RoadSignInspector } from '../../views/inspectors/road-sign-inspector/road-sign-inspector.component';
import { ShapeInspectorComponent } from '../../views/inspectors/shape-inspector/shape-inspector.component';
import { OdSignalInspectorComponent } from '../../views/inspectors/signal-inspector/signal-inspector.component';
import { TextureInspector } from '../../views/inspectors/texture-inspector/texture-inspector.component';
import { TransformInspectorComponent } from '../../views/inspectors/transform-inspector/transform-inspector.component';
import { ThreeJsModule } from '../three-js/three-js.module';
import { NewRoadDialogComponent } from './dialogs/new-road-dialog/new-road-dialog.component';
import { RoadElevationInspector } from 'app/views/inspectors/road-elevation-inspector/road-elevation-inspector.component';
import { CrosswalkInspectorComponent } from 'app/views/inspectors/crosswalk-inspector/crosswalk-inspector.component';
import { PrefabInspectorComponent } from 'app/views/inspectors/prefab-inspector/prefab-inspector.component';
import { MeshInspectorComponent } from 'app/views/inspectors/mesh-inspector/mesh-inspector.component';
import { GeometryInspectorComponent } from 'app/views/inspectors/geometry-inspector/geometry-inspector.component';


@NgModule( {
	declarations: [
		OdSignalInspectorComponent,
		LaneInspectorComponent,
		LaneWidthInspector,
		NewRoadDialogComponent,
		RoadInspector,
		LaneRoadmarkInspectorComponent,
		ShapeInspectorComponent,
		TransformInspectorComponent,
		RoadObjectInspectorComponent,
		PropModelInspectorComponent,
		PropInstanceInspectorComponent,
		PropCurveInspectorComponent,
		PropPolygonInspectorComponent,
		LaneOffsetInspector,
		TextureInspector,
		MaterialInspector,
		ObjectPreviewComponent,
		RoadSignInspector,
		RoadMarkingInspector,
		MaterialFieldComponent,
		TextureFieldComponent,
		LaneLinkInspector,
		RoadControlPointInspector,
		JunctionEntryInspector,
		RoadStyleInspector,
		RoadElevationInspector,
		CrosswalkInspectorComponent,
		PrefabInspectorComponent,
		MeshInspectorComponent,
		GeometryInspectorComponent,
	],
	imports: [
		CommonModule,
		SharedModule,
		PerfectScrollbarModule,
		ThreeJsModule,
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
		TransformInspectorComponent,
		ObjectPreviewComponent
	],
	entryComponents: [
		OdSignalInspectorComponent,
		LaneInspectorComponent,
		LaneWidthInspector,
		NewRoadDialogComponent,
		RoadInspector,
		LaneRoadmarkInspectorComponent,
		ShapeInspectorComponent,
		RoadObjectInspectorComponent,
		PropModelInspectorComponent,
		PropInstanceInspectorComponent,
		PropCurveInspectorComponent,
		PropPolygonInspectorComponent,
		LaneOffsetInspector,
		TextureInspector,
		MaterialInspector,
		RoadSignInspector,
		RoadMarkingInspector,
		LaneLinkInspector,
		RoadControlPointInspector,
		JunctionEntryInspector,
		ObjectPreviewComponent,
		RoadStyleInspector,
		RoadElevationInspector,
		CrosswalkInspectorComponent,
		PrefabInspectorComponent,
		MeshInspectorComponent,
		GeometryInspectorComponent,
	]
} )
export class TvMapModule {
}
