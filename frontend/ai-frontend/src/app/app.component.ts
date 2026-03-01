import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,           // ✅ Modern: Standalone enabled
    imports: [RouterOutlet],    // ✅ Import RouterOutlet directly
    template: `<router-outlet></router-outlet>`
})
export class AppComponent { }