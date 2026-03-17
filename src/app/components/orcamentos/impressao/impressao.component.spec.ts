import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpressaoComponent } from './impressao.component';

describe('ImpressaoComponent', () => {
  let component: ImpressaoComponent;
  let fixture: ComponentFixture<ImpressaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpressaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
