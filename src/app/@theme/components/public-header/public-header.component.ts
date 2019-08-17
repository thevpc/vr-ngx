import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbMenuItem } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { VrSharedState, CurrentUser } from '../../../@vr/core/services/vr.shared-state';
import { Router } from '@angular/router';
import { VrService } from '../../../@vr/core/services/vr.service';

@Component({
  selector: 'ngx-public-header',
  styleUrls: ['./public-header.component.scss'],
  templateUrl: './public-header.component.html',
})
export class PublicHeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  // [Vr]
  // user: any;
  user : CurrentUser = {name:'anonymous',picture:'',obj:null,connected:false} ;
  menu : NbMenuItem[] =[];
  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  mySpaceIcon = "unlock-outline";
  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
	      private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              // [Vr]
              private vrSharedState : VrSharedState,
              private router : Router,
              ) {
  }

  ngOnInit() {

    this.currentTheme = this.themeService.currentTheme;
    this.vrSharedState.authenticated.subscribe(x=>{
      if(x){
        this.mySpaceIcon="unlock-outline";
      }else{
        this.mySpaceIcon="lock-outline";
      }
    })
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = users.nick);

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
    this.vrSharedState.currentUser.subscribe(x=>{
      this.user=x;
    })
    //this.userService.getUsers()
    //  .subscribe((users: any) => this.user = users.nick);
    this.menu.push(
      {title:'Departments',children:[
        {title:'ComputerEngineering'},
        {title:'Advabced Mechanics'},
        {title:'Industrial Electronics'},
      ]},
      );
      this.menu.push(
        {title:'Laboratories',children:[
          {title:'LATIS'},
          {title:'LMS'},
          {title:'NOCCS'},
        ]},
        );
        this.menu.push({title:'Education'});
        this.menu.push({title:'Research'});
        this.menu.push({title:'Admission'});
        this.menu.push({title:'Campus Life'});
        this.menu.push({title:'Alumni'});
        this.menu.push({title:'News'});
        this.menu.push({title:'Contact'});
        this.menu.push({title:'MySpace'});
        this.menu.push({title:'Home'});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateLogin() {
    if(this.vrSharedState.isAuthenticated()){
      this.router.navigate(['/pages/dashboard']);
    }else{
      this.router.navigate(['/auth/login']);
    }
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
