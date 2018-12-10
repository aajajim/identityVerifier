import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Nested1Component } from './nested1.component';

describe('Nested1Component', () => {
  let component: Nested1Component;
  let fixture: ComponentFixture<Nested1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Nested1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Nested1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
