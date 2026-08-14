# InvoiceGen

A professional-grade full-stack invoice generation platform with Indian GST support, 5 PDF templates, and a modern responsive UI.

## Tech Stack

- **Frontend**: React (Vite), React Router v6, Recharts, Axios, React Icons
- **Backend**: Node.js, Express, Puppeteer, EJS templates
- **Database**: MongoDB Atlas
- **Auth**: JWT (access + refresh) + optional Google OAuth
- **Email**: Resend (invoice delivery + password reset)

## Features

- JWT Authentication (login, signup, forgot/reset password, optional Google OAuth)
- Dashboard with revenue analytics charts
- Business profile management (one-time setup: name, GSTIN, logo, signature)
- Client management (full CRUD, search, pagination, billing + shipping addresses)
- Invoice builder with live preview and **paginated item list** (5/10/20 items per page)
- Automatic sequential invoice numbering (INV-YYYY-XXXXX per business per year)
- Indian GST calculation — CGST + SGST (intra-state) vs IGST (inter-state)
- 5 professional PDF invoice templates (Classic, Modern, Elegant, Corporate, Bold)
- PDF generation with Puppeteer, cached for re-download
- Invoice status workflow (Draft → Pending → Paid / Overdue)
- Search, status filters, date range, and pagination on invoice list
- Duplicate invoices, download PDF, email invoice to client
- Export invoices to CSV
- Dark mode / theme toggle
- Responsive design

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Google Cloud Console project (for OAuth)
- Resend account (for emails, free tier)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Create `.env` in `server/`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   RESEND_API_KEY=your_resend_api_key
   CLIENT_URL=http://localhost:5173
   ```
4. Create `.env` in `client/` (optional — `VITE_API_URL` defaults to `/api`, which the Vite dev proxy forwards to the backend):
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
5. Run development servers:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

## Project Structure

```
InvoiceGen/
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── templates/
│   │   └── utils/
│   └── package.json
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── README.md
```

## License

MIT
