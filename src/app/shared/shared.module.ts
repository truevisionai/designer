/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    // MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
} from '@angular/material';
// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './components/header-side/header-side.component';
import { SidebarSideComponent } from './components/sidebar-side/sidebar-side.component';
// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './components/header-top/header-top.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';
// ONLY FOR DEMO (Removable without changing any layout configuration)
import { CustomizerComponent } from './components/customizer/customizer.component';
// ALL TIME REQUIRED
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AppComfirmComponent } from './services/app-confirm/app-confirm.component';
import { AppLoaderComponent } from './services/app-loader/app-loader.component';
// DIRECTIVES
import { FontSizeDirective } from './directives/font-size.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { AppDropdownDirective } from './directives/dropdown.directive';
import { DropdownAnchorDirective } from './directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from './directives/dropdown-link.directive';
import { EgretSideNavToggleDirective } from './directives/egret-side-nav-toggle.directive';
// PIPES
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { GetValueByKeyPipe, KeysPipe } from './pipes/get-value-by-key.pipe';
// SERVICES
import { ThemeService } from './services/theme.service';
import { NavigationService } from './services/navigation.service';
import { RoutePartsService } from './services/route-parts.service';
import { AuthGuard } from './services/auth/auth.guard';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { ButtonLoadingComponent } from './components/button-loading/button-loading.component';
import { SearchModule } from './search/search.module';

import { StatusBarComponent } from '../views/editor/status-bar/status-bar.component';
import { ComponentContainerDirective } from './directives/component-container.directive';
import { DoubleFieldComponent } from './fields/double-field/double-field.component';
import { EnumFieldComponent } from './fields/enum-field/enum-field.component';
import { ImportFileDialogComponent } from './dialogs/import-file-dialog/import-file-dialog.component';
import { ObjectInspectorComponent } from './components/object-inspector/object-inspector.component';
import { SearchPipe } from 'app/core/pipes/search.pipe';
import { FooterBottomComponent } from './components/footer-bottom/footer-bottom.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { PropBrowserComponent } from './components/prop-browser/prop-browser.component';
import { TrackDirective } from 'app/core/analytics/track.directive';
import { StringFieldComponent } from './fields/string-field/string-field.component';
import { ColorFieldComponent } from './fields/color-field/color-field.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorSketchModule } from 'ngx-color/sketch';
import { ColorChromeModule } from 'ngx-color/chrome';
import { DropdownFieldComponent } from './fields/dropdown-field/dropdown-field.component';
import { SplashComponent } from './components/splash/splash.component';

/* 
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/
// import { LandingPageService } from '../shared/services/landing-page.service';

const classesToInclude = [
    HeaderTopComponent,
    SidebarTopComponent,
    SidenavComponent,
    NotificationsComponent,
    SidebarSideComponent,
    HeaderSideComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    BreadcrumbComponent,
    AppComfirmComponent,
    AppLoaderComponent,
    CustomizerComponent,
    ButtonLoadingComponent,
    FontSizeDirective,
    ScrollToDirective,
    AppDropdownDirective,
    DropdownAnchorDirective,
    DropdownLinkDirective,
    ComponentContainerDirective,
    EgretSideNavToggleDirective,
    RelativeTimePipe,
    ExcerptPipe,
    GetValueByKeyPipe,
    KeysPipe,
    StatusBarComponent,
    ImportFileDialogComponent,
    ObjectInspectorComponent,
    SearchPipe,
    FooterBottomComponent,
    SplashComponent,
    TranslatePipe,

    // Fields
    DoubleFieldComponent,
    DropdownFieldComponent,
    EnumFieldComponent,
    StringFieldComponent,
    ColorFieldComponent,
    PropBrowserComponent,

    // Material

    // Directive
    TrackDirective,

];

@NgModule( {
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FlexLayoutModule,
        TranslateModule,
        MatSliderModule,
        MatSidenavModule,
        MatListModule,
        MatTooltipModule,
        MatOptionModule,
        MatSelectModule,
        MatMenuModule,
        MatTabsModule,
        MatSnackBarModule,
        MatGridListModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatRadioModule,
        MatCheckboxModule,
        MatCardModule,
        MatProgressSpinnerModule,
        // MatRippleModule,
        MatDialogModule,
        SearchModule,
        PerfectScrollbarModule,
        MatTreeModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatListModule,
        MatDialogModule,
        ColorPickerModule,
        ColorSketchModule,
        ColorChromeModule,
    ],
    entryComponents: [
        AppComfirmComponent,
        AppLoaderComponent,
        ImportFileDialogComponent
    ],
    providers: [
        ThemeService,
        NavigationService,
        RoutePartsService,
        AuthGuard,
        AppConfirmService,
        AppLoaderService
        // LandingPageService
    ],
    declarations: classesToInclude,
    exports: [ classesToInclude, MatTreeModule, MatSelectModule, MatListModule, MatDialogModule ]
} )
export class SharedModule {
}
