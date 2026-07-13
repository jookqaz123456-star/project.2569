# หอพักสัมฤทธิ์ — Samrit Residence

ระบบจัดการหอพัก: **ฝั่งแอดมิน** (`admin.html`) + **พอร์ทัลผู้พักอาศัย** (`user.html`)
พร้อม REST API + ฐานข้อมูล **MongoDB / SQLite** และ JWT auth

แอปทำงานได้ 2 โหมดอัตโนมัติ:

| โหมด | เมื่อไหร่ | ข้อมูลเก็บที่ |
|------|----------|----------------|
| **LIVE** | เสิร์ฟผ่าน Node server (เครื่องตัวเอง / Render) | **MongoDB** (ถ้าตั้ง `MONGODB_URI`) หรือ SQLite |
| **DEMO** | เปิดไฟล์ตรง ๆ / GitHub Pages (ไม่มี backend) | `localStorage` ในเบราว์เซอร์ |

แอปจะ "ตรวจ" `/api/health` ตอนเปิด ถ้าเจอ backend → LIVE, ถ้าไม่เจอ → DEMO

---

## ฐานข้อมูล — MongoDB หรือ SQLite (เลือกอัตโนมัติ)

| ตั้งค่า `MONGODB_URI` | ฐานข้อมูลที่ใช้ | ข้อมูลถาวรไหม |
|---|---|---|
| **ตั้งไว้** | **MongoDB** (เช่น MongoDB Atlas) | ✅ ถาวร — ไม่หายตอน redeploy |
| ไม่ตั้ง | SQLite (ไฟล์ `data/samrit.db`) | ⚠️ หายตอน Render free restart |

ระบบจะเช็ก `MONGODB_URI` ตอนเริ่ม ถ้ามี → ใช้ MongoDB, ถ้าไม่มี → SQLite
(ดูได้จาก `GET /api/health` ฟิลด์ `db`)

---

## 1) รันบนเครื่องตัวเอง (LIVE)

```bash
npm install

# ก) ใช้ SQLite (ไม่ต้องมี DB แยก — เหมาะลองเล่น)
npm start

# ข) ใช้ MongoDB
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/" npm start
# เปิด http://localhost:3000
```

บัญชีทดสอบ:
- **แอดมิน** — `admin / admin1234` (เจ้าหน้าที่: `staff1 / staff1234`, `finance1 / finance1234`)
- **ผู้พักอาศัย** — `demo / demo1234` (หรือกดสมัครสมาชิกใหม่)

> ต้องใช้ Node.js เวอร์ชัน **22.5 ขึ้นไป** (โหมด SQLite ใช้โมดูล `node:sqlite` ในตัว ไม่ต้องคอมไพล์ native)

