import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePosts } from './manage-posts';

describe('ManagePosts', () => {
  let component: ManagePosts;
  let fixture: ComponentFixture<ManagePosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
