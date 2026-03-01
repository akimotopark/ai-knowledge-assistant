import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  // ✅ Modern: We import what we need directly into the component
  imports: [CommonModule, FormsModule, RouterLink],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  message = signal('');
  error = signal('');

  onRegister() {
    //rest the message 
    this.message.set('');
    this.error.set('');

    const registrationData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.auth.register(registrationData).subscribe({
      next: () => {
        this.message.set('Registration successful. Please login.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        this.error.set(err.error.message || 'Registration failed');
      }
    })
  }
}