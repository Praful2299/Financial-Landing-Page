'use strict';
const config = window.FUNDING_CONFIG;
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid = document.querySelector('#offer-grid');
config.offers.slice(0,9).forEach((offer,i) => {
  let valid = false;
  try { valid = new URL(offer.url).protocol === 'https:'; } catch {}
  const card = document.createElement('article'); card.className = 'offer';
  card.innerHTML = `<div class="offer-header"><span class="provider-icon" aria-hidden="true">${['↗','◈','✦','⌁','◒','⊞','◇','↗','✳'][i]}</span><span class="offer-number">${String(i+1).padStart(2,'0')} / PARTNER</span></div><h3>${escapeHTML(offer.name)}</h3><p>${escapeHTML(offer.description)}</p><div class="offer-footer"><span>${escapeHTML(offer.category)}</span>${valid ? `<a href="${escapeHTML(offer.url)}" target="_blank" rel="sponsored noopener noreferrer">View provider ↗</a>` : '<span class="pending">Coming soon ↗</span>'}</div>`;
  grid.append(card);
});
if (config.offers.every(o=>o.url)) document.querySelector('.preview-label').textContent='Explore partner providers';
document.querySelector('#year').textContent=new Date().getFullYear();
const modal=document.querySelector('#application'), form=document.querySelector('#inquiry'), content=document.querySelector('#step-content'), status=document.querySelector('#form-status');
let step=0, busy=false, finished=false;
const data={amount:'1000',purpose:'',firstName:'',lastName:'',email:'',phone:'',state:'',zip:'',employment:'',monthlyIncome:'',payFrequency:'',consent:false};
const states='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
const options=(values,selected)=>'<option value="">Select an option</option>'+values.map(v=>`<option value="${escapeHTML(v)}" ${v===selected?'selected':''}>${escapeHTML(v)}</option>`).join('');
const input=(name,label,type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" value="${escapeHTML(data[name])}" required maxlength="100" ${extra}></label>`;
function remember(){for(const [key,value] of new FormData(form)){if(key in data)data[key]=value;}const check=form.querySelector('[name="consent"]');if(check)data.consent=check.checked;}
function render(){
 status.textContent='';document.querySelector('#step-count').textContent=`STEP ${step+1} OF 4`;
 document.querySelector('#progress-fill').style.width=`${(step+1)*25}%`;
 document.querySelector('.back').style.visibility=step?'visible':'hidden';
 document.querySelector('#next').textContent=step===3?'Submit inquiry ↗':'Continue →';
 if(step===0)content.innerHTML=`<h2>What would help you move forward?</h2><p class="subtext">Choose an amount to start. This is a preference, not an available offer.</p><label>Preferred amount</label><div class="amounts">${['250','500','1000','1500','2500','5000'].map(n=>`<button type="button" data-amount="${n}" aria-pressed="${data.amount===n}" class="${data.amount===n?'selected':''}">$${Number(n).toLocaleString('en-US')}</button>`).join('')}</div><label>What would you use it for?<select name="purpose" required>${options(['Everyday expenses','Unexpected expense','Home or car repair','Medical expense','Other'],data.purpose)}</select></label>`;
 if(step===1)content.innerHTML=`<h2>Let’s get acquainted.</h2><p class="subtext">Add your contact information and location.</p><div class="fields">${input('firstName','First name','text','autocomplete="given-name"')}${input('lastName','Last name','text','autocomplete="family-name"')}</div>${input('email','Email address','email','autocomplete="email"')}${input('phone','US phone number','tel','autocomplete="tel"')}<div class="fields"><label>State<select name="state" autocomplete="address-level1" required>${options(states,data.state)}</select></label>${input('zip','ZIP code','text','autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}"')}</div>`;
 if(step===2)content.innerHTML=`<h2>A little about your budget.</h2><p class="subtext">These details help describe your situation. Do not enter bank account numbers, passwords, or Social Security information.</p><label>Primary earnings source<select name="employment" required>${options(['Employed','Self-employed','Retirement','Benefits','Other'],data.employment)}</select></label>${input('monthlyIncome','Approximate monthly earnings ($)','number','min="0" max="1000000" step="1" inputmode="numeric"')}<label>How often do you receive earnings?<select name="payFrequency" required>${options(['Weekly','Every two weeks','Twice a month','Monthly','Other'],data.payFrequency)}</select></label>`;
 if(step===3)content.innerHTML=`<h2>Take one last look.</h2><p class="subtext">Review your information. You can go back to make changes.</p><dl>${[['Preferred amount','$'+Number(data.amount).toLocaleString('en-US')],['Purpose',data.purpose],['Name',data.firstName+' '+data.lastName],['Email',data.email],['Phone',data.phone],['Location',data.state+' '+data.zip],['Earnings source',data.employment],['Monthly earnings','$'+Number(data.monthlyIncome).toLocaleString('en-US')],['Frequency',data.payFrequency]].map(([k,v])=>`<div><dt>${k}</dt><dd>${escapeHTML(v)}</dd></div>`).join('')}</dl><label class="check"><input type="checkbox" name="consent" required ${data.consent?'checked':''}><span>I confirm I am at least 18, have read the <button type="button" class="legal-link" data-policy="privacy">Privacy notice</button> and <button type="button" class="legal-link" data-policy="terms">Terms</button>, and consent to Funding Empire storing these details and contacting me about this inquiry. This is not consent to marketing texts or automated calls.</span></label>`;
 content.querySelectorAll('[data-amount]').forEach(b=>b.addEventListener('click',()=>{remember();data.amount=b.dataset.amount;render();content.querySelector(`[data-amount="${data.amount}"]`).focus();}));
 content.querySelectorAll('[data-policy]').forEach(bindPolicy);
 if(config.submissionEnabled)document.querySelector('.form-foot').textContent='An inquiry does not guarantee a match, approval, or funding.';
}
document.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>{if(!finished)render();modal.showModal();}));
document.querySelectorAll('dialog .close').forEach(b=>b.addEventListener('click',()=>{if(!busy)b.closest('dialog').close();}));
modal.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
document.querySelector('.back').addEventListener('click',()=>{remember();step=Math.max(0,step-1);render();});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||finished)return;if(!form.reportValidity())return;remember();
 if(step===1 && !/^(1\d{10}|\d{10})$/.test(data.phone.replace(/\D/g,''))){status.textContent='Enter a valid 10-digit US phone number, with optional country code 1.';return;}
 if(step<3){step++;render();content.querySelector('h2').setAttribute('tabindex','-1');content.querySelector('h2').focus();return;}
 if(!config.submissionEnabled){status.textContent='Preview complete. Nothing has been sent or saved. Live submissions will be available once Funding Empire connects its inquiry service.';return;}
 busy=true;const button=document.querySelector('#next');button.disabled=true;document.querySelector('.back').disabled=true;button.textContent='Submitting…';status.textContent='';
 try{
 const response=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,website:form.elements.website.value}),signal:AbortSignal.timeout(20000)});
 const result=await response.json();if(!response.ok||!result.ok)throw new Error('Submission unavailable');
 finished=true;content.innerHTML='<h2>Your inquiry was received.</h2><p class="subtext">Your details have been saved for Funding Empire to review. This is not an approval or a funding confirmation.</p>';document.querySelector('.form-actions').hidden=true;document.querySelector('.form-foot').textContent='You can close this window.';Object.keys(data).forEach(k=>data[k]='');form.reset();
 }catch{status.textContent='We could not confirm your submission. Your details are still in this window; try again shortly.';button.disabled=false;button.textContent='Try again ↗';document.querySelector('.back').disabled=false;}finally{busy=false;}
});
const policies={
 privacy:['Privacy notice — preview','This preview does not submit or persist inquiry data. Form entries stay in this page’s memory until you reload or close it. No advertising trackers are installed. Google Fonts and the hosting provider may receive standard technical request data.','When live submission is enabled, the details you provide will be sent through the site’s server to a private Google Sheet controlled by the operator for inquiry follow-up. They are not automatically sent to affiliate providers. Partner websites have separate privacy policies.','Before launch, the operator must replace this notice with its legal business name, privacy contact, retention period, deletion process, and actual data-sharing practices. This preview is not accepting live inquiries.'],
 terms:['Terms of use — preview','Funding Empire is a connection service, not a lender. The directory is informational. No listing or inquiry guarantees a match, approval, funding, or particular costs.','This preview contains unconfigured affiliate placements. Any future provider agreement will be between you and that provider. Review eligibility, fees, APR, and repayment obligations before agreeing. This experience is intended for US adults aged 18 or older.','Before launch, the operator must supply its legal entity, contact details, service availability, and final terms.'],
 disclosure:['Affiliate and lending disclosure','Funding Empire may receive compensation for referrals or qualifying actions through affiliate links. Compensation may influence the order of listings. The directory does not cover every provider and is not an independent ranking.','Funding Empire does not issue loans or determine credit decisions, costs, or repayment schedules. Short-term borrowing can be expensive. Consider alternatives and borrow only after evaluating the full repayment obligation.']};
function bindPolicy(b){b.addEventListener('click',()=>{const [title,...paragraphs]=policies[b.dataset.policy];document.querySelector('#policy-content').innerHTML=`<h2>${title}</h2>${paragraphs.map(p=>`<p>${p}</p>`).join('')}`;document.querySelector('#policy').showModal();});}
document.querySelectorAll('[data-policy]').forEach(bindPolicy);
