# FindMyThing - Lost & Found Management System

FindMyThing is a professional, production-ready full-stack application developed for managing Lost and Found items at MITS. The project has been restructured into clean, independent `frontend/` and `backend/` modules, fully optimized for performance, security, and deployment on Vercel.

---

## Folder Structure

```
findout/
│
├── frontend/                     # Frontend Application (React + Vite)
│   ├── public/                   # Static resources
│   ├── src/
│   │   ├── assets/               # Branding assets
│   │   │   ├── images/           # Background watermarks, banners
│   │   │   ├── icons/            # Page icon sets
│   │   │   ├── fonts/            # Web fonts
│   │   │   └── logos/            # Brand marks
│   │   │
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Dynamic view templates (HTML views)
│   │   │   ├── Home/             # Index / Dashboard
│   │   │   ├── Login/            # User/Admin login screen
│   │   │   ├── Register/         # Account registration form
│   │   │   ├── OTP/              # Login verification modal
│   │   │   ├── Reset/            # Password reset prompt
│   │   │   ├── Admin/            # Admin system panels
│   │   │   ├── Collected/        # Reunited items archive
│   │   │   ├── Items/            # General lost and found feed
│   │   │   ├── MyItems/          # User posted items view
│   │   │   ├── ReportLost/       # Submission form for lost items
│   │   │   └── ReportFound/      # Submission form for found items
│   │   │
│   │   ├── styles/               # Styling sheets (navbar.css, style.css)
│   │   ├── utils/                # Client JS utilities (translate, navigation)
│   │   ├── services/             # API request wrappers
│   │   ├── hooks/                # React Hooks
│   │   ├── context/              # Context Providers
│   │   └── config/               # Frontend configs
│   │
│   │   ├── App.jsx               # React main component
│   │   └── main.jsx              # Vite entry script
│   │
│   ├── .env                      # Frontend environment config placeholder
│   ├── index.html                # Entry point for Vite bundler
│   ├── vite.config.js            # Vite compilation parameters
│   └── package.json              # Frontend package properties
│
├── backend/                      # Backend Server (Node.js + Express)
│   ├── config/                   # Config parameters
│   │   ├── database.js           # Mongoose DB connection logic
│   │   ├── mail.js               # SMTP Mail client transporter
│   │   ├── env.js                # App environment loader
│   │   └── multer.js             # File uploading params
│   │
│   ├── controllers/              # Request controllers
│   │   ├── authController.js     # User registration, logins, OTPs, password reset
│   │   ├── lostController.js     # Lost items processing
│   │   ├── foundController.js    # Found items and catalog loaders
│   │   ├── adminController.js    # Admin stats, record clear, collected deletes
│   │   ├── managerController.js  # Mark items collected, stats analytics computation
│   │   └── userController.js     # View serving and sessions falls
│   │
│   ├── models/                   # Mongoose DB schemas
│   │   ├── User.js               # User accounts database schema
│   │   ├── Collected.js          # Reunited collections database schema
│   │   ├── Item.js               # Submissions database schema
│   │   ├── LostItem.js           # Child mapping schema
│   │   ├── FoundItem.js          # Child mapping schema
│   │   └── OTP.js                # Verification logging placeholder schema
│   │
│   ├── routes/                   # API Endpoints
│   │   ├── authRoutes.js         # API and OTP authentication paths
│   │   ├── lostRoutes.js         # Lost submission paths
│   │   ├── foundRoutes.js        # Found submission and catalog paths
│   │   ├── adminRoutes.js        # Admin functions
│   │   ├── managerRoutes.js      # Manager functions
│   │   └── userRoutes.js         # View routing
│   │
│   ├── middleware/               # Middleware filters
│   │   ├── auth.js               # Role authorizations
│   │   ├── verifyOTP.js          # Verification middleware filter
│   │   ├── upload.js             # Upload interceptor
│   │   └── errorHandler.js       # Centralized exception logging handler
│   │
│   ├── utils/                    # Common backend helpers
│   │   ├── sendMail.js           # Isolated mailing script
│   │   ├── generateOTP.js        # Isolated OTP generation script
│   │   ├── validators.js         # Email validator check
│   │   └── helper.js             # Cycle and batch parsing calculators
│   │
│   ├── uploads/                  # User uploaded media assets
│   ├── server.js                 # Entry backend script configuring middleware & routers
│   ├── seed.js                   # MongoDB data seeder
│   ├── package.json              # Backend package details
│   └── .env                      # Secrets configurations
│
├── docs/                         # Additional documentation
├── vercel.json                   # Vercel deployment parameters
├── .gitignore                    # Git file exclusions
├── package.json                  # Root control scripts
└── README.md                     # Documentation file
```

