// Vercel Node.js Function. All integration credentials remain server-side.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ok:false}); }
  const { GOOGLE_SCRIPT_URL, SHEETS_SHARED_SECRET, SITE_ORIGIN } = process.env;
  if (!GOOGLE_SCRIPT_URL || !SHEETS_SHARED_SECRET || !SITE_ORIGIN) return res.status(503).json({ok:false,error:'Service not configured'});
  if (req.headers.origin !== SITE_ORIGIN) return res.status(403).json({ok:false});
  if (!String(req.headers['content-type']||'').startsWith('application/json')) return res.status(415).json({ok:false});
  let body;
  try { body=typeof req.body==='string'?JSON.parse(req.body):req.body; } catch {return res.status(400).json({ok:false});}
  if (!body || JSON.stringify(body).length>8000 || body.website) return res.status(400).json({ok:false});
  const fields=['amount','purpose','firstName','lastName','email','phone','state','zip','employment','monthlyIncome','payFrequency'];
  const clean={};
  for(const field of fields){if(typeof body[field]!=='string'||!body[field].trim()||body[field].length>100)return res.status(400).json({ok:false});clean[field]=body[field].trim();}
  const allowed={amount:['250','500','1000','1500','2500','5000'],purpose:['Everyday expenses','Unexpected expense','Home or car repair','Medical expense','Other'],employment:['Employed','Self-employed','Retirement','Benefits','Other'],payFrequency:['Weekly','Every two weeks','Twice a month','Monthly','Other'],state:'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ')};
  if(Object.entries(allowed).some(([k,values])=>!values.includes(clean[k]))||body.consent!==true||!/^\S+@\S+\.\S+$/.test(clean.email)||!/^\d{5}$/.test(clean.zip)||!/^(1\d{10}|\d{10})$/.test(clean.phone.replace(/\D/g,''))||!/^\d{1,7}$/.test(clean.monthlyIncome)||Number(clean.monthlyIncome)>1000000)return res.status(400).json({ok:false,error:'Invalid inquiry'});
  try {
    const url=new URL(GOOGLE_SCRIPT_URL);if(url.protocol!=='https:'||url.hostname!=='script.google.com')throw new Error('Invalid configuration');
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:SHEETS_SHARED_SECRET,...clean,consent:true,consentVersion:'inquiry-v1'}),redirect:'follow',signal:AbortSignal.timeout(15000)});
    const result=await response.json();if(!response.ok||result.ok!==true)throw new Error('Upstream unavailable');
    return res.status(200).json({ok:true});
  } catch { return res.status(502).json({ok:false,error:'Unable to confirm submission'}); }
}
