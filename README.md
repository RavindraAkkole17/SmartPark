# 🅿️ SmartPark — AI-Based Smart Parking Management System

> **🏆 Selected by KSCST (Karnataka State Council for Science and Technology)**
> A government-recognised project built to solve real-world urban parking challenges.

SmartPark is a full-stack web application that lets users check parking slot availability remotely, navigate to the parking location, pre-book slots in advance, and pay online — all without having to physically visit the parking area first.

---

## 📸 Screenshots

<!-- Add your screenshots here -->
> _Add screenshots of the User Dashboard, Slot Booking view (CCTV overlay), Admin Dashboard, and Booking Ticket here._
> _Tip: Drag and drop images into your GitHub repo and paste the links._

---

## ✨ Features

### 👤 User Portal
- 🔍 **Browse Parking Areas** — Discover nearby parking with real-time slot availability
- 🎥 **CCTV Slot View** — Live overlay of slot status on CCTV feed (🟢 Empty · 🔴 Occupied · ⬜ Reserved)
- 📅 **Pre-Booking** — Reserve slots in advance with a date picker
- 💳 **Razorpay Payment** — Secure online payment gateway integration
- 🎫 **Digital Ticket with QR Code** — Downloadable/printable booking confirmation
- 🗺️ **Navigation Support** — Get directions to the parking location via Google Maps

### 🛠️ Admin Portal
- 🏗️ **Parking Area Management** — Create and manage parking areas with location coordinates
- 🎨 **Canvas-Based Slot Drawing** — Draw slot boundaries directly on a CCTV frame
- 📊 **Booking History** — View all bookings with filters by date and status
- 🔓 **Slot Management** — Manually free or manage reserved/occupied slots
- 📈 **Dashboard Stats** — Overview of total slots, active bookings, and revenue

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM |
| **Backend (Primary)** | Node.js, Express.js |
| **Backend (Java)** | Java (server-java directory) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Payment Gateway** | Razorpay API |
| **Maps & Navigation** | OpenStreetMap / Google Maps API |
| **Canvas & QR** | HTML5 Canvas, qrcode.react |
| **Styling** | CSS3 with Glassmorphism design |
| **Build Tool** | Vite |
| **Version Control** | Git, GitHub |

---

## 🏗️ Architecture

```
SmartPark/
│
├── src/                          # React Frontend
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx         # Role-based login (admin / user)
│   │   │   └── Register.jsx      # User registration
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx   # Stats overview & sidebar nav
│   │   │   ├── ParkingForm.jsx      # Create/edit parking areas
│   │   │   ├── SlotDrawer.jsx       # Canvas overlay for drawing slot coordinates
│   │   │   ├── BookingHistory.jsx   # View & filter all bookings
│   │   │   └── SlotManager.jsx      # Visual slot grid with free/manage actions
│   │   │
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx    # Parking discovery with search & filter
│   │   │   ├── ParkingView.jsx      # CCTV view with color-coded slot overlay
│   │   │   ├── SlotBooking.jsx      # Date picker & slot confirmation
│   │   │   ├── Payment.jsx          # Razorpay checkout integration
│   │   │   ├── Ticket.jsx           # Booking ticket with QR code
│   │   │   └── Navigation.jsx       # Directions to parking location
│   │   │
│   │   └── common/
│   │       ├── Navbar.jsx           # Role-based navigation bar
│   │       └── ProtectedRoute.jsx   # JWT-based route guards
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state management
│   ├── App.jsx
│   └── main.jsx
│
├── server/                       # Node.js Backend
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── middleware/
│   │   └── auth.js               # JWT verification + role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── ParkingArea.js
│   │   ├── Slot.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js               # Register, Login, /me
│   │   ├── parking.js            # Parking area CRUD + slot management
│   │   ├── booking.js            # Booking creation & history
│   │   └── payment.js            # Razorpay order creation & verification
│   └── server.js
│
├── server-java/                  # Java Backend (alternative server)
├── public/
└── index.html
```

---

## 🗄️ Database Schema

### Users
```javascript
{
  name: String,
  email: String,       // unique
  password: String,    // bcrypt hashed
  phone: String,
  role: "admin" | "user"
}
```

### ParkingAreas
```javascript
{
  adminId: ObjectId,
  name: String,
  location: { address, lat, lng },
  cctvUrl: String,
  totalSlots: Number,
  pricePerHour: Number
}
```

