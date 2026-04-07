import { TestBed } from '@angular/core/testing';

import { DetectionHistory } from './detection-history';

describe('DetectionHistory', () => {
  let service: DetectionHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetectionHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
