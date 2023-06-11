import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from 'app/shared/services/layout.service';
import { ThemeService } from 'app/shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component( {
	selector: 'app-osc-editor-layout',
	templateUrl: './osc-editor-layout.component.html'
} )
export class OscEditorLayoutComponent implements OnInit {

	public isModuleLoading: Boolean = false;
	public scrollConfig = {};
	public layoutConf: any = {
		'navigationPos': 'side',      // side, top
		'sidebarStyle': 'closed',       // full, compact, closed
		'sidebarColor': 'dark-gray',      // http://demos.ui-lib.com/egret-doc/#egret-colors
		'sidebarCompactToggle': false, // applied when "sidebarStyle" is "compact"
		'dir': 'ltr',                 // ltr, rtl
		'useBreadcrumb': false,
		'topbarFixed': false,
		'topbarColor': 'dark-gray',       // http://demos.ui-lib.com/egret-doc/#egret-colors
		'matTheme': 'egret-dark-pink',     // egret-blue, egret-navy, egret-dark-purple, egret-dark-pink
		'breadcrumb': 'simple',       // simple, title
		'perfectScrollbar': true
	};
	private moduleLoaderSub: Subscription;
	private layoutConfSub: Subscription;
	private routerEventSub: Subscription;

	constructor (
		private router: Router,
		public translate: TranslateService,
		public themeService: ThemeService,
		private layout: LayoutService
	) {
		// // Close sidenav after route change in mobile
		// this.routerEventSub = router.events.pipe( filter( event => event instanceof NavigationEnd ) )
		//   .subscribe( ( routeChange: NavigationEnd ) => {
		//     this.layout.adjustLayout( { route: routeChange.url } );
		//   } );

		// // Translator init
		// const browserLang: string = translate.getBrowserLang();
		// translate.use( browserLang.match( /en|fr/ ) ? browserLang : 'en' );
	}

	ngOnInit () {
		// // this.layoutConf = this.layout.layoutConf;
		// this.layoutConfSub = this.layout.layoutConf$.subscribe( ( layoutConf ) => {
		//   this.layoutConf = layoutConf;
		// } )
		// // FOR MODULE LOADER FLAG
		// this.moduleLoaderSub = this.router.events.subscribe( event => {
		//   if ( event instanceof RouteConfigLoadStart || event instanceof ResolveStart ) {
		//     this.isModuleLoading = true;
		//   }
		//   if ( event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd ) {
		//     this.isModuleLoading = false;
		//   }
		// } );
	}

	@HostListener( 'window:resize', [ '$event' ] )
	onResize ( event ) {
		this.layout.adjustLayout( event );
	}

	ngAfterViewInit () {

	}


	scrollToTop ( selector: string ) {
		if ( document ) {
			let element = <HTMLElement> document.querySelector( selector );
			element.scrollTop = 0;
		}
	}

	ngOnDestroy () {
		if ( this.moduleLoaderSub ) {
			this.moduleLoaderSub.unsubscribe();
		}
		if ( this.layoutConfSub ) {
			this.layoutConfSub.unsubscribe();
		}
		if ( this.routerEventSub ) {
			this.routerEventSub.unsubscribe();
		}
	}

	closeSidebar () {
		this.layout.publishLayoutChange( {
			sidebarStyle: 'closed'
		} );
	}

	sidebarMouseenter ( e ) {
		if ( this.layoutConf.sidebarStyle === 'compact' ) {
			this.layout.publishLayoutChange( { sidebarStyle: 'full' }, { transitionClass: true } );
		}
	}

	sidebarMouseleave ( e ) {
		if (
			this.layoutConf.sidebarStyle === 'full' &&
			this.layoutConf.sidebarCompactToggle
		) {
			this.layout.publishLayoutChange( { sidebarStyle: 'compact' }, { transitionClass: true } );
		}
	}

}