---

## Technologies Used

- **Frontend**: React, Vite, HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Mailing**: Nodemailer (Gmail SMTP server)
- **Security & Performance**:
  - **Helmet**: Secures HTTP response headers (Content Security Policy adjusted for inline scripts compatibility).
  - **CORS**: Handles Cross-Origin Resource Sharing.
  - **Express Rate Limit**: Protects API paths `/api/` from request abuse (max 100 queries per 15 minutes).
- **Deployment**: Vercel Serverless hosting

---

## Environment Variables Guide

Variables are loaded on the backend from `backend/.env` and remain private to the server.

| Variable Name | Purpose | Example Value |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://127.0.0.1:27017/findmything` |
| `EMAIL_USER` | SMTP username email | `cpradeepkumar4477@gmail.com` |
| `EMAIL_PASS` | App password generated for Gmail | `kudbuituutffsval` |
| `SESSION_SECRET` | Encryption secret for user sessions | `findmythingsecret` |
| `PORT` | Local network port for server | `3000` |

---

## Installation & Setup

1. **Install dependencies** for all folders:
   ```bash
   npm run install-all
   ```
2. **Create backend environment secrets**:
   Create a file `backend/.env` and write the SMTP passwords and MongoDB URLs.

---

## Running Locally

1. **Backfill database logging (Optional)**:
   ```bash
   npm run seed
   ```
2. **Launch the server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` on your web browser.

---

## Vercel Deployment Guide

To deploy this project to Vercel:

1. Install the Vercel CLI or log into your [Vercel Dashboard](https://vercel.com).
2. Connect your Git repository.
3. Configure the environment variables matching the table above inside the Vercel Dashboard project settings.
4. Vercel automatically matches configurations inside the root-level `vercel.json` file. It compiles `backend/server.js` into serverless backend modules and serves the pages dynamically.

---

## API Documentation

### Auth Module (`/api/auth`)
- `POST /register`: Registers new users and emails a verification OTP.
- `POST /login`: Logins user session.
- `GET /logout`: Clears session.
- `POST /send-otp`: Dispatches a verification OTP.
- `POST /verify-login-otp`: Activates user verification.
- `POST /verify-otp`: Confirms reset code.
- `POST /reset-password`: Resets user login passwords.

### Submissions & Feed (`routes/lostRoutes.js`, `routes/foundRoutes.js`)
- `POST /lost`: User posts a lost item record.
- `POST /found`: User posts a found item record.
- `GET /api/items`: Displays active lost and found items.
- `GET /api/my-items`: Returns posts created by the current user session.
- `GET /api/collected`: Fetches logs of collected items.

### Manager & Admin Admin controls (`routes/adminRoutes.js`, `routes/managerRoutes.js`)
- `POST /mark-collected`: Archives active items to the collected list.
- `POST /delete-collected`: Permanently cleans collected database logs.
- `DELETE /clear-record/:record_id`: Removes items and deletes physical media uploads.
- `GET /api/stats`: Stats metrics of active vs collected items.
- `GET /api/manager/found-items/analytics`: Computes contributor rankings and monthly stats.
