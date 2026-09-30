export const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export function config(){
  let parsed={};try{parsed=JSON.parse(process.env.SHIPPING_RATES_EUR_JSON||'{}')}catch{}
  const countries={};for(const country of ['FR','ES','GB']){
    const methods=parsed[country];if(!methods||typeof methods!=='object')continue;
    countries[country]={};for(const [code,rate] of Object.entries(methods)){
      if(!/^[a-z0-9_-]{1,30}$/.test(code)||!rate||typeof rate.label!=='string'||rate.label.length>50)continue;
      const coinCents=Number(rate.coinCents),kitCents=Number(rate.kitCents);
      if([coinCents,kitCents].every(n=>Number.isInteger(n)&&n>=0&&n<=20000))countries[country][code]={label:rate.label,coinCents,kitCents};
    }
  }
  return {enabled:Boolean(process.env.STRIPE_SECRET_KEY)&&Object.values(countries).some(methods=>Object.keys(methods).length),countries};
}
export function stripeAuth(){const key=process.env.STRIPE_SECRET_KEY;if(!key)throw Error('Stripe is not configured');return key}
