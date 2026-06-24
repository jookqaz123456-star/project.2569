# หอพักสัมฤทธิ์ — Samrit Residence

ระบบจัดการหอพัก: **ฝั่งแอดมิน** (`admin.html`) + **พอร์ทัลผู้พักอาศัย** (`user.html`)
พร้อม REST API + ฐานข้อมูล SQLite และ JWT auth

แอปทำงานได้ 2 โหมดอัตโนมัติ:

| โหมด | เมื่อไหร่ | ข้อมูลเก็บที่ |
|------|----------|----------------|
| **LIVE** | เสิร์ฟผ่าน Node server (เครื่องตัวเอง / Render) | ฐานข้อมูล SQLite จริง (ใช้ร่วมกันหลายเครื่อง) |
| **DEMO** | เปิดไฟล์ตรง ๆ / GitHub Pages (ไม่มี backend) | `localStorage` ในเบราว์เซอร์ |

แอปจะ "ตรวจ" `/api/health` ตอนเปิด ถ้าเจอ backend → LIVE, ถ้าไม่เจอ → DEMO

---

## 1) รันบนเครื่องตัวเอง (LIVE)

```bash
npm install
npm start
# เปิด http://localhost:3000
```

บัญชีทดสอบ:
- **แอดมิน** — `admin / admin1234` (เจ้าหน้าที่: `staff1 / staff1234`, `finance1 / finance1234`)
- **ผู้พักอาศัย** — `demo / demo1234` (หรือกดสมัครสมาชิกใหม่)

> ต้องใช้ Node.js เวอร์ชัน **22.5 ขึ้นไป** (ใช้โมดูล `node:sqlite` ในตัว ไม่ต้องคอมไพล์ native)

---

## 2) Deploy backend จริงขึ้นอินเทอร์เน็ต — Render (ฟรี)

1. Push repo นี้ขึ้น GitHub
2. ไปที่ [render.com](https://render.com) → **New → Blueprint** → เชื่อม repo
   (Render อ่านไฟล์ `render.yaml` ให้อัตโนมัติ)
3. กด **Apply / Deploy** → ได้ URL เช่น `https://samrit-residence.onrender.com`
   เปิด URL นั้นได้เลยทั้งแอดมินและผู้พักอาศัย (โหมด LIVE)

> แพลนฟรีของ Render มี filesystem แบบชั่วคราว ข้อมูล SQLite จะรีเซ็ตเมื่อ
> service restart — ถ้าต้องการให้ข้อมูลถาวร ให้ uncomment ส่วน `disk:` ใน
> `render.yaml` (ต้องใช้แพลนแบบเสียเงิน) หรือเปลี่ยนไปใช้ Postgres

**ทางเลือกอื่น:** มี `Dockerfile` ให้แล้ว → deploy บน Railway / Fly.io / Cloud Run / VPS ได้

ตัวแปรแวดล้อม:
- `JWT_SECRET` — คีย์เซ็น JWT (ตั้งให้เดายาก; Render generate ให้อัตโนมัติ)
- `PORT` — พอร์ต (ค่าเริ่มต้น 3000)
- `DATA_DIR` — ที่เก็บไฟล์ฐานข้อมูล (ค่าเริ่มต้น `./data`)

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
  db.js                 SQLite (node:sqlite) + seed ข้อมูลเริ่มต้น
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
