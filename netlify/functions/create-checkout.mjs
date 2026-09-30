import {config,json,stripeAuth} from './lib/config.mjs';
const prices={'The French':5500,'Bordeaux':5000,'White Glazed':6000,'Martini Society':9000};
const shorten=(value,max=450)=>String(value||'').slice(0,max);
export default async function(request){
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  if(Number(request.headers.get('content-length')||0)>20000)return json({error:'Order is too large'},413);
  const settings=config();if(!settings.enabled)return json({error:'Card checkout is being set up.'},503);
  try{
    const order=await request.json();
    if(!Array.isArray(order.items)||!order.items.length||order.items.length>10||!['coin','kit'].includes(order.sizing))throw Error('Invalid order');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email||'')||String(order.email).length>254||!String(order.name||'').trim()||String(order.name).length>100)throw Error('Please enter a valid name and email address.');
    const rate=settings.countries[order.country]?.[order.shipping];if(!rate)throw Error('Please choose a supported shipping method.');
    const lines=order.items.map(item=>{
      if(typeof item!=='object'||!item)return null;
      if(Object.hasOwn(prices,item.name))return {name:item.name,cents:prices[item.name],description:shorten(item.details,400)};
      if(item.name==='Custom press-on set'){
        const level=Number(item.level),length=String(item.length||'');
        if(![65,75,85,95].includes(level)||!['Short','Medium','Long','XL (+€5)'].includes(length))return null;
        return {name:'Custom press-on set',cents:level*100+(length.startsWith('XL')?500:0),description:shorten(item.details,400)};
      }
      return null;
    });
    if(lines.some(line=>!line))throw Error('Please refresh your bag and try again.');
    const form=new URLSearchParams();form.set('mode','payment');form.set('locale',order.language==='fr'?'fr':'en');form.set('allow_promotion_codes','true');form.set('customer_email',String(order.email).trim());form.set('payment_method_types[0]','card');form.set('billing_address_collection','auto');form.set('shipping_address_collection[allowed_countries][0]',order.country);
    const site=(process.env.SITE_URL||process.env.URL||'https://legendary-figolla-bf3f2e.netlify.app').replace(/\/$/,'');
    form.set('success_url',site+'/?session_id={CHECKOUT_SESSION_ID}#thanks');form.set('cancel_url',site+'/#bag');
    form.set('shipping_options[0][shipping_rate_data][type]','fixed_amount');form.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]',String(order.sizing==='kit'?rate.kitCents:rate.coinCents));form.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]','eur');form.set('shipping_options[0][shipping_rate_data][display_name]',rate.label);
    if(order.sizing==='kit')lines.push({name:'Try-on sizing kit',cents:400,description:'We will email you to collect the sizes you choose after trying on the kit.'});
    lines.forEach((line,i)=>{const base=`line_items[${i}]`;form.set(`${base}[price_data][currency]`,'eur');form.set(`${base}[price_data][unit_amount]`,String(line.cents));form.set(`${base}[price_data][product_data][name]`,line.name);if(line.description)form.set(`${base}[price_data][product_data][description]`,line.description);form.set(`${base}[quantity]`,'1')});
    form.set('metadata[customer_name]',shorten(order.name,100));form.set('metadata[sizing_method]',order.sizing);form.set('metadata[shipping_country]',order.country);form.set('metadata[shipping_method]',order.shipping);form.set('metadata[order_notes]',shorten(order.notes));
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{'Authorization':'Bearer '+stripeAuth(),'Content-Type':'application/x-www-form-urlencoded'},body:form});
    const session=await response.json();if(!response.ok||!session.url)throw Error('Payment could not be started. Please try again later.');
    return json({url:session.url});
  }catch(error){return json({error:['Invalid order','Please enter a valid name and email address.','Please choose a supported shipping method.','Please refresh your bag and try again.'].includes(error.message)?error.message:'Payment could not be started. Please try again later.'},400)}
}
