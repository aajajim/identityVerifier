import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from "../../../shared/services/navigation.service";
import { LayoutService } from '../../../shared/services/layout.service';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-customizer',
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss']
})
export class CustomizerComponent implements OnInit {
  isCustomizerOpen: boolean = false;
  sidenavTypes = [{
    name: 'Default Menu',
    value: 'default-menu'
  }, {
    name: 'Separator Menu',
    value: 'separator-menu'
  }, {
    name: 'Icon Menu',
    value: 'icon-menu'
  }]
  layoutConf;
  selectedMenu: string = 'icon-menu';
  selectedLayout: string;
  isTopbarFixed = false;
  isRTL = false;
  constructor(
    private navService: NavigationService,
    private layout: LayoutService
  ) {}

  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.selectedLayout = this.layoutConf.navigationPos;
    this.isTopbarFixed = this.layoutConf.topbarFixed;
    this.isRTL = this.layoutConf.dir === 'rtl';
  }
  changeLayoutStyle(data) {
    this.layout.publishLayoutChange({navigationPos: this.selectedLayout})
  }
  changeSidenav(data) {
    this.navService.publishNavigationChange(data.value)
  }
  toggleBreadcrumb(data) {
    this.layout.publishLayoutChange({breadcrumb: data.checked})
  }
  toggleTopbarFixed(data) {
    this.layout.publishLayoutChange({topbarFixed: data.checked})
  }
  toggleDir(data) {
    let dir = data.checked ? 'rtl' : 'ltr';
    this.layout.publishLayoutChange({dir: dir})
  }
}