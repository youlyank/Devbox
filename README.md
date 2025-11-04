# Zero-Code Builder with Self-Hosted Multi-LLM Brain

A comprehensive zero-code builder platform where users can visually design, deploy, and host AI-powered applications. All AI functionality is powered by open-source LLMs hosted on our own server infrastructure.

## 🚀 Features

### Core Builder
- **Visual Drag-Drop Canvas**: React Flow-based interface for building applications
- **Block System**: UI, Logic, AI, and API blocks that can be connected
- **Real-time AI Assistant**: Natural language building assistance
- **Project Management**: Save, load, and version control projects
- **Export/Import**: JSON-based project format

### AI Integration
- **Multi-LLM Support**: Uses z-ai-web-dev-sdk for AI functionality
- **Smart Suggestions**: AI-powered block recommendations
- **Context-Aware**: Understands existing project structure
- **Usage Tracking**: Monitor AI request limits and costs

### Hosting & Deployment
- **Subscription Tiers**: Free, Pro ($15/mo), Business ($49/mo), Enterprise
- **Container-based Deployment**: Docker containers for each project
- **Reverse Proxy**: Nginx with SSL and multi-domain routing
- **Usage Monitoring**: Track CPU, memory, and API usage

### Database Schema
- **Users & Authentication**: User management with subscription tiers
- **Projects**: Visual builder projects with workflow configurations
- **Workflows**: Node-based workflow definitions
- **Deployments**: Container deployment tracking
- **Billing**: Subscription and usage billing
- **Conversations**: Chat history for AI interactions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   LLM Layer     │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (z-ai-sdk)    │
│                 │    │                 │    │                 │
│ • React Flow    │    │ • API Routes    │    │ • Chat API      │
│ • Drag & Drop   │    │ • Database      │    │ • Generation    │
│ • AI Assistant  │    │ • Auth          │    │ • Embeddings    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Deployment    │
                    │   Layer         │
                    │                 │
                    │ • Docker        │
                    │ • Nginx         │
                    │ • SSL           │
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **React Flow** for visual builder
- **Tailwind CSS** with shadcn/ui components
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Node.js** with Next.js API routes
- **Prisma ORM** with SQLite database
- **z-ai-web-dev-sdk** for AI functionality
- **NextAuth.js** for authentication
- **Socket.io** for real-time features

### Infrastructure
- **Docker** for containerization
- **Nginx** for reverse proxy
- **SQLite** for development (PostgreSQL for production)
- **Redis** for caching (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zero-code-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **For production with Nginx**
   ```bash
   docker-compose --profile production up -d
   ```

3. **For example deployed project**
   ```bash
   docker-compose --profile example up -d
   ```

## 🎯 Usage

### Building Your First Application

1. **Open the Builder**: Navigate to the main page and click "Builder"
2. **Add Blocks**: Drag blocks from the palette on the left
3. **Connect Blocks**: Connect block inputs and outputs visually
4. **Configure Blocks**: Click on blocks to configure their properties
5. **Test Your App**: Use the preview mode to test functionality
6. **Deploy**: Click "Deploy" to publish your application

### Using the AI Assistant

1. **Click "AI Assistant"** in the top toolbar
2. **Describe what you want to build** in natural language
3. **Review Suggestions**: The AI will suggest blocks and connections
4. **Apply Suggestions**: Add the suggested blocks to your canvas

### Example: Chatbot Workflow

The demo includes a pre-built chatbot that:
- Accepts user input through a UI block
- Processes messages with an AI chat block
- Saves conversations to the database
- Displays responses in real-time

## 💰 Subscription Tiers

| Feature | Free | Pro ($15/mo) | Business ($49/mo) | Enterprise |
|---------|------|--------------|-------------------|------------|
| Projects | Unlimited | Unlimited | Unlimited | Unlimited |
| Deployments | 0 | 5 shared | 20 dedicated | Unlimited |
| AI Requests | 10/day | 1,000/month | 10,000/month | Unlimited |
| Custom Domains | ❌ | ❌ | ✅ | ✅ |
| Dedicated Container | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ | ✅ |
| SLA Guarantee | ❌ | ❌ | ❌ | ✅ |

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# AI Configuration
ZAI_API_KEY="your-z-ai-api-key"

# Deployment
NODE_ENV="development"
PORT=3000
```

### Database Schema

The application uses the following main models:
- **User**: User accounts and subscriptions
- **Project**: Builder projects with configurations
- **Workflow**: Visual workflow definitions
- **Deployment**: Container deployment information
- **Billing**: Subscription and usage tracking
- **Conversation**: AI chat history

## 🔌 API Endpoints

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### AI
- `POST /api/ai/generate` - Generate AI suggestions
- `POST /api/chat` - Send chat message

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get user info

### Subscriptions
- `GET /api/subscriptions` - List subscription tiers
- `POST /api/subscriptions` - Update subscription

### Deployments
- `POST /api/deployments` - Create deployment
- `GET /api/deployments` - List deployments

## 🧩 Block System

### UI Blocks
- **Button**: Clickable button element
- **Text Input**: User input field
- **Text**: Display text content

### Logic Blocks
- **Condition**: Conditional branching
- **Delay**: Time-based delays

### AI Blocks
- **AI Chat**: Conversational AI
- **AI Generate**: Content generation

### API Blocks
- **API Request**: HTTP requests
- **Webhook**: Receive webhooks

## 🚀 Deployment

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t zero-code-builder .
   ```

2. **Run the container**
   ```bash
   docker run -d -p 3000:3000 zero-code-builder
   ```

### Production Deployment

For production deployment with Nginx and SSL:

1. **Set up environment variables**
2. **Configure SSL certificates**
3. **Run with Docker Compose**
   ```bash
   docker-compose --profile production up -d
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join our Discord community
- **Email**: support@zerocodebuilder.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Visual builder interface
- ✅ AI assistant integration
- ✅ Basic deployment system
- ✅ Subscription management

### Phase 2 (Next)
- 🔄 Custom block creation
- 🔄 Advanced workflow features
- 🔄 Team collaboration
- 🔄 Version control

### Phase 3 (Future)
- 📋 Mobile app builder
- 📋 Advanced analytics
- 📋 Plugin ecosystem
- 📋 Enterprise features

---

Built with ❤️ using Next.js, React Flow, and z-ai-web-dev-sdk