import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasAReceberComponent } from './contas-a-receber.component';

describe('ContasAReceberComponent', () => {
  let component: ContasAReceberComponent;
  let fixture: ComponentFixture<ContasAReceberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasAReceberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContasAReceberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
