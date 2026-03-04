# Dameer Ahmed | Portfolio & Admin Node

A premium, full-stack portfolio with a centralized management dashboard. Built with a focus on performance, security, and futuristic aesthetics.

## 🔗 Live Links
- **Frontend:** [https://dameer-ahmed-portfolio.vercel.app/](https://dameer-ahmed-portfolio.vercel.app/)
- **Backend API:** [https://dameer-ahmed-portfolio.onrender.com/](https://dameer-ahmed-portfolio.onrender.com/)

## 🚀 Core Features
- **Dynamic Content:** Update Projects, Skills, and Bio in real-time.
- **Admin Dashboard:** Secure portal with OTP-based 2FA.
- **Bento Layout:** Modern edge-to-edge UI with Framer Motion animations.
- **Secure Messaging:** Integrated contact system with brute-force protection.

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS, Lucide Icons.
- **Backend:** FastAPI, SQLAlchemy (Async), Pydantic.
- **Database:** Neon DB (PostgreSQL).
- **Storage:** Cloudinary.

## 📦 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security Measures
- **Session Security:** HTTP-only cookies & Device ID binding.
- **Brute Force Protection:** IP-based lockout for login & OTP verification.
- **Auth Flow:** Hidden login trigger with secure password recovery.

---
Built by [Dameer Ahmed](https://github.com/dameerahmed)