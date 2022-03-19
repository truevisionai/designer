/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  Input
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { SearchService } from "../search.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "egret-search-input-over",
  templateUrl: "./search-input-over.component.html",
  styleUrls: ["./search-input-over.component.scss"]
})
export class SearchInputOverComponent implements OnInit, OnDestroy {
  isOpen: boolean;
  @Input('resultPage') resultPage: string;
  @Input('placeholder') placeholder: string = "Search here";
  @Output("search") search = new EventEmitter();
  searchCtrl = new FormControl();
  searchCtrlSub: Subscription;
  constructor(
      private searchService: SearchService,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(debounceTime(200))
    .subscribe(value => {
      this.search.emit(value);
      this.searchService.searchTerm.next(value);
    });
  }

  ngOnDestroy() {
    if (this.searchCtrlSub) {
      this.searchCtrlSub.unsubscribe();
    }
  }
  navigateToResult() {
    if(this.resultPage) {
        this.router.navigateByUrl(this.resultPage);
    }
  }
  open() {
    this.isOpen = true;
    this.navigateToResult();
  }
  close() {
    this.isOpen = false;
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
