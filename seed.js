// ─── PromptPay QR helper ───────────────────────────────────────
// Builds a real, scannable Thai PromptPay (EMVCo) QR payload and renders it.
// When an amount is supplied the QR is a "dynamic" code that opens in the
// payer's banking app with the exact amount pre-filled — so each room/bill
// gets its own QR with its own total.
//
// Depends on the global `qrcode` (app/qrcode.js, Kazuhiko Arase, MIT).
(function () {
  function tlv(id, value) {
    const len = String(value).length.toString().padStart(2, '0');
    return id + len + value;
  }
  // CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) over the payload incl. "6304".
  function crc16(s) {
    let crc = 0xFFFF;
    for (let i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = ((crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  // A PromptPay target is a mobile number (10 digits) or a national/tax id (13 digits).
  function targetField(target) {
    const d = String(target || '').replace(/[^0-9]/g, '');
    if (d.length >= 13) return tlv('02', d.slice(0, 13));
    const mobile = ('66' + d.replace(/^0/, '')).padStart(13, '0');
    return tlv('01', mobile);
  }
  // Build the EMVCo payload string. amount = null/undefined → static (reusable) QR.
  function payload(target, amount) {
    const merchant = tlv('29', tlv('00', 'A000000677010111') + targetField(target));
    let s = tlv('00', '01') + tlv('01', amount != null ? '12' : '11') + merchant + tlv('58', 'TH') + tlv('53', '764');
    if (amount != null) s += tlv('54', Number(amount).toFixed(2));
    s += '6304';
    return s + crc16(s);
  }
  // Return an <svg> string (black on white) for the given target + amount.
  function svg(target, amount, px) {
    px = px || 160;
    const data = payload(target, amount);
    if (typeof qrcode === 'undefined') return '';
    const qr = qrcode(0, 'M');           // type 0 = auto-fit, error correction M
    qr.addData(data);
    qr.make();
    const n = qr.getModuleCount();
    const cell = px / n;
    let rects = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) rects += `<rect x="${(c * cell).toFixed(2)}" y="${(r * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
    }
    return `<svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg"><rect width="${px}" height="${px}" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
  }
  window.PromptPay = { payload, svg };
})();
