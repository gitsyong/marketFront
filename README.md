# YUJU Employee Benefits Frontend

Vue 3 frontend application for the YUJU Employee Benefits E-commerce System.

## Technology Stack

- **Framework**: Vue 3
- **Build Tool**: Vite
- **State Management**: Pinia
- **Router**: Vue Router
- **UI Library**: Element Plus
- **HTTP Client**: Axios

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API request modules
│   ├── assets/         # Images, styles, etc.
│   ├── components/     # Reusable components
│   ├── router/         # Vue Router configuration
│   ├── stores/         # Pinia stores
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.js         # Application entry point
├── .env.development    # Development environment variables
├── .env.production     # Production environment variables
├── index.html          # HTML template
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Prerequisites

- Node.js 16+ or 18+
- npm 8+ or yarn 1.22+

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure API Endpoint**
   
   The API proxy is configured in `vite.config.js`:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080',
         changeOrigin: true
       }
     }
   }
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will start on `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

   Production files will be generated in the `dist/` directory.

5. **Preview Production Build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

## Features

### Current Implementation
- Basic project structure
- Vue Router with authentication guard
- Pinia state management (user, cart)
- Axios HTTP client with interceptors
- Element Plus UI components
- Responsive design foundation

### Planned Features
- User authentication and authorization
- Product browsing and search
- Shopping cart management
- Order creation and history
- Points management
- Admin dashboard
- Notifications
- Reports and statistics

## Development

### State Management

The application uses Pinia for state management with the following stores:

- **User Store** (`stores/user.js`): User authentication, profile, and points
- **Cart Store** (`stores/cart.js`): Shopping cart items and operations

### API Requests

All API requests go through the configured Axios instance in `src/api/request.js`, which includes:

- Automatic token injection
- Response error handling
- Request/response interceptors

### Routing

Routes are defined in `src/router/index.js` with authentication guards to protect private routes.

## Environment Variables

- `VITE_APP_TITLE`: Application title
- `VITE_APP_BASE_API`: API base URL
- `VITE_APP_PORT`: Development server port

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Internal use only - YUJU Corporation
