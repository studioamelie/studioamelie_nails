import {json,stripeAuth} from './lib/config.mjs';
export default async function(request){
  const id=new URL(request.url).searchParams.get('session_id');if(!/^cs_(test_|live_)[A-Za-z0-9]{10,}$/.test(id||''))return json({error:'Invalid session'},400);
  try{const response=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(id),{headers:{'Authorization':'Bearer '+stripeAuth()}});if(!response.ok)return json({error:'Session unavailable'},404);const session=await response.json();return json({paid:session.payment_status==='paid'})}catch{return json({error:'Status unavailable'},503)}
}
