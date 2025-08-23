const API_BASE_URL = 'https://talabatak-backend2-zw4i.onrender.com/api';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  role: "user" | "delivery" | "admin";
  isPhoneVerified: boolean;
  photo?: string;
  provider?: 'local' | 'google' | 'facebook';
  providerId?: string;
  profileComplete?: boolean;
  deliveryStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  deliveryInfo;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  role?: string;
  isNewUser?: boolean;
  needsProfileCompletion?: boolean;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  location: string;
  role: "user" | "delivery" | "admin";
}

// Helper function to validate phone number (11 digits)
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phone);
};

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Regular registration
  async register(data: RegisterData): Promise<AuthResponse> {
    if (!isValidPhone(data.phone)) {
      throw new Error('Phone number must be exactly 11 digits');
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('authMethod', 'regular');
    }
    
    return result;
  }

  // Regular login with phone/password
  async login(phone: string, password: string): Promise<AuthResponse> {
    if (!isValidPhone(phone)) {
      throw new Error('Phone number must be exactly 11 digits');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result = await response.json();
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('authMethod', 'regular');
    }    
    return result;
  }

  // Google Authentication - Properly integrated with backend
  async googleAuth(googleUserData: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: googleUserData.sub,
          name: googleUserData.name,
          email: googleUserData.email,
          photo: googleUserData.picture,
          provider: 'google'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Google authentication failed');
      }

      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('authMethod', 'google');
      }
      
      return result;
    } catch (error) {
      console.error('Google auth failed:', error);
      throw error;
    }
  }

  // Complete social profile
  async completeSocialProfile(profileData) {
    try {
      const response = await fetch('/api/v1/auth/complete-social-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile completion failed');
      }

      // IMPORTANT: Store the new token returned from backend
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Also store updated user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error) {
      console.error('Profile completion error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get profile');
    }

    return response.json();
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'location' | 'photo'>>): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    const result = await response.json();
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async resetPassword(phone: string, newPassword: string): Promise<{ message: string }> {
    if (!isValidPhone(phone)) {
      throw new Error('Phone number must be exactly 11 digits');
    }

    const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    
    // Always clean up localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMethod');
    localStorage.removeItem('isGoogleAuth'); // Remove Google auth flag
  }

  // getCurrentUser(): User | null {
  //   const userStr = localStorage.getItem('user');
  //   if (!userStr) return null;
    
  //   try {
  //     return JSON.parse(userStr);
  //   } catch (error) {
  //     console.error('Error parsing user data:', error);
  //     return null;
  //   }
  // }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    const isGoogleAuth = localStorage.getItem('isGoogleAuth');
    
    // For Google auth, we need to check if the temporary session is valid
    if (isGoogleAuth === 'true') {
      return !!(token && user && token.startsWith('google_'));
    }
    
    // For regular auth, check normal token and user
    return !!(token && user && !token.startsWith('google_'));
  }

  // Check if user needs to complete profile
  needsProfileCompletion(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.provider === 'google' && !user.profileComplete);
  }

  // Check if current session is Google-based
  isGoogleUser(): boolean {
    const user = this.getCurrentUser();
    const isGoogleAuth = localStorage.getItem('isGoogleAuth');
    return !!(user && (user.provider === 'google' || isGoogleAuth === 'true'));
  }

  // Get user role
  getUserRole(): "user" | "delivery" | "admin" | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Check if user session is still valid
  isSessionValid(): boolean {
    return this.isAuthenticated();
  }

  // Restore session on app load
  initializeAuth(): boolean {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        JSON.parse(user); // Will throw if invalid JSON
        return true;
      }
      
      return false;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  // Clear session data
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMethod');
    localStorage.removeItem('isGoogleAuth');
  }

  // Check if delivery person is approved
  isApprovedDelivery(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.role === 'delivery' && user.deliveryStatus === 'approved');
  }

  // Get delivery status
  getDeliveryStatus(): string | null {
    const user = this.getCurrentUser();
    return user?.deliveryStatus || null;
  }
}

export const authService = new AuthService();