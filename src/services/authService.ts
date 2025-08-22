const API_BASE_URL = 'http://localhost:5000/api';

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
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  isNewUser?: boolean;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  location: string;
  role: "user" | "delivery" | "admin";
}

export interface SocialAuthData {
  name: string;
  email: string;
  photo?: string;
  providerId: string;
  provider: 'google' | 'facebook';
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
    }
    
    return result;
  }

  // // Google Authentication
  // async googleAuth(): Promise<AuthResponse> {
  //   return new Promise((resolve, reject) => {
  //     // Load Google Sign-In API
  //     if (!window.google) {
  //       reject(new Error('Google Sign-In API not loaded'));
  //       return;
  //     }

  //     window.google.accounts.oauth2.initTokenClient({
  //       client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  //       scope: 'email profile',
  //       callback: async (response) => {
  //         try {
  //           if (response.error) {
  //             reject(new Error(response.error));
  //             return;
  //           }

  //           // Get user info from Google
  //           const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
  //             headers: {
  //               Authorization: `Bearer ${response.access_token}`,
  //             },
  //           });

  //           const userInfo = await userInfoResponse.json();

  //           // Send to backend
  //           const authResponse = await fetch(`${API_BASE_URL}/auth/google`, {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({
  //               providerId: userInfo.id,
  //               name: userInfo.name,
  //               email: userInfo.email,
  //               photo: userInfo.picture,
  //             }),
  //           });

  //           if (!authResponse.ok) {
  //             const error = await authResponse.json();
  //             throw new Error(error.message || 'Google authentication failed');
  //           }

  //           const result = await authResponse.json();
            
  //           if (result.token) {
  //             localStorage.setItem('token', result.token);
  //             localStorage.setItem('user', JSON.stringify(result.user));
  //           }
            
  //           resolve(result);
  //         } catch (error) {
  //           reject(error);
  //         }
  //       },
  //     }).requestAccessToken();
  //   });
  // }

  // // Facebook Authentication
  // async facebookAuth(): Promise<AuthResponse> {
  //   return new Promise((resolve, reject) => {
  //     // Check if Facebook SDK is loaded
  //     if (!window.FB) {
  //       reject(new Error('Facebook SDK not loaded'));
  //       return;
  //     }

  //     window.FB.login((response) => {
  //       if (response.authResponse) {
  //         // Get user info from Facebook
  //         window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
  //           try {
  //             // Send to backend
  //             const authResponse = await fetch(`${API_BASE_URL}/auth/facebook`, {
  //               method: 'POST',
  //               headers: { 'Content-Type': 'application/json' },
  //               body: JSON.stringify({
  //                 providerId: userInfo.id,
  //                 name: userInfo.name,
  //                 email: userInfo.email,
  //                 photo: userInfo.picture?.data?.url,
  //               }),
  //             });

  //             if (!authResponse.ok) {
  //               const error = await authResponse.json();
  //               throw new Error(error.message || 'Facebook authentication failed');
  //             }

  //             const result = await authResponse.json();
              
  //             if (result.token) {
  //               localStorage.setItem('token', result.token);
  //               localStorage.setItem('user', JSON.stringify(result.user));
  //             }
              
  //             resolve(result);
  //           } catch (error) {
  //             reject(error);
  //           }
  //         });
  //       } else {
  //         reject(new Error('Facebook login cancelled'));
  //       }
  //     }, { scope: 'email' });
  //   });
  // }

  // Complete social profile (for new social users)
  async completeSocialProfile(data: {
    phone: string;
    address: string;
    role: 'user' | 'delivery';
    location: { coordinates: [number, number]; address: string };
  }): Promise<AuthResponse> {
    if (!isValidPhone(data.phone)) {
      throw new Error('Phone number must be exactly 11 digits');
    }

    const response = await fetch(`${API_BASE_URL}/auth/complete-social-profile`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile completion failed');
    }

    const result = await response.json();
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

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
    }    
    return result;
  }

  async getProfile(): Promise<{ user: User }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      }
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
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const googleUser = localStorage.getItem('user');
  
  // Check for regular token OR Google authentication
  return !!(token || (googleUser && JSON.parse(googleUser).provider === 'google'));
}



getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Updated logout to handle Google auth cleanup
  async logout(): Promise<void> {
    const isGoogleAuth = localStorage.getItem('isGoogleAuth');
    
    // If it's a regular backend session, call backend logout
    if (!isGoogleAuth) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
        // Continue with local cleanup even if backend call fails
      }
    }
    
    // Clean up all auth-related localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isGoogleAuth');
  }

  // Method to check if user needs to complete profile (for Google users)
  needsProfileCompletion(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.provider === 'google' && !user.phone);
  }

  // Future method for when backend Google endpoint is ready
  async googleAuthWithBackend(googleUserData: {
    providerId: string;
    name: string;
    email: string;
    photo?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...googleUserData,
        provider: 'google'
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response:', textResponse);
      throw new Error('Server endpoint not available yet');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Google authentication failed');
    }

    const result = await response.json();
    
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.removeItem('isGoogleAuth'); // Remove temp flag
    }
    
    return result;
  }

}



export const authService = new AuthService();