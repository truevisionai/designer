/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { RouterModule } from '@angular/router';
import {
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import { ThreeJsModule } from '../three-js/three-js.module';
import { FormsModule } from '@angular/forms';
import { OdSignalInspectorComponent } from '../../views/inspectors/signal-inspector/signal-inspector.component';
import { CoreModule } from 'app/core/core.module';
import { LaneWidthInspector } from '../../views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NewRoadDialogComponent } from './dialogs/new-road-dialog/new-road-dialog.component';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { LaneRoadmarkInspectorComponent } from '../../views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { LaneInspectorComponent } from '../../views/inspectors/lane-type-inspector/lane-inspector.component';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateModule } from '@ngx-translate/core';
import { ShapeInspectorComponent } from '../../views/inspectors/shape-inspector/shape-inspector.component';
import { TransformInspectorComponent } from '../../views/inspectors/transform-inspector/transform-inspector.component';
import { RoadObjectInspectorComponent } from '../../views/inspectors/road-object-inspector/road-object-inspector.component';
import { PropModelInspectorComponent } from '../../views/inspectors/prop-model-inspector/prop-model-inspector.component';
import { PropInstanceInspectorComponent } from '../../views/inspectors/prop-instance-inspector/prop-instance-inspector.component';
import { PropCurveInspectorComponent } from '../../views/inspectors/prop-curve-inspector/prop-curve-inspector.component';
import { LaneOffsetInspector } from '../../views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { TextureInspector } from '../../views/inspectors/texture-inspector/texture-inspector.component';
import { MaterialInspector } from '../../views/inspectors/material-inspector/material-inspector.component';
import { ObjectPreviewComponent } from '../../views/inspectors/object-preview/object-preview.component';
import { RoadSignInspector } from '../../views/inspectors/road-sign-inspector/road-sign-inspector.component';
import { MaterialFieldComponent } from '../../views/fields/material-field/material-field.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { TextureFieldComponent } from '../../views/fields/texture-field/texture-field.component';
import { LaneLinkInspector } from '../../views/inspectors/lane-link-inspector/lane-link-inspector.component';
import { RoadControlPointInspector } from '../../views/inspectors/road-control-point-inspector/road-control-point-inspector.component';
import { JunctionEntryInspector } from '../../views/inspectors/junction-entry-inspector/junction-entry-inspector.component';
import { RoadStyleInspector } from 'app/views/inspectors/road-style-inspector/road-style-inspector.component';
import { PropPolygonInspectorComponent } from 'app/views/inspectors/prop-polygon-inspector/prop-polygon-inspector.component';
import { RoadMarkingInspector } from 'app/views/inspectors/road-marking-inspector/road-marking-inspector.component';


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
    ],
    imports: [
        CommonModule,
        SharedModule,
        PerfectScrollbarModule,
        ThreeJsModule,
        CoreModule,
        FlexLayoutModule,

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
        FormsModule,
        SatPopoverModule,
        TranslateModule,
        ColorPickerModule,
    ],
    exports: [
        TransformInspectorComponent
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
    ]
} )
export class TvMapModule {
}
