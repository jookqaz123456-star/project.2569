// ─── Seed data for ระบบจัดการหอพักสัมฤทธิ์ ───────────────────
// Used to populate the SQLite database on first run.

const rooms = [
  {id:'r1',number:1,floor:3,type:'ห้องเดี่ยว',price:3500,status:'occupied',tenantId:'t1',size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r2',number:2,floor:3,type:'ห้องเดี่ยว',price:3500,status:'vacant',tenantId:null,size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r3',number:3,floor:3,type:'ห้องเดี่ยว',price:4500,status:'occupied',tenantId:'t2',size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r4',number:4,floor:3,type:'ห้องเดี่ยว',price:4500,status:'repair',tenantId:null,size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r5',number:5,floor:2,type:'ห้องเดี่ยว',price:3500,status:'occupied',tenantId:'t3',size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r6',number:6,floor:2,type:'ห้องเดี่ยว',price:3500,status:'vacant',tenantId:null,size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r7',number:7,floor:2,type:'ห้องเดี่ยว',price:4500,status:'occupied',tenantId:'t4',size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r8',number:8,floor:2,type:'ห้องเดี่ยว',price:4500,status:'occupied',tenantId:'t5',size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r9',number:9,floor:1,type:'ห้องเดี่ยว',price:3500,status:'vacant',tenantId:null,size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r10',number:10,floor:1,type:'ห้องเดี่ยว',price:3500,status:'occupied',tenantId:'t6',size:'28 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r11',number:11,floor:1,type:'ห้องเดี่ยว',price:4500,status:'occupied',tenantId:'t7',size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
  {id:'r12',number:12,floor:1,type:'ห้องเดี่ยว',price:4500,status:'vacant',tenantId:null,size:'35 ตร.ม.',facilities:['ตู้เสื้อผ้า','เครื่องปรับอากาศ','Wi-Fi','เตียง'],photos:[]},
];

const tenants = [
  {id:'t1',name:'สมชาย ใจดี',phone:'081-234-5678',idcard:'1-1234-56789-01-2',roomId:'r1',checkin:'2025-01-01',checkout:'2025-12-31',deposit:7000},
  {id:'t2',name:'วิภา รักษ์สุข',phone:'082-345-6789',idcard:'1-2345-67890-12-3',roomId:'r3',checkin:'2025-02-01',checkout:'2026-01-31',deposit:9000},
  {id:'t3',name:'ประสิทธิ์ มั่นคง',phone:'083-456-7890',idcard:'1-3456-78901-23-4',roomId:'r5',checkin:'2025-03-01',checkout:'2026-02-28',deposit:7000},
  {id:'t4',name:'นภา สวรรค์',phone:'084-567-8901',idcard:'1-4567-89012-34-5',roomId:'r7',checkin:'2025-01-15',checkout:'2025-12-14',deposit:9000},
  {id:'t5',name:'อภิชาติ ดวงดี',phone:'085-678-9012',idcard:'1-5678-90123-45-6',roomId:'r8',checkin:'2025-04-01',checkout:'2026-03-31',deposit:9000},
  {id:'t6',name:'สุดา พรเจริญ',phone:'086-789-0123',idcard:'1-6789-01234-56-7',roomId:'r10',checkin:'2025-05-01',checkout:'2026-04-30',deposit:7000},
  {id:'t7',name:'ธนากร ศรีสุข',phone:'087-890-1234',idcard:'1-7890-12345-67-8',roomId:'r11',checkin:'2025-06-01',checkout:'2026-05-31',deposit:9000},
  {id:'t8',name:'มาลี รุ่งเรือง',phone:'088-901-2345',idcard:'1-8901-23456-78-9',roomId:null,checkin:'',checkout:'',deposit:0},
];

const bookings = [
  {id:'b1',userId:null,name:'อนันต์ ชัยชนะ',phone:'089-111-2222',roomId:'r2',roomNumber:2,date:'2026-06-25',status:'รอยืนยัน',createdAt:'2026-06-12',slip:'',amount:2000},
  {id:'b2',userId:null,name:'กมลา สุขใจ',phone:'089-222-3333',roomId:'r6',roomNumber:6,date:'2026-07-01',status:'ยืนยันแล้ว',createdAt:'2026-06-10',slip:'',amount:2000},
  {id:'b3',userId:null,name:'วิรัตน์ แก้วใส',phone:'089-333-4444',roomId:'r9',roomNumber:9,date:'2026-06-20',status:'ยกเลิก',createdAt:'2026-06-05',slip:'',amount:2000},
  {id:'b4',userId:null,name:'ลัดดา หอมหวาน',phone:'089-444-5555',roomId:'r12',roomNumber:12,date:'2026-07-10',status:'รอยืนยัน',createdAt:'2026-06-15',slip:'',amount:2000},
];

const contracts = [
  {id:'c1',tenantId:'t1',tenantName:'สมชาย ใจดี',roomId:'r1',roomNumber:1,start:'2025-01-01',end:'2025-12-31',rent:3500,status:'active',signed:true,signature:'data:'},
  {id:'c2',tenantId:'t2',tenantName:'วิภา รักษ์สุข',roomId:'r3',roomNumber:3,start:'2025-02-01',end:'2026-01-31',rent:4500,status:'active',signed:true,signature:'data:'},
  {id:'c3',tenantId:'t3',tenantName:'ประสิทธิ์ มั่นคง',roomId:'r5',roomNumber:5,start:'2025-03-01',end:'2026-02-28',rent:3500,status:'active',signed:false,signature:''},
  {id:'c4',tenantId:'t4',tenantName:'นภา สวรรค์',roomId:'r7',roomNumber:7,start:'2025-01-15',end:'2025-12-14',rent:4500,status:'active',signed:true,signature:'data:'},
  {id:'c5',tenantId:'t5',tenantName:'อภิชาติ ดวงดี',roomId:'r8',roomNumber:8,start:'2025-04-01',end:'2026-03-31',rent:4500,status:'active',signed:false,signature:''},
];

const payments = [
  {id:'p1',roomId:'r1',roomNumber:1,tenantName:'สมชาย ใจดี',month:'2026-05',rent:3500,waterUnit:8,electricUnit:45,internet:300,other:0,status:'paid',date:'2026-05-05',method:'โอนเงิน'},
  {id:'p2',roomId:'r3',roomNumber:3,tenantName:'วิภา รักษ์สุข',month:'2026-05',rent:4500,waterUnit:10,electricUnit:60,internet:300,other:0,status:'paid',date:'2026-05-03',method:'เงินสด'},
  {id:'p3',roomId:'r5',roomNumber:5,tenantName:'ประสิทธิ์ มั่นคง',month:'2026-05',rent:3500,waterUnit:7,electricUnit:50,internet:300,other:0,status:'unpaid',date:'',method:''},
  {id:'p4',roomId:'r7',roomNumber:7,tenantName:'นภา สวรรค์',month:'2026-05',rent:4500,waterUnit:9,electricUnit:55,internet:300,other:0,status:'paid',date:'2026-05-07',method:'โอนเงิน'},
  {id:'p5',roomId:'r8',roomNumber:8,tenantName:'อภิชาติ ดวงดี',month:'2026-05',rent:4500,waterUnit:11,electricUnit:65,internet:300,other:100,status:'unpaid',date:'',method:''},
  {id:'p6',roomId:'r10',roomNumber:10,tenantName:'สุดา พรเจริญ',month:'2026-05',rent:3500,waterUnit:6,electricUnit:40,internet:300,other:0,status:'paid',date:'2026-05-04',method:'เงินสด'},
  {id:'p7',roomId:'r11',roomNumber:11,tenantName:'ธนากร ศรีสุข',month:'2026-05',rent:4500,waterUnit:12,electricUnit:70,internet:300,other:200,status:'overdue',date:'',method:''},
];

// Resident-facing bills (linked to a resident account by userId)
const bills = [
  {id:'bl1',userId:'demo',roomNumber:6,month:'2026-05',rent:3500,waterUnit:8,electricUnit:45,internet:300,status:'paid',date:'2026-05-05',slip:''},
  {id:'bl2',userId:'demo',roomNumber:6,month:'2026-06',rent:3500,waterUnit:9,electricUnit:50,internet:300,status:'unpaid',date:'',slip:''},
];

const stays = [
  {id:'s1',userId:'demo',roomNumber:3,checkin:'2024-06-01',checkout:'2025-05-31',note:'ออกห้องปกติ'},
  {id:'s2',userId:'demo',roomNumber:6,checkin:'2025-06-01',checkout:null,note:'ปัจจุบัน'},
];

const repairs = [
  {id:'rp1',userId:'demo',roomNumber:6,issue:'ก๊อกน้ำรั่ว',date:'2026-06-10',status:'กำลังดำเนินการ'},
  {id:'rp2',userId:'demo',roomNumber:6,issue:'หลอดไฟห้องน้ำดับ',date:'2026-06-01',status:'เสร็จสิ้น'},
];

const slips = [];

// System users (admin/staff) — passwords are seeded plaintext here and hashed on insert
const staffUsers = [
  {id:'u1',name:'ผู้ดูแลระบบ',username:'admin',password:'admin1234',role:'admin',perms:['จัดการห้อง','จัดการผู้เช่า','การเงิน','รายงาน','จัดการผู้ใช้','ดูบิล','ชำระเงิน','เซ็นสัญญา'],active:true},
  {id:'u2',name:'สมศรี พนักงาน',username:'staff1',password:'staff1234',role:'staff',perms:['จัดการห้อง','จัดการผู้เช่า','ดูบิล'],active:true},
  {id:'u3',name:'วรรณา การเงิน',username:'finance1',password:'finance1234',role:'staff',perms:['การเงิน','ดูบิล','ชำระเงิน'],active:true},
  {id:'u4',name:'นิพนธ์ ทดสอบ',username:'test1',password:'test1234',role:'staff',perms:['ดูบิล'],active:false},
];

// Resident accounts
const residents = [
  {id:'demo',name:'นายตัวอย่าง ผู้ใช้',username:'demo',password:'demo1234',role:'resident',email:'demo@example.com',phone:'089-000-0000'},
];

const paySettings = {
  promptpay:'089-000-0000',
  qr:'',
  banks:[
    {bank:'ธนาคารกสิกรไทย',acc:'XXX-X-XXXXX-X',holder:'(นาย/นาง XXXXX)'},
    {bank:'ธนาคารไทยพาณิชย์',acc:'XXX-X-XXXXX-X',holder:'(นาย/นาง XXXXX)'},
  ],
};

module.exports = { rooms, tenants, bookings, contracts, payments, bills, stays, repairs, slips, staffUsers, residents, paySettings };