### Slots
```javascript
{
  parkingAreaId: ObjectId,
  slotNumber: String,         // e.g. "A1", "B3"
  coordinates: [{ x, y }],   // polygon drawn by admin on canvas
  status: "empty" | "occupied" | "reserved",
  currentBookingId: ObjectId
}
```

### Bookings
```javascript
{
  userId: ObjectId,
  parkingAreaId: ObjectId,
  slotId: ObjectId,
  bookingDate: Date,
  paymentId: String,          // Razorpay payment ID
  orderId: String,            // Razorpay order ID
  amount: Number,
  status: "confirmed" | "completed" | "cancelled"
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- Razorpay account (free at [razorpay.com](https://razorpay.com))

---

### 1. Clone the Repository

```bash
git clone https://github.com/RavindraAkkole17/SmartPark.git
cd SmartPark
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartpark
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5000
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

Start the backend server:

```bash
npm start
```

The server runs at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ..         # back to project root
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`

---

### 4. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write permissions
3. Under **Network Access**, add `0.0.0.0/0` (for development)
4. Copy the connection string and paste it in your `.env` as `MONGO_URI`

---

## 💳 Razorpay Payment Flow

1. User selects a slot and proceeds to checkout
2. Backend creates a Razorpay order (`POST /api/payment/create-order`)
3. Razorpay payment modal opens in the browser
4. On success, the backend verifies the payment signature (`POST /api/payment/verify`)
5. Booking is confirmed and a digital ticket with QR code is generated

**Test Cards (Razorpay Test Mode):**
```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date
CVV         : Any 3 digits
OTP         : 1234 (when prompted)
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register as user or admin |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get logged-in user details |

### Parking
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/parking` | Admin — create parking area |
| GET | `/api/parking` | Public — list all areas with slot counts |
| GET | `/api/parking/:id` | Public — get parking area with slots |
| POST | `/api/parking/:id/slots` | Admin — draw/save slot coordinates |
| PUT | `/api/parking/:id/slots/:slotId/free` | Admin — free a reserved slot |

### Bookings & Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/booking` | User — create a booking |
| GET | `/api/booking/my` | User — view booking history |
| GET | `/api/booking/parking/:id` | Admin — view area bookings |
| POST | `/api/payment/create-order` | User — create Razorpay order |
| POST | `/api/payment/verify` | User — verify payment signature |

---

## 🎨 Design System

| Element | Value |
|---|---|
| Primary Color | `#6C5CE7` (Purple) |
| Secondary | `#00CEC9` (Teal) |
| Accent | `#FD79A8` (Pink) |
| Background | `#0a0a1a` (Dark) |
| Card Surface | `#1a1a2e` (Dark Card) |
| Style | Glassmorphism with backdrop blur |
| Slot: Empty | 🟢 Green |
| Slot: Occupied | 🔴 Red |
| Slot: Reserved | ⬜ Gray |

---

## 🏆 Recognition

> **🎖️ KSCST Selected Project**
> This project was selected by the **Karnataka State Council for Science and Technology (KSCST)** — a Government of Karnataka body that recognises engineering projects with real-world impact and innovation.

The selection validates SmartPark as a solution to a genuine urban problem: wasted time and fuel from drivers circling for parking. By enabling remote visibility, advance booking, and online payment, SmartPark directly addresses this challenge.

---

## 🗺️ Roadmap

- [x] User & Admin authentication with JWT
- [x] Parking area creation and management
- [x] Canvas-based slot drawing on CCTV frame
- [x] Real-time slot status (empty / occupied / reserved)
- [x] Razorpay online payment integration
- [x] Digital ticket with QR code
- [x] Navigation / directions to parking
- [ ] Real-time slot detection using ML (YOLO/OpenCV — Python backend)
- [ ] Push notifications for booking confirmation
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Kannada, Hindi)

---

## 👨‍💻 Author

**Ravindra Akkole**
- 📧 akkoleravi17@gmail.com
- 💼 [LinkedIn](https://linkedin.com/in/ravindra-akkole)
- 🐙 [GitHub](https://github.com/RavindraAkkole17)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> ⭐ If SmartPark was useful or impressive, give it a star on GitHub — it helps others discover the project!
