import { NgModule } from '@angular/core';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { HttpClientModule } from "@angular/common/http";
import { EventServiceProvider } from "../../app/listeners/event-service-provider";
import { SplineTestHelper } from "../../app/services/spline/spline-test-helper.service";
import { ToolBarService } from "../../app/views/editor/tool-bar/tool-bar.service";
import { TOOL_PROVIDERS } from "../../app/tools/tool";

@NgModule( {
	declarations: [],
	imports: [
		HttpClientModule,
		MatSnackBarModule
	],
	providers: [
		SplineTestHelper,
		EventServiceProvider,
		ToolBarService,
		{
			provide: TOOL_PROVIDERS,
			useValue: [],  // Default mock value
			multi: true,
		},
	]
} )
export class SharedTestModule {
}
