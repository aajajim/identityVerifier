import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { HttpModule } from '@angular/http';

import { 
  MatSidenavModule,
  MatListModule,
  MatTooltipModule,
  MatOptionModule,
  MatSelectModule,
  MatMenuModule,
  MatSnackBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatCardModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatDialogModule
} from '@angular/material';

// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './components/header-side/header-side.component';
import { SidebarSideComponent } from './components/sidebar-side/sidebar-side.component';

// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
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
import { GetValueByKeyPipe } from './pipes/get-value-by-key.pipe';
import { TransactionTypePipe} from './pipes/tx-type.pipe';
import { TransactionConfirmationsPipe} from './pipes/tx-confirmations.pipe';

// SERVICES
import { ThemeService } from './services/theme.service';
import { LayoutService } from './services/layout.service';
import { NavigationService } from './services/navigation.service';
import { RoutePartsService } from './services/route-parts.service';
import { AuthGuard } from './services/auth/auth.guard';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';

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
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  EgretSideNavToggleDirective,
  RelativeTimePipe,
  ExcerptPipe,
  GetValueByKeyPipe,
  TransactionTypePipe,
  TransactionConfirmationsPipe
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FlexLayoutModule,
    TranslateModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatDialogModule,
    PerfectScrollbarModule,
    HttpModule
  ],
  entryComponents: [AppComfirmComponent, AppLoaderComponent],
  providers: [
    ThemeService,
    LayoutService,
    NavigationService,
    RoutePartsService,
    AuthGuard,
    AppConfirmService,
    AppLoaderService
    // LandingPageService
  ],
  declarations: classesToInclude,
  exports: classesToInclude
})
export class SharedModule { }
