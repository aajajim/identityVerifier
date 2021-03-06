import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IMenuItem {
  type: string,       // Possible values: link/dropDown/icon/separator/extLink
  name?: string,      // Used as display text for item and title for separator type
  state?: string,     // Router state
  icon?: string,      // Material icon name
  tooltip?: string,   // Tooltip text 
  disabled?: boolean, // If true, item will not be appeared in sidenav.
  sub?: IChildItem[], // Dropdown items
  badges?: IBadge[]
}
interface IChildItem {
  type?: string,
  name: string,       // Display text
  state?: string,     // Router state
  icon?: string,
  sub?: IChildItem[]
}

interface IBadge {
  color: string;      // primary/accent/warn/hex color codes(#fff000)
  value: string;      // Display text
}

@Injectable()
export class NavigationService {
  iconMenu: IMenuItem[] = [
    {
      name: 'HOME',
      type: 'icon',
      tooltip: 'Log out',
      icon: 'exit_to_app',
      state: 'home'
    },
    {
      name: 'PROFILE',
      type: 'icon',
      tooltip: 'Profile',
      icon: 'person',
      state: 'profile/overview'
    },
    {
      name: 'VERIFY ACCOUNT',
      type: 'icon',
      tooltip: 'Verify an account',
      icon: 'settings',
      state: 'profile/settings'
    },
    {
      type: 'separator',
      name: 'Main Items'
    },
    {
      name: 'DASHBOARD',
      type: 'link',
      tooltip: 'Dashboard',
      icon: 'dashboard',
      state: 'others'
    },
    {
      type: 'separator',
      name: 'External links'
    },
    {
      name: 'Ardor TestNet',
      type: 'extLink',
      tooltip: 'Documentation',
      icon: 'library_books',
      state: 'https://testardor.jelurida.com/index.html'
    },
    {
      name: 'Ardor Documentation',
      type: 'extLink',
      tooltip: 'Documentation',
      icon: 'library_books',
      state: 'https://ardordocs.jelurida.com'
    }
  ]

  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle: string = 'Quick access';

  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();


  constructor() { }

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    switch (menuType) {
      default:
        this.menuItems.next(this.iconMenu);
    }
  }
}