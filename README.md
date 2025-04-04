```markdown
# Virtual Deal Room - Frontend

Next.js-based frontend for a secure business transactions platform with real-time features.

## Features

- User Authentication (Login/Registration)
- Deal Creation & Negotiation
- Real-time Chat with Socket.IO
- Document Management
- Analytics Dashboard
- Responsive UI with Radix Primitives
- Theme Support (Dark/Light modes)

## Tech Stack

- **Framework**: Next.js 15
- **State Management**: React Context
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI Primitives
- **Real-time**: Socket.IO Client
- **Notifications**: Sonner
- **Icons**: Lucide React

## File Structure

```
frontend/
├── app/              # App router directory
├── components/       # Reusable components
├── context/          # React context providers
├── lib/              # Utility functions
├── public/           # Static assets
├── .env              # Environment variables
└── package.json      # Dependencies
```

## Installation

### Prerequisites
- Node.js (v18+)
- Running backend server (from companion repo)
- Redis (for session management)

### Setup Steps

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/virtual-deal-room.git
cd virtual-deal-room/frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. **Start Development Server**
```bash
npm run dev
```

## Configuration

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@radix-ui` | Accessible UI primitives |
| `next-themes` | Dark/light mode support |
| `socket.io-client` | Real-time communication |
| `tailwind-merge` | Conditional class merging |
| `sonner` | Toast notifications |

### Scripts

- `npm run dev` - Start dev server (port 3000)
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

## Development Guidelines

1. **Component Structure**
```jsx
// Example component structure
import { useSocket } from '@/context/socket-context'

function ChatComponent() {
  const { socket } = useSocket()
  
  return (
    <div className="flex flex-col gap-2">
      {/* Chat messages */}
    </div>
  )
}
```

2. **Theming**
```jsx
// Wrap app with ThemeProvider
<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

3. **Real-time Features**
```jsx
// Example socket usage
useEffect(() => {
  socket?.on('new_message', handleNewMessage)
  return () => {
    socket?.off('new_message', handleNewMessage)
  }
}, [socket])
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL |

## Production Deployment

1. **Build Optimization**
```bash
npm run build
```

2. **Docker Setup**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install --production
RUN npm run build
CMD ["npm", "start"]
```

## License
MIT License
```
