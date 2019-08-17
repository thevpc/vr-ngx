import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VrPublicComponent } from './vr-public.component';

describe('VrPublicComponent', () => {
  let component: VrPublicComponent;
  let fixture: ComponentFixture<VrPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VrPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VrPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
