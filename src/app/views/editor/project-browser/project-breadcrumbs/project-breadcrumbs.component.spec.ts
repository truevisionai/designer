/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBreadcrumbsComponent } from './project-breadcrumbs.component';

describe( 'ProjectBreadcrumbsComponent', () => {
	let component: ProjectBreadcrumbsComponent;
	let fixture: ComponentFixture<ProjectBreadcrumbsComponent>;

	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ ProjectBreadcrumbsComponent ]
		} )
			.compileComponents();
	} ) );

	beforeEach( () => {
		fixture = TestBed.createComponent( ProjectBreadcrumbsComponent );
		component = fixture.componentInstance;
		fixture.detectChanges();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );
} );