### สร้าง MongoDB ฟรีด้วย MongoDB Atlas
1. สมัคร [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → สร้าง **Cluster ฟรี (M0)**
2. **Database Access** → สร้าง user/password
3. **Network Access** → Add IP `0.0.0.0/0` (อนุญาตทุกที่ — สำหรับ Render)
4. **Connect → Drivers** → คัดลอก connection string
   เช่น `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. เอาค่านี้ไปใส่เป็น `MONGODB_URI`

---

## 2) Deploy backend จริงขึ้นอินเทอร์เน็ต — Render (ฟรี)

1. Push repo นี้ขึ้น GitHub
2. ไปที่ [render.com](https://render.com) → **New → Blueprint** → เชื่อม repo
   (Render อ่านไฟล์ `render.yaml` ให้อัตโนมัติ)
3. **สำคัญ:** ใส่ตัวแปร **`MONGODB_URI`** ในหน้า dashboard (วาง connection string
   จาก MongoDB Atlas) → เพื่อให้ข้อมูล**ถาวร ไม่หายตอน redeploy**
4. กด **Apply / Deploy** → ได้ URL เช่น `https://samrit-residence.onrender.com`
   เปิด URL นั้นได้เลยทั้งแอดมินและผู้พักอาศัย (โหมด LIVE)

> ถ้า **ไม่ใส่** `MONGODB_URI` ระบบจะ fallback เป็น SQLite ซึ่งบนแพลนฟรีของ Render
> ดิสก์เป็นแบบชั่วคราว → ข้อมูลรีเซ็ตเมื่อ service restart (เหมาะแค่เดโม)

**ทางเลือกอื่น:** มี `Dockerfile` ให้แล้ว → deploy บน Railway / Fly.io / Cloud Run / VPS ได้

ตัวแปรแวดล้อม:
- `MONGODB_URI` — connection string ของ MongoDB (ถ้าใส่ = ใช้ MongoDB, ถ้าไม่ใส่ = SQLite)
- `MONGODB_DB` — ชื่อฐานข้อมูล (ค่าเริ่มต้น `samrit`)
- `JWT_SECRET` — คีย์เซ็น JWT (ตั้งให้เดายาก; Render generate ให้อัตโนมัติ)
- `PORT` — พอร์ต (ค่าเริ่มต้น 3000)
- `DATA_DIR` — ที่เก็บไฟล์ SQLite เมื่อใช้โหมด fallback (ค่าเริ่มต้น `./data`)

---

## 3) Deploy หน้าเว็บขึ้น GitHub Pages (โหมด DEMO — ลิงก์ฟรีทันที)

1. Push repo ขึ้น GitHub
2. ไปที่ **Settings → Pages → Source = "GitHub Actions"**
3. Workflow `.github/workflows/pages.yml` จะ deploy ให้อัตโนมัติทุกครั้งที่ push
   ได้ลิงก์เช่น `https://<user>.github.io/<repo>/`

หน้า Pages รันโหมด DEMO (ข้อมูลอยู่ในเบราว์เซอร์ของผู้เปิด)
**อยากให้ Pages คุยกับ backend จริง?** แก้ `app/config.js`:

```js
window.SAMRIT_API_BASE = "https://samrit-residence.onrender.com";
```

แล้ว push ใหม่ — หน้า Pages จะกลายเป็นโหมด LIVE (server เปิด CORS ไว้แล้ว)

---

## โครงสร้างโปรเจกต์

```
index.html              หน้าแรก (เลือกแอดมิน / ผู้พักอาศัย)
admin.html              ฝั่งแอดมิน (จัดการห้อง/ผู้เช่า/บิล/สัญญา/QR/สลิป/ผู้ใช้)
user.html               พอร์ทัลผู้พักอาศัย (ค้นหา/จอง/ชำระเงิน/ประวัติ/แจ้งซ่อม)
app/
  config.js             ตั้งค่า API_BASE
  api.js                API client (live + demo fallback)
server/
  server.js             Express: REST API + เสิร์ฟไฟล์ static
  db.js                 ชั้นข้อมูล MongoDB / SQLite (เลือกตาม MONGODB_URI) + seed
  auth.js               JWT (HS256) + scrypt password hashing
  seed.js               ข้อมูลตัวอย่าง
render.yaml             Render blueprint
Dockerfile              สำหรับ container hosts
.github/workflows/pages.yml   GitHub Pages (static demo)
```

## API หลัก

```
POST /api/auth/register        สมัครสมาชิก (ผู้พักอาศัย)
POST /api/auth/login           เข้าสู่ระบบ → { token, user }
GET  /api/me                   ข้อมูลผู้ใช้ปัจจุบัน
GET  /api/bootstrap            ข้อมูลทั้งหมด (แอดมิน/เจ้าหน้าที่)
GET  /api/me/bootstrap         ข้อมูลของผู้พักอาศัยคนนั้น
GET/POST/PUT/DELETE /api/coll/:collection[/:id]   CRUD (rooms, tenants, ...)
GET/PUT  /api/settings/:key    ตั้งค่า (paySettings, photos)
GET/POST/PUT/DELETE /api/users[/:id]              จัดการบัญชีเจ้าหน้าที่
```
