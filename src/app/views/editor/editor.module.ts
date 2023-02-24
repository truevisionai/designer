/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ThreeJsModule } from '../../modules/three-js/three-js.module';
import { SharedModule } from '../../shared/shared.module';
import { ConsoleComponent } from './console/console.component';
import { ExportGlbDialog } from './dialogs/export-glb-dialog/export-glb-dialog.component';
import { ExportOpenDriveDialog } from './dialogs/export-opendrive-dialog/export-opendrive-dialog.component';
import { EditorComponent } from './editor.component';
import { EditorLayoutComponent } from './layout/editor-layout.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';
import { FileComponent } from './project-browser/file/file.component';
import { FolderFilesComponent } from './project-browser/folder-files/folder-files.component';
import { ProjectBreadcrumbsComponent } from './project-browser/project-breadcrumbs/project-breadcrumbs.component';
import { ProjectBrowserComponent } from './project-browser/project-browser.component';
import { ProjectHierarchyComponent } from './project-browser/project-hierarchy/project-hierarchy.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';

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
        MatIconModule,
        MatTooltipModule,
    ],
    entryComponents: [
        ExportGlbDialog
    ]
} )
export class EditorModule {
}
