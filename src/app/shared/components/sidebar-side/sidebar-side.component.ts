import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NavigationService } from "../../../shared/services/navigation.service";
import { ThemeService } from '../../services/theme.service';
import { Subscription } from "rxjs";
import { ArdorAccountService } from '../../services/ardor/ardor-account.service';
import { ArdorAccount } from 'app/shared/models/ardor.model';

// import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-sidebar-side',
  templateUrl: './sidebar-side.component.html'
})
export class SidebarSideComponent implements OnInit, OnDestroy, AfterViewInit {
  // private sidebarPS: PerfectScrollbar;
  public menuItems: any[];
  public hasIconTypeMenuItem: boolean;
  public iconTypeMenuTitle: string;
  private menuItemsSub: Subscription;
  profileAccount: ArdorAccount;

  constructor(
    private navService: NavigationService,
    public themeService: ThemeService,
    private ardorAS: ArdorAccountService
  ) { }

  ngOnInit() {
    this.iconTypeMenuTitle = this.navService.iconTypeMenuTitle;
    this.menuItemsSub = this.navService.menuItems$.subscribe(menuItem => {
      this.menuItems = menuItem;
      //Checks item list has any icon type.
      this.hasIconTypeMenuItem = !!this.menuItems.filter(item => item.type === 'icon').length;
    });
    this.profileAccount = this.ardorAS.account;
  }
  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.sidebarPS = new PerfectScrollbar('#scroll-area', {
    //     suppressScrollX: true
    //   })
    // })
  }
  ngOnDestroy() {
    // if(this.sidebarPS) {
    //   this.sidebarPS.destroy();
    // }
    if(this.menuItemsSub) {
      this.menuItemsSub.unsubscribe()
    }
  }

}
