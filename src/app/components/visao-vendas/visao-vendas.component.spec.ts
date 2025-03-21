import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisaoVendasComponent } from './visao-vendas.component';

describe('VisaoVendasComponent', () => {
  let component: VisaoVendasComponent;
  let fixture: ComponentFixture<VisaoVendasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisaoVendasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisaoVendasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
