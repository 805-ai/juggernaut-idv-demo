# Juggernaut IDV (Independent Data Verification) Demo Application

A complete, production-ready demonstration application showcasing the Juggernaut IDV system's capabilities for independent data verification, blockchain integrity, gaming detection, and autonomy recomputation.

## 🚀 Features

### Core Capabilities
- **Receipt Verification**: Verify digital receipts with confidence scoring
- **Blockchain Chain Verification**: Validate blockchain integrity and consistency
- **Autonomy Recomputation**: Trigger and monitor autonomous computations
- **Gaming Detection**: Detect patterns and anomalies indicating gaming behavior
- **Public Key Management**: Secure key retrieval and signature verification

### Technical Features
- **Full-Stack Architecture**: React frontend + Node.js backend
- **RESTful API**: Comprehensive API with Swagger documentation
- **Authentication**: JWT-based auth with API key support
- **Rate Limiting**: Tiered rate limiting for different endpoints
- **Health Monitoring**: Kubernetes-ready health checks
- **Docker Support**: Complete containerization with docker-compose
- **Real-time Updates**: WebSocket support for live data
- **Caching**: Redis integration for performance
- **Database**: PostgreSQL for persistent storage

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

## 🛠️ Installation

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/your-org/juggernaut-idv-demo.git
cd juggernaut-idv-demo
```

2. Create environment file:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Local Development Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis:
```bash
# Using Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

4. Start the backend:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env if needed
```

3. Start the frontend:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=juggernaut_idv
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your-secret-key
CRYPTO_SECRET_KEY=your32bytesecretkeychangethisnow

# API Keys
MASTER_API_KEY=jug_master_key
SYSTEM_API_KEY=jug_system_key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Juggernaut IDV System
```

## 📚 API Documentation

### Authentication

The API supports two authentication methods:

1. **JWT Token**: For user-based authentication
```javascript
headers: {
  'Authorization': 'Bearer <token>'
}
```

2. **API Key**: For service-to-service communication
```javascript
headers: {
  'X-API-Key': '<api-key>'
}
```

### Main Endpoints

#### Health Check
```http
GET /api/health/check
```

#### Receipt Verification
```http
POST /api/receipts/verify
Content-Type: application/json

{
  "receiptData": {
    "transactionId": "TX123",
    "amount": 100,
    "merchant": "Store ABC"
  }
}
```

#### Chain Verification
```http
POST /api/chain/verify
Content-Type: application/json

{
  "chainData": {
    "blocks": [...],
    "chainId": "chain-001"
  }
}
```

#### Gaming Detection
```http
POST /api/gaming/detect
Content-Type: application/json

{
  "data": {...},
  "analysisType": "hybrid"
}
```

#### Autonomy Recomputation
```http
POST /api/autonomy/recompute
Content-Type: application/json

{
  "datasetId": "dataset-001",
  "parameters": {
    "iterations": 100,
    "threshold": 0.95
  }
}
```

Full API documentation available at: http://localhost:5000/api-docs

## 🏗️ Architecture

```
juggernaut-idv-demo/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── juggernautClient.ts  # API client
│   │   └── App.tsx          # Main application
│   └── Dockerfile
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   └── index.ts         # Server entry point
│   └── Dockerfile
├── docker-compose.yml        # Docker orchestration
└── README.md
```

## 🚀 Deployment

### Production Deployment with Docker

1. Build and start services:
```bash
docker-compose -f docker-compose.yml up -d --build
```

2. Check service health:
```bash
docker-compose ps
docker-compose logs -f
```

3. Scale services:
```bash
docker-compose up -d --scale backend=3
```

### Kubernetes Deployment

1. Apply configurations:
```bash
kubectl apply -f k8s/
```

2. Check deployment status:
```bash
kubectl get pods -n juggernaut
kubectl get services -n juggernaut
```

### Cloud Deployment Options

#### AWS
- Use ECS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- ALB for load balancing

#### Azure
- Use AKS for Kubernetes
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Application Gateway for routing

#### Google Cloud
- Use GKE for Kubernetes
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Cloud Load Balancing

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📊 Monitoring

### Health Endpoints
- Basic: `/health`
- Detailed: `/api/health/detailed`
- Readiness: `/api/health/ready`
- Liveness: `/api/health/live`

### Metrics
The application exposes metrics at `/metrics` for Prometheus scraping.

### Logging
Logs are written to:
- Console (development)
- `./logs/` directory (production)
- Structured JSON format for log aggregation

## 🔒 Security

### Security Features
- JWT authentication with refresh tokens
- API key management
- Rate limiting per endpoint
- Input validation with Joi
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js for security headers
- Environment variable encryption

### Security Best Practices
1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Implement API key rotation
4. Use strong passwords for databases
5. Enable audit logging
6. Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@juggernaut.ai
- Documentation: https://docs.juggernaut.ai

## 🎯 Roadmap

- [ ] WebSocket real-time updates
- [ ] Advanced analytics dashboard
- [ ] Machine learning integration
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Blockchain integration
- [ ] Advanced gaming detection ML models
- [ ] Distributed computing support

## 🙏 Acknowledgments

- Built with React, Node.js, and TypeScript
- Powered by PostgreSQL and Redis
- Containerized with Docker
- UI components from Material-UI

---

**Version**: 1.0.0
**Last Updated**: November 2024
**Status**: Production Ready