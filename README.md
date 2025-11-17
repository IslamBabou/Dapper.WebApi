# Dapper Web API + React (Vite + TypeScript)

A full-stack application built with **.NET 8**, **Dapper**, **SQL Server**, and a **React + Vite frontend**.  
Includes **JWT authentication**, **Admin/User roles**, and **image upload support** for products.

---

## 🚀 Tech Stack

### Backend
- .NET 8 Web API
- Dapper ORM
- SQL Server
- JWT Authentication
- BCrypt Password Hashing

### Frontend
- React 18
- Vite
- TypeScript
- Axios
- Bootstrap 5

---

## 📌 Features

### 🔐 Authentication
- Login with JWT
- Secured endpoints
- Token-based access

### 👤 User Management
- Admin can create users
- Admin can delete users
- Role-based access control (Admin / User)

### 🛒 Product Management
- CRUD products
- Image upload support
- Public endpoints for listing products

### 💻 React Frontend
- Login page
- Admin dashboard
- User list
- Product list
- Token stored in local storage
- Auto attach Authorization headers

---

## 🏗️ Project Structure

📦 Dapper.WebApi
┣ 📂 Controllers
┣ 📂 DTO
┣ 📂 Interfaces
┣ 📂 Models
┣ 📂 Repositories
┣ 📂 Services
┗ Program.cs

📦 react_project
┣ 📂 src
┃ ┣ 📂 Components
┃ ┣ 📂 Services
┃ ┗ App.tsx
┣ index.html
┗ vite.config.ts


🧪 Example API Endpoints
Auth
POST /api/Auth/login

Admin-only
POST   /api/Admin/create-admin
GET    /api/Admin/users
DELETE /api/Admin/delete/{id}

Products
GET    /api/Product
POST   /api/Product
DELETE /api/Product/{id}
