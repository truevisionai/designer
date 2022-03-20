/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { EditorLayoutComponent } from './layout/editor-layout.component';
import { EditorComponent } from './editor.component';
import { FlexModule, FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule, MatTreeModule, MatGridListModule, MatCardModule, MatListModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatTableModule, MatTabsModule, MatBadgeModule, MatChipsModule } from '@angular/material';
import { ThreeJsModule } from '../../modules/three-js/three-js.module';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerBarComponent } from './player-bar/player-bar.component';
import { ProjectBrowserComponent } from './project-browser/project-browser.component';
import { ProjectHierarchyComponent } from './project-browser/project-hierarchy/project-hierarchy.component';
import { ProjectBreadcrumbsComponent } from './project-browser/project-breadcrumbs/project-breadcrumbs.component';
import { FolderFilesComponent } from './project-browser/folder-files/folder-files.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ExportGlbDialog } from './dialogs/export-glb-dialog/export-glb-dialog.component';
import { ExportOpenDriveDialog } from './dialogs/export-opendrive-dialog/export-opendrive-dialog.component';
import { FileComponent } from './project-browser/file/file.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsoleComponent } from './console/console.component';

@NgModule( {
    declarations: [
        ToolBarComponent,
        MenuBarComponent,
        EditorLayoutComponent,
        EditorComponent,
        PlayerBarComponent,
        ProjectBrowserComponent,
        ProjectHierarchyComponent,
        ProjectBreadcrumbsComponent,
        FolderFilesComponent,
        FileComponent,
        ExportGlbDialog,
        ExportOpenDriveDialog,
        ConsoleComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexModule,
        RouterModule,
        SharedModule,
        MatMenuModule,
        MatToolbarModule,
        MatDividerModule,
        ThreeJsModule,
        SatPopoverModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        TranslateModule,
        MatTreeModule,
        MatGridListModule,
        MatCardModule,
        FlexLayoutModule,
        PerfectScrollbarModule,
        MatListModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatBadgeModule,
        MatChipsModule,
    ],
    entryComponents: [
        ExportGlbDialog
    ]
} )
export class EditorModule {
}
