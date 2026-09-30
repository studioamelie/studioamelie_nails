# Studio Amélie — card checkout setup

This project includes a checkout form and Netlify Functions that create Stripe-hosted card payments. The checkout remains disabled until the required configuration is supplied. No card numbers or Stripe keys belong in the HTML or this ZIP.

## 1. Set up Stripe

Create a Stripe account in your own name or your registered business details and complete its account verification. In Stripe's payout settings, add the **bank account/IBAN** that should receive payouts. A personal debit or credit card number is not the payout destination for this checkout.

In Stripe, turn on customer email receipts for successful payments and account email notifications for successful payments. Set your business email as the destination for your Stripe notifications. These are Stripe emails; the site does not send a custom order email by itself. Paid orders, shipping addresses and their notes appear in your Stripe Dashboard. You must email each customer to obtain coin photos or the sizes from their kit before making the set.

## 2. Provide real shipping prices

Decide which methods you offer in France (FR), Spain (ES), and the UK (GB). For every method, decide the price in euro cents when a customer uses coin photos (`coinCents`) and the combined cost of shipping the sizing kit and the finished set separately (`kitCents`). For example, a price of €5.50 is `550`. Set only the countries and methods you actually offer.

In your existing Netlify project, add these **environment variables** for Functions:

- `STRIPE_SECRET_KEY`: your Stripe secret key. Start with a test key; switch to your live key only when ready to sell.
- `SHIPPING_RATES_EUR_JSON`: one JSON object in the shape shown below, replacing every `0` with your real prices. The sample zero values are a format example, not suggested shipping prices. Do not activate payments with zero rates unless shipping really is free.
- `SITE_URL`: `https://legendary-figolla-bf3f2e.netlify.app` (or your final domain).

```json
{"FR":{"standard":{"label":"Tracked shipping","coinCents":0,"kitCents":0}},"ES":{"standard":{"label":"Tracked shipping","coinCents":0,"kitCents":0}},"GB":{"standard":{"label":"Tracked shipping","coinCents":0,"kitCents":0}}}
```

Add another method such as `express` under a country only if you actually offer it and know both prices. Countries omitted from this JSON are disabled in checkout.

## 3. Deploy source with Netlify Functions

This ZIP is source code, not a static drag-and-drop site. Unzip it and upload the contents together. Connect this folder to your **existing** Netlify project through GitHub and deploy it with Netlify's build system, or use Netlify CLI to deploy to that project. Keep `netlify.toml`, `netlify/functions/`, `index.html`, and `images/` together. Static drag-and-drop publishing alone does not build these payment functions.

The old launch coupon banner has been removed because no coupon is configured. Stripe Checkout can accept a promotion code if you create one in Stripe later. Test a purchase using Stripe test mode first. Check the order appears in Stripe with its shipping address, name, email, sizing method and notes. Confirm your receipt and merchant email notification settings. Only then add the live secret key and publish the payment flow.

### Order handling

If a buyer chooses coin photos, email them for clear photos of both hands with a €1 or £1 coin on the same flat surface. This method is an estimate. If they choose the €4 sizing kit, ship it and ask them to email their chosen nail size for each finger. The displayed delivery periods of about four days for the kit and another four days for the set after sizes are received are estimates, not guaranteed arrival dates.
