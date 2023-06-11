import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OscEditorComponent } from './views/osc-editor/osc-editor.component';
import { OscEditorLayoutComponent } from './views/osc-editor-layout/osc-editor-layout.component';
import { OscMenuBarComponent } from './views/osc-menu-bar/osc-menu-bar.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule, FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { ThreeJsModule } from '../three-js/three-js.module';
import {
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { OscHierarchyComponent } from './views/osc-hierarchy/osc-hierarchy.component';
import { OscEntityInspector } from './inspectors/osc-entity-inspector/osc-entity-inspector.component';
import { OscFileHeaderComponent } from './inspectors/osc-file-header/osc-file-header.component';
import { AddVehicleDialogComponent } from './dialogs/add-vehicle-dialog/add-vehicle-dialog.component';
import { EditPositionDialogComponent } from './dialogs/edit-position-dialog/edit-position-dialog.component';
import { AddEntityInitDialogComponent } from './dialogs/add-entity-init-dialog/add-entity-init-dialog.component';
import { EditRoadNetworkDialogComponent } from './dialogs/edit-road-network-dialog/edit-road-network-dialog.component';
import { EditManeuverComponent } from './dialogs/edit-actions-dialog/edit-maneuver/edit-maneuver.component';
import { EditEventsComponent } from './dialogs/edit-actions-dialog/edit-events/edit-events.component';
import { EditActionComponent } from './dialogs/edit-actions-dialog/edit-action/edit-action.component';
import { ActionEditorComponent } from './views/osc-story-editor/action-editor/action-editor.component';
import { PositionEditorComponent } from './views/osc-story-editor/position-editor/position-editor.component';
import { EventEditorComponent } from './views/osc-story-editor/event-editor/event-editor.component';
import { ConditionEditorComponent } from './views/osc-story-editor/condition-editor/condition-editor.component';
import { ManeuverEditorComponent } from './views/osc-story-editor/maneuver-editor/maneuver-editor.component';
import { DistanceConditionEditorComponent } from './views/osc-story-editor/conditions/by-entity/distance-condition-editor/distance-condition-editor.component';
import { WorldPositionEditorComponent } from './views/osc-story-editor/positions/world-position-editor/world-position-editor.component';
import { RelativeObjectPositionEditorComponent } from './views/osc-story-editor/positions/relative-object-position-editor/relative-object-position-editor.component';
import { SimulationTimeConditionEditorComponent } from './views/osc-story-editor/conditions/by-value/simulation-time-condition-editor/simulation-time-condition-editor.component';
import { ChooseActionDialogComponent } from './dialogs/choose-action-dialog/choose-action-dialog.component';
import { SpeedActionComponent } from './views/osc-story-editor/actions/private-actions/speed-action/speed-action.component';
import { TargetEditorComponent } from './views/osc-story-editor/target-editor/target-editor.component';
import { DynamicsEditorComponent } from './views/osc-story-editor/dynamics-editor/dynamics-editor.component';
import { LaneChangeActionComponent } from './views/osc-story-editor/actions/private-actions/lane-change-action/lane-change-action.component';
import { EditStoryDialog } from './dialogs/edit-story-dialog/edit-story-dialog.component';
import { EditObjectInitDialog } from './dialogs/edit-object-init-dialog/edit-object-init.dialog';
import { PositionActionEditorComponent } from './views/osc-story-editor/actions/private-actions/position-action-editor/position-action-editor.component';
import { RoadPositionEditorComponent } from './views/osc-story-editor/positions/road-position-editor/road-position-editor.component';
import { LanePositionEditorComponent } from './views/osc-story-editor/positions/lane-position-editor/lane-position-editor.component';
import { OscToolBarComponent } from './views/osc-tool-bar/osc-tool-bar.component';
import { OscTrajectoryInspectorComponent } from './inspectors/osc-trajectory-inspector/osc-trajectory-inspector.component';
import { OscActionsInspectorComponent } from './inspectors/osc-actions-inspector/osc-player-actions-inspector.component';
import { FollowTrajectoryActionComponent } from './views/osc-story-editor/actions/private-actions/follow-trajectory-action/follow-trajectory-action.component';
import { OscTrajectoriesInspectorComponent } from './inspectors/osc-trajectories-inspector/osc-trajectories-inspector.component';
import { NewScenarioDialogComponent } from './dialogs/new-scenario-dialog/new-scenario-dialog.component';
import { EditActionsDialogComponent } from './dialogs/edit-actions-dialog/edit-actions-dialog.component';
import { OscActEditorComponent } from './views/osc-act-editor/osc-act-editor.component';
import { ChooseConditionDialogComponent } from './dialogs/choose-condition-dialog/choose-condition-dialog.component';
import { TvMapModule } from '../tv-map/tv-map.module';
import { OscParamatersInspectorComponent } from './inspectors/osc-paramaters-inspector/osc-paramaters-inspector.component';
import { ReachPositionConditionEditorComponent } from './views/osc-story-editor/conditions/by-entity/reach-position-condition-editor/reach-position-condition-editor.component';
import { RelativeSpeedConditionEditorComponent } from './views/osc-story-editor/conditions/by-entity/relative-speed-condition-editor/relative-speed-condition-editor.component';
import { SpeedConditionEditorComponent } from './views/osc-story-editor/conditions/by-entity/speed-condition-editor/speed-condition-editor.component';
import { TraveledDistanceConditionEditorComponent } from './views/osc-story-editor/conditions/by-entity/traveled-distance-condition-editor/traveled-distance-condition-editor.component';

@NgModule( {
    declarations: [
        OscEditorComponent,
        OscEditorLayoutComponent,
        OscMenuBarComponent,
        OscHierarchyComponent,
        OscEntityInspector,
        OscFileHeaderComponent,
        AddVehicleDialogComponent,
        EditPositionDialogComponent,
        AddEntityInitDialogComponent,
        EditRoadNetworkDialogComponent,
        EditManeuverComponent,
        EditEventsComponent,
        EditActionComponent,
        ActionEditorComponent,
        PositionEditorComponent,
        EventEditorComponent,
        ConditionEditorComponent,
        ManeuverEditorComponent,
        DistanceConditionEditorComponent,
        WorldPositionEditorComponent,
        RelativeObjectPositionEditorComponent,
        SimulationTimeConditionEditorComponent,
        ChooseActionDialogComponent,
        SpeedActionComponent,
        TargetEditorComponent,
        DynamicsEditorComponent,
        LaneChangeActionComponent,
        EditStoryDialog,
        EditObjectInitDialog,
        PositionActionEditorComponent,
        RoadPositionEditorComponent,
        LanePositionEditorComponent,
        OscToolBarComponent,
        OscTrajectoryInspectorComponent,
        OscActionsInspectorComponent,
        FollowTrajectoryActionComponent,
        OscTrajectoriesInspectorComponent,
        NewScenarioDialogComponent,
        EditActionsDialogComponent,
        OscActEditorComponent,
        ChooseConditionDialogComponent,
        OscParamatersInspectorComponent,
        ReachPositionConditionEditorComponent,
        RelativeSpeedConditionEditorComponent,
        SpeedConditionEditorComponent,
        TraveledDistanceConditionEditorComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        ThreeJsModule,
        CoreModule,

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
        MatListModule,
        MatSlideToggleModule,
        PerfectScrollbarModule,

        MatDialogModule,
        FlexLayoutModule,
        FlexModule,
        TvMapModule

    ],
    entryComponents: [
        OscEntityInspector,
        AddVehicleDialogComponent,
        EditPositionDialogComponent,
        AddEntityInitDialogComponent,
        EditRoadNetworkDialogComponent,
        ChooseActionDialogComponent,
        EditStoryDialog,
        EditObjectInitDialog,
        OscTrajectoryInspectorComponent,
        OscActionsInspectorComponent,
        FollowTrajectoryActionComponent,
        OscTrajectoriesInspectorComponent,
        NewScenarioDialogComponent,
        OscActEditorComponent,
        ChooseConditionDialogComponent,
        SpeedActionComponent,
        OscParamatersInspectorComponent,
        EventEditorComponent
    ]
} )
export class OpenScenarioModule {
}
