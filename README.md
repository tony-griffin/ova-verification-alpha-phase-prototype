Apply for a Veteran's ID card
=============================

This is the Alpha phase prototype of the Office for Veterans' Affairs (OVA)
"Apply for a Veteran's ID card" service.  It's built using the
[GOV.UK Prototype Kit](https://govuk-prototype-kit.herokuapp.com/docs)

Getting started
---------------

1. Clone this repository & cd to the directory
2. Run `npm install`
3. Set environment variables in `.env`
4. Run `npm start`
5. Browse to http://localhost:3000

The environment variables you need are:

- `NOTIFYAPIKEY`: An API key for [GOV.UK Notify](https://www.notifications.service.gov.uk/)
- `TEST_EMAIL_CARD_AND_DIGITAL_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_CARD_ONLY_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_DIGITAL_ONLY_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_UNHAPPY_PATH_TEMPLATE`: A template ID from GOV.UK Notify

The template IDs should correspond to email templates we've set up in our Notify acccount.
If you're just developing locally, you don't need the template IDs.  But the service will
fail to start -- even locally -- if `NOTIFYAPIKEY` is undefined. (This is a bug).

Changes merged into the `main` branch will automatically be deployed to GOV.UK PaaS.  You
can access the prototype at https://ova-alpha.london.cloudapps.digital/
