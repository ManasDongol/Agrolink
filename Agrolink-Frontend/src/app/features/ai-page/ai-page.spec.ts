import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiPage } from './ai-page';

describe('AiPage', () => {
  let component: AiPage;
  let fixture: ComponentFixture<AiPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
