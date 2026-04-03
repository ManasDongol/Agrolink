import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyUsers } from './verify-users';

describe('VerifyUsers', () => {
  let component: VerifyUsers;
  let fixture: ComponentFixture<VerifyUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
