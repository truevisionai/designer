/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';


import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TrackDirective } from 'app/core/analytics/track.directive';
import { SearchPipe } from 'app/core/pipes/search.pipe';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorChromeModule } from 'ngx-color/chrome';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

import { StatusBarComponent } from '../views/editor/status-bar/status-bar.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ButtonLoadingComponent } from './components/button-loading/button-loading.component';
// ONLY FOR DEMO (Removable without changing any layout configuration)
import { CustomizerComponent } from './components/customizer/customizer.component';
import { FooterBottomComponent } from './components/footer-bottom/footer-bottom.component';
// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './components/header-side/header-side.component';
// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './components/header-top/header-top.component';
// ALL TIME REQUIRED
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ObjectInspectorComponent } from './components/object-inspector/object-inspector.component';
import { PropBrowserComponent } from './components/prop-browser/prop-browser.component';
import { SidebarSideComponent } from './components/sidebar-side/sidebar-side.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SplashComponent } from './components/splash/splash.component';
import { ImportFileDialogComponent } from './dialogs/import-file-dialog/import-file-dialog.component';
import { ComponentContainerDirective } from './directives/component-container.directive';
import { DropdownAnchorDirective } from './directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from './directives/dropdown-link.directive';
import { AppDropdownDirective } from './directives/dropdown.directive';
import { EgretSideNavToggleDirective } from './directives/egret-side-nav-toggle.directive';
// DIRECTIVES
import { FontSizeDirective } from './directives/font-size.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { ColorFieldComponent } from './fields/color-field/color-field.component';
import { DoubleFieldComponent } from './fields/double-field/double-field.component';
import { DropdownFieldComponent } from './fields/dropdown-field/dropdown-field.component';
import { EnumFieldComponent } from './fields/enum-field/enum-field.component';
import { RoadIdFieldComponent } from './fields/road-id-field/road-id-field.component';
import { SelectEntityFieldComponent } from './fields/select-entity-field/select-entity-field.component';
import { StringFieldComponent } from './fields/string-field/string-field.component';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { GetValueByKeyPipe, KeysPipe } from './pipes/get-value-by-key.pipe';
// PIPES
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { TranslatePipe } from './pipes/translate.pipe';
import { SearchModule } from './search/search.module';
import { AppComfirmComponent } from './services/app-confirm/app-confirm.component';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderComponent } from './services/app-loader/app-loader.component';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { AuthGuard } from './services/auth/auth.guard';
import { NavigationService } from './services/navigation.service';
import { RoutePartsService } from './services/route-parts.service';
// SERVICES
import { ThemeService } from './services/theme.service';
import { BooleanFieldComponent } from './fields/boolean-field/boolean-field.component';
import { Vector3FieldComponent } from './fields/vector3-field/vector3-field.component';
import { DoubleInputComponent } from './fields/double-input/double-input.component';
import { ButtonFieldComponent } from './fields/button-field/button-field.component';

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
	ButtonFieldComponent,
	Vector3FieldComponent,
	BooleanFieldComponent,
	DoubleFieldComponent,
	DoubleInputComponent,
	DropdownFieldComponent,
	EnumFieldComponent,
	StringFieldComponent,
	ColorFieldComponent,
	SelectEntityFieldComponent,
	PropBrowserComponent,
	RoadIdFieldComponent,

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
	declarations: [
		classesToInclude,
		RoadIdFieldComponent
	],
	exports: [ classesToInclude,
		MatTreeModule,
		MatSelectModule,
		MatListModule,
		MatDialogModule,
		MatIconModule,
		MatTabsModule,
		MatSelectModule,
		MatGridListModule,
		MatInputModule,
		MatButtonModule,
		MatExpansionModule, RoadIdFieldComponent,
	]
} )
export class SharedModule {
}
