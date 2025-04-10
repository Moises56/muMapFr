export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface User {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    nombreUsuario: string;
    identidad: string;
    telefono: string;
    rol: 'ADMIN' | 'MODERATOR' | 'OPERADOR';
    estado: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RegisterRequest {
    nombre: string;
    apellido: string;
    correo: string;
    nombreUsuario: string;
    contrasena: string;
    rol: 'ADMIN' | 'MODERATOR' | 'OPERADOR';
} 