import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './loading.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule( {
	imports: [
		CommonModule,
		BrowserAnimationsModule, // Import BrowserAnimationsModule
		MatProgressBarModule,
		MatProgressSpinnerModule
	],
	declarations: [ LoadingComponent ],
	exports: [ LoadingComponent ]
} )
export class LoadingModule { }
