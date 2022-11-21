# Apply for a Veteran's ID card

This is the Alpha phase prototype of the Office for Veterans' Affairs (OVA)
"Apply for a Veteran's ID card" service.  It's built using the
[GOV.UK Prototype Kit](https://govuk-prototype-kit.herokuapp.com/docs)

## Getting started

1. Clone this repository & cd to the directory
1. Run `npm install`
1. Set environment variables in `.env`
1. Run `npm start`
1. Browse to [http://localhost:3000](http://localhost:3000)

The environment variables you need are:

- `NOTIFYAPIKEY`: An API key for [GOV.UK Notify](https://www.notifications.service.gov.uk/)
- `TEST_EMAIL_CARD_AND_DIGITAL_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_CARD_ONLY_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_DIGITAL_ONLY_TEMPLATE`: A template ID from GOV.UK Notify
- `TEST_EMAIL_UNHAPPY_PATH_TEMPLATE`: A template ID from GOV.UK Notify
- `ISSUER_BASE_URL`=https://oidc.integration.account.gov.uk
- `CLIENT_ID`=<CLIENT_ID> # Replace these values
- `CALLBACK_URL`=https://ova-alpha.london.cloudapps.digital/callback
- `CERT`="<CERT> # Replace these values"
- `RSA_PRIVATE_KEY`="<RSA_PRIVATE_KEY>" # Replace these values

The template IDs should correspond to email templates we've set up in our Notify acccount.
If you're just developing locally, you don't need the template IDs.  But the service will
fail to start -- even locally -- if `NOTIFYAPIKEY` is undefined. (This is a bug).

You can [read more about using GOV.UK Notify to prototype emails and text messages](docs/documentation/using-notify.md)

Changes merged into the `main` branch will automatically be deployed to GOV.UK PaaS.  You
can access the prototype at [https://ova-alpha.london.cloudapps.digital/](https://ova-alpha.london.cloudapps.digital/)

## Building the docker image

```shell
docker build . --tag veteranid-verify
```

## Starting docker

```shell
docker run -p 127.0.0.1:3000:3000/tcp -t veteranid-verify
```

## Connecting to docker

```shell
docker exec -it $(docker container ls  | grep 'veteranid-verify' | awk '{print $1}') bash
```
