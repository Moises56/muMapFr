import { Component } from '@angular/core';
import { LocationInputComponent } from '../location-input/location-input.component';
import { MapComponent  } from '../map/map.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'muMap';
}
