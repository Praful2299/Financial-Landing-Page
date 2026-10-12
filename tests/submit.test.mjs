import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/submit.js';
const payload={amount:'1000',purpose:'Unexpected expense',firstName:'Test',lastName:'Applicant',email:'test@example.com',phone:'2025550123',state:'CA',zip:'90210',employment:'Employed',monthlyIncome:'3000',payFrequency:'Monthly',consent:true,website:''};
function response(){return{code:0,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;}};}
const request=body=>({method:'POST',headers:{origin:'https://example.com','content-type':'application/json'},body});
test('submission validation and upstream confirmation',async()=>{
 let res=response();await handler({method:'GET'},res);assert.equal(res.code,405);
 res=response();await handler(request(payload),res);assert.equal(res.code,503);
 process.env.GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/example/exec';process.env.SHEETS_SHARED_SECRET='test-secret';process.env.SITE_ORIGIN='https://example.com';
 for(const patch of [{consent:false},{amount:'999999'},{email:'bad'},{phone:'12'},{zip:'A1111'},{state:'XX'},{monthlyIncome:'-1'},{website:'bot.example'},{employment:'Invalid'}]){res=response();await handler(request({...payload,...patch}),res);assert.equal(res.code,400,JSON.stringify(patch));}
 res=response();await handler({...request(payload),headers:{origin:'https://evil.example','content-type':'application/json'}},res);assert.equal(res.code,403);
 const original=globalThis.fetch;
 try{
 let sent;
 globalThis.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>({ok:true})};};
 res=response();await handler(request({...payload,ssn:'should be discarded'}),res);assert.equal(res.code,200);assert.equal(sent.secret,'test-secret');assert.equal(sent.ssn,undefined);assert.equal(res.body.secret,undefined);
 globalThis.fetch=async()=>({ok:true,json:async()=>({ok:false})});res=response();await handler(request(payload),res);assert.equal(res.code,502);
 globalThis.fetch=async()=>{throw new Error('network');};res=response();await handler(request(payload),res);assert.equal(res.code,502);
 }finally{globalThis.fetch=original;}
});
