how to run?

like this

Perfect! Since MongoDB is set up and running, here’s a **full step-by-step guide for Windows using VS Code** to get your project running. I’ll assume you have **Node.js installed** and MongoDB is running as a service (Network Service).

---

# Step-by-Step Guide to Run Your Dashboard

### 1️⃣ Open Your Project in VS Code

1. Open VS Code.
2. Go to **File → Open Folder** and select `my-dashboard`.

---

### 2️⃣ Open the VS Code Terminal

* Press `` Ctrl + ` `` (backtick) to open the integrated terminal.

---

## 3️⃣ Backend Setup

### a) Navigate to backend folder

```powershell
cd backend
```

### b) Install dependencies

```powershell
npm install
```

> If you get an execution policy error in PowerShell, run this once in **admin PowerShell**:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then restart VS Code terminal.

### c) Set up environment variables

1. Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

2. Open `.env` in VS Code and set the values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/my-dashboard
JWT_SECRET=your_secret_key
```

> `my-dashboard` is the database name. MongoDB will create it automatically.

### d) Start the backend server

```powershell
npm start
```

* Or, for auto-reload on changes:

```powershell
npx nodemon server.js
```

✅ You should see:

```
Server running on port 5000
Connected to MongoDB
```

---

## 4️⃣ Frontend Setup

### a) Open a new terminal tab in VS Code

* Click the `+` icon in the terminal panel.

### b) Navigate to frontend folder

```powershell
cd frontend
```

### c) Install dependencies

```powershell
npm install
```

### d) Start the frontend dev server

```powershell
npm run dev
```

* It will show something like:

```
Local: http://localhost:5173/
```

* Open that URL in your browser.

---

## 5️⃣ Test Your Dashboard

* Backend API: `http://localhost:5000`
* Frontend: `http://localhost:5173`

If everything is running, your app should now load and interact with MongoDB.

---

### ✅ Optional Tips

* Keep **two VS Code terminals** open: one for backend, one for frontend.
* If you want **auto-restart** when editing backend code, use `nodemon`.
* MongoDB runs in the background as a service, so you don’t need to manually start it each time.

---

If you want, I can also give you a **shortcut way to start both backend and frontend in a single terminal** so you don’t have to juggle two terminals every time. This is super convenient for development.

Do you want me to do that?
