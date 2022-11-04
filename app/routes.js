const utils = require('../lib/utils.js')
const env = utils.getNodeEnv()
const NotifyClient = require('notifications-node-client').NotifyClient
const notify = new NotifyClient(process.env.NOTIFYAPIKEY)
const express = require('express')
const router = express.Router()
// Add your routes here - above the module.exports line
const passport = require('passport')
const { Issuer, Strategy, generators, custom } = require('openid-client')
const rsaPemToJwk = require('rsa-pem-to-jwk')
const { v4: uuidv4 } = require('uuid')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const credential_issuer = (typeof process.env.CREDENTIAL_ISSUER_URL === 'undefined') ?
  "https://identity.integration.account.gov.uk/" : process.env.CREDENTIAL_ISSUER_URL

const {
  // These are needed when we are NOT using Identity Proofing and Verification
  getFakeDIClaimResponse
} = require('./assets/javascripts/fakeDIClaimJWT')

const {
  // These are needed when we are NOT using Identity Proofing and Verification
  getClaimNames,
  getPreviousNames
} = require('./assets/javascripts/getClaimNames')

const {
  regexUkMobileNumber
} = require('./assets/javascripts/regexUkMobileNumber')

const { regexUkPostcode } = require('./assets/javascripts/regexUkPostcodes')

const {
  removeStringWhiteSpace
} = require('./assets/javascripts/removeStringWhiteSpace')

const rsa_private_key = process.env.RSA_PRIVATE_KEY
const jwk = rsaPemToJwk(rsa_private_key, { kid: '2022-06-ova-alpha', use: 'sig' }, 'private')

Issuer.discover(process.env.ISSUER_BASE_URL).then(issuer => {

  const client = new issuer.FAPI1Client({
    client_id: process.env.CLIENT_ID,
    redirect_uris: [process.env.CALLBACK_URL],
    response_types: ['code'],
    token_endpoint_auth_method: 'private_key_jwt',
    id_token_signed_response_alg: 'ES256' // Great Caesar's ghost! It was this.
  }, {
    keys: [jwk]
  })

  client[custom.http_options] = function () {
    const result = {}
    result.cert = process.env.CERT
    result.key = process.env.RSA_PRIVATE_KEY
    return result
  }

  router.use(passport.initialize())
  router.use(passport.session())

  const vtr = ["P2.Cl.Cm"] // https://govukverify.atlassian.net/browse/AUT-771
  const claims = {
    userinfo: {
      "https://vocab.account.gov.uk/v1/coreIdentityJWT": {
          essential: true
      }
    }
  }

  passport.use(
    'oidc',
    new Strategy({
      client,
      params: {
        scope: 'openid email phone',
        nonce: generators.nonce(),
        vtr: JSON.stringify(vtr),
        claims: JSON.stringify(claims),
      },
      passReqToCallback: true,
      sessionKey: 'data'
    }, (req, tokenset, userinfo, done) => {

      const core_id_jwt = userinfo["https://vocab.account.gov.uk/v1/coreIdentityJWT"]

      if (!core_id_jwt) {
        // I doubt this is necessary. We said this claim was 'essential'
        let errorstring = 'coreIdentityJWT not present.'
        console.log(errorstring)
        return done(`${errorstring}. This means we could not prove your identity.`)
      }

      const verification_options = {
        algorithms: ["ES256"],
        issuer: credential_issuer,
        subject: userinfo.sub,
      }
      const pubkey = process.env.SPOT_PUBLIC_KEY

      jwt.verify(core_id_jwt, pubkey, verification_options, (err, decoded) => {
        if (err) {
          return done(`Could not validate coreIdentityJWT: ${err}`)
        } else {
          userinfo.core_identity = decoded // so the "profile" page can parse it
          return done(null, userinfo)
        }
      })
    })
  )

  router.get('/login', (req, res, next) => {
    passport.authenticate('oidc')(req, res, next)
  })

  router.get('/callback', (req, res, next) => {
    passport.authenticate('oidc', {
      successRedirect: '/profile',
      successMessage: true,
      failureRedirect: '/ipv_fail',
      failureMessage: true
    })(req, res, next)
  })

  router.use((req, res, next) => {
    if (env === "development") {
      res.locals.user = {
        sub: "urn:fdc:gov.uk:2022:56P4CMsGh_02YOlWpd8PAOI-2sVlB2nsNU7mcLZYhYw=",
        email: "sandy@example.com",
        email_verified: true,
        phone_number: "+447700900451",
        phone_number_verified: true,
      }
      res.locals.user.core_identity = getFakeDIClaimResponse('1975')
    } else {
      res.locals.user = req.user
    }
    next()
  })

  passport.serializeUser(function (user, cb) {
    cb(null, user)
  })

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj)
  })
})

router.post('/start_veteran_apply_choice', function (req, res) {
  const answer = req.session.data.start_veteran_match_status

  if (!answer) {
    const error = { text: "Select 'happy path', 'unhappy path' or 'Test GOV.UK Sign In IPV'" }
    return res.render('index', { error })
  }

  if (answer === 'Fail') {
    req.session.data.set_unhappy_path = true
  }

  if (answer === 'IPV') {
    req.session.data.test_ipv = true
  }

  res.redirect('/start_veteran_apply')
})

router.post('/eligibility_one', function (req, res) {
  const formermember = req.body['former-member']

  if (!formermember) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('eligibility_one', { error }) // relative URL, for reasons unknown
  }

  if (formermember === 'no') {
    res.redirect('/ineligible')
  } else {
    res.redirect('/eligibility_two')
  }
})

router.post('/eligibility_two', function (req, res) {
  const ukresident = req.body['uk-resident']

  if (!ukresident) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('eligibility_two', { error })
  }

  if (ukresident === 'no') {
    res.redirect('/ineligible_non_resident')
  } else {

    if (req.session.data.test_ipv === true) {
      res.redirect('/login')
    } else {
      // We need fake Digital Identity data
      const birthYear = req.session.data.birth_year_number

      // Identity claim set up
      const distinctClaimNames = getClaimNames(getFakeDIClaimResponse(birthYear)) // All the names

      // Set up session storage for current & previous names
      req.session.data.current_DI_name = distinctClaimNames[0]
      const previousNames = getPreviousNames(distinctClaimNames)
      req.session.data.previous_DI_names = previousNames

      previousNames.forEach((name, index) => {
        req.session.data[`previous_DI_name_${index + 1}`] = name
      })

      res.redirect('/govuk_create_or_sign_in')
    }
  }
})

router.post('/question_email_address_input', function (req, res) {
  const email = req.session.data.question_email_address
  const previousApplicationEmail = req.session.data.previous_application_email

  if (!email) {
    const error = { text: 'Enter your email address' }
    return res.render('question_email_address', { error })
  }

  if (
    email &&
    validator.isEmail(email) &&
    previousApplicationEmail.toString() === email
  ) {
    res.redirect('/govuk_previous_application_email')
  }

  if (email && validator.isEmail(email)) {
    res.redirect('/govuk_create_check_email')
  } else {
    const error = { text: 'Enter a valid email address' }
    return res.render('question_email_address', { error })
  }
})

router.post('/question_name_from_identity_claim_choice', function (req, res) {
  const nameChoice = req.session.data.name_at_discharge

  if (!nameChoice) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_name_from_identity_claim', { error })
  }

  if (nameChoice === 'Yes') {
    req.session.data.name_at_discharge = req.session.data.current_DI_name

    if (req.session.data.set_unhappy_path !== true) {
      req.session.data.start_veteran_match_status = 'Success'
    }
    res.redirect('/question_service_number')
  }

  if (nameChoice === 'No') {
    // Matching set to fail - manual check required
    req.session.data.start_veteran_match_status = 'Fail'
    res.redirect('/question_name_at_discharge')
  }
})

router.post('/question_name_at_discharge_input', function (req, res) {
  const firstName = req.session.data.first_name_at_discharge
  const lastName = req.session.data.last_name_at_discharge

  if (!firstName) {
    const firstNameError = { text: 'Enter your first name' }
    return res.render('question_name_at_discharge', { firstNameError })
  }

  if (!lastName) {
    const lastNameError = { text: 'Enter your last name' }
    return res.render('question_name_at_discharge', { lastNameError })
  }

  if (firstName && lastName) {
    req.session.data.name_at_discharge = `${firstName} ${lastName}`
    res.redirect('/certificate_upload')
  }
})

router.post('/govuk_account_sign_in_input', function (req, res) {
  const email = req.session.data.question_email_address

  if (!email) {
    const error = { text: 'Enter the email address you registered on GOV.UK' }
    return res.render('govuk_account_sign_in', { error })
  }

  if (email && validator.isEmail(email)) {
    req.session.data.question_email_address = email
    res.redirect('/govuk_account_password')
  } else {
    const error = { text: 'Enter a valid email address' }
    return res.render('govuk_account_sign_in', { error })
  }
})

router.post('/govuk_account_password_input', function (req, res) {
  const answer = req.session.data.govuk_password

  if (!answer) {
    const error = { text: 'Enter the password you registered on GOV.UK' }
    return res.render('govuk_account_password', { error })
  }

  if (answer) {
    res.redirect('/govuk_account_sign_in_confirmed_copy')
  }
})

router.post('/govuk_create_check_email_code', function (req, res) {
  const answer = req.session.data.govuk_email_code

  if (!answer) {
    const error = { text: 'Enter the 6 digit code sent to you' }
    return res.render('govuk_create_check_email', { error })
  }

  if (answer) {
    res.redirect('/govuk_account_sign_in_confirmed')
  }
})

router.post('/certificate_upload_choice', function (req, res) {
  const answer = req.session.data.certificate_upload_further_documents

  if (!answer) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('certificate_upload_radio', { error })
  }

  if (answer === 'yes') {
    res.redirect('/certificate_upload_extra')
  }

  if (answer === 'no') {
    res.redirect('/question_service_number')
  }
})

router.post('/question_service_number_input', function (req, res) {
  const answer = req.session.data.question_service_number

  if (!answer) {
    const error = { text: 'Enter your service number' }
    return res.render('question_service_number', { error })
  }

  if (answer && answer.length >= 4 && answer.length <= 15) {
    res.redirect('/question_enlistment_date')
  } else {
    const error = {
      text: 'Enter a valid service number of 4 to 15 characters'
    }
    return res.render('question_service_number', { error })
  }
})

router.post('/question_choice_enlistment_date', function (req, res) {
  const enlistmentYear = req.session.data['enlistment-year-year']
  const dischargeYear = req.session.data['discharge-year-year']

  if (!enlistmentYear) {
    const error = { text: 'Enter a value for the year' }
    return res.render('question_enlistment_date', { error })
  }

  if (
    dischargeYear &&
    enlistmentYear &&
    validator.isBefore(dischargeYear, enlistmentYear)
  ) {
    const error = { text: 'Enlistment year can not be before discharge year' }
    return res.render('question_enlistment_date', { error })
  }

  if (
    enlistmentYear &&
    validator.isAfter(enlistmentYear, '1939') &&
    validator.isBefore(enlistmentYear)
  ) {
    res.redirect('/question_discharge_date')
  } else {
    const error = { text: 'Enter a valid year' }
    return res.render('question_enlistment_date', { error })
  }
})

router.post('/question_choice_discharge_date', function (req, res) {
  const dischargeYear = req.session.data['discharge-year-year']
  const enlistmentYear = req.session.data['enlistment-year-year']

  if (!dischargeYear) {
    const error = { text: 'Enter a value for the year' }
    return res.render('question_discharge_date', { error })
  }

  if (
    dischargeYear &&
    validator.isBefore(dischargeYear) && // is before today
    validator.isAfter(dischargeYear, '1939') &&
    (validator.isAfter(dischargeYear, enlistmentYear) ||
      dischargeYear === enlistmentYear)
  ) {
    res.redirect('/question_national_insurance')
  } else {
    const error = { text: 'Enter a valid year' }
    return res.render('question_discharge_date', { error })
  }
})

router.post('/question_national_insurance_input', function (req, res) {
  let answer = req.session.data.national_insurance_number
  const regexUse = new RegExp(process.env.NIN_REGEX)

  if (!answer) {
    const error = { text: 'Enter your national insurance number' }
    return res.render('question_national_insurance', { error })
  }

  if (answer) {
    answer = answer.replace(/ /g, '')
  }

  if (answer === 'QQ123456C' || (answer && regexUse.test(answer))) {
    res.redirect('/question_served_with')
  } else {
    const error = {
      text: 'Enter a National Insurance number in the correct format'
    }
    return res.render('question_national_insurance', { error })
  }
})

router.post('/question_served_with', function (req, res) {
  const answer = req.body['branch-served-with']

  if (!answer) {
    const error = { text: 'Select an option' }
    return res.render('question_served_with', { error })
  }

  if (answer) {
    res.redirect('/question_id_type')
  }
})

router.post('/question_id_route', function (req, res) {
  const answer = req.body.id_choice

  if (!answer) {
    const error = { text: 'Choose your preferred card format' }
    return res.render('question_id_type', { error })
  }

  if (answer) {
    res.redirect('/upload_photo')
  }
})

router.post('/upload_photo', function (req, res) {
  // const answer = req.body.uploaded_user_photo

  // if (!answer) {
  //   const error = { text: "You must upload a valid photo" }
  //   return res.render('upload_photo', { error })
  // }

  res.redirect('/question_address_to_send_to')
})

router.post('/question_address_to_send_to_choice', function (req, res) {
  const postalAddressChoice = req.body.postal_address_choice

  if (!postalAddressChoice) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_address_to_send_to', { error })
  }

  if (postalAddressChoice === 'Yes') {
    res.redirect('/question_vetcard_comms')
  }

  if (postalAddressChoice === 'No') {
    res.redirect('/question_address')
  }
})

router.post('/question_address_input', function (req, res) {
  const addressHouseFlatNumber = req.body.address_house_flat_number
  const addressLine1 = req.body.address_line_1
  const addressTownCity = req.body.address_town_city
  let addressPostcode = req.body.address_postcode

  if (!addressHouseFlatNumber) {
    const errorHome = { text: 'Enter the number of your home' }
    return res.render('question_address', { errorHome })
  }

  if (!addressLine1) {
    const errorAddress = { text: 'Enter your address' }
    return res.render('question_address', { errorAddress })
  }

  if (!addressTownCity) {
    const errorTownCity = { text: 'Enter the town or city you live in' }
    return res.render('question_address', { errorTownCity })
  }

  if (!addressPostcode || regexUkPostcode(addressPostcode) === false) {
    const errorPostcode = { text: 'Enter a valid postcode' }
    return res.render('question_address', { errorPostcode })
  }

  if (
    (addressHouseFlatNumber, addressLine1, addressTownCity, addressPostcode)
  ) {
    addressPostcode = removeStringWhiteSpace(addressPostcode)
    req.session.data.postal_address = `${addressHouseFlatNumber}, ${addressLine1}, ${addressTownCity}, ${addressPostcode}`
    res.redirect('/question_vetcard_comms')
  }
})

router.post('/question_vetcard_comms', function (req, res) {
  const answer = req.body.question_comms_choice

  if (!answer) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_vetcard_comms', { error })
  }

  if (answer === 'Yes') {
    res.redirect('/vetcard_communications_preference')
  }

  if (answer === 'No') {
    req.session.data.comms_preference_email_address =
      req.session.data.question_email_address

    req.session.data.comms_preference_phone_number = removeStringWhiteSpace(
      req.session.data.phone_number.toString()
    )

    res.redirect('/vetcard_account_summary_extra')
  }
})

router.post('/vetcard_communications_preference_choice', function (req, res) {
  const answer = req.body.communications_choice
  req.session.data.comms_preference_email_sms = false

  if (answer === '_unchecked') {
    const error = { text: 'Select at least one option' }
    return res.render('vetcard_communications_preference', { error })
  }
  answer.shift()

  if (answer.length === 1 && answer.includes('Email')) {
    res.redirect('/question_email_to_send_to')
  }

  if (answer.length === 1 && answer.includes('Text message')) {
    res.redirect('/question_phone_number_to_send_to')
  }

  if (answer) {
    req.session.data.comms_preference_email_sms = true
    res.redirect('/question_email_to_send_to_duo')
  }
})

router.post('/question_email_to_send_to_choice', function (req, res) {
  const emailChoice = req.body.email_choice
  const emailAndSms = req.session.data.comms_preference_email_sms

  if (!emailChoice && emailAndSms) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_email_to_send_to_duo', { error })
  }

  if (!emailChoice) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_email_to_send_to', { error })
  }

  if (emailChoice === 'No' && emailAndSms) {
    res.redirect('/question_email_update_duo')
  }

  if (emailChoice === 'Yes' && emailAndSms) {
    req.session.data.comms_preference_email_address =
      req.session.data.question_email_address
    res.redirect('/question_phone_number_to_send_to_duo')
  }

  if (emailChoice === 'Yes') {
    req.session.data.comms_preference_email_address =
      req.session.data.question_email_address
    res.redirect('/vetcard_account_summary_extra')
  }

  if (emailChoice === 'No') {
    res.redirect('/question_email_update')
  }
})

router.post('/question_email_update_input', function (req, res) {
  const emailUpdate = req.body.question_email_address_update
  const emailAndSms = req.session.data.comms_preference_email_sms

  if (!emailUpdate && emailAndSms) {
    const errorDuo = { text: 'Enter a valid email address' }
    return res.render('question_email_update_duo', { errorDuo })
  }

  if (!emailUpdate) {
    const error = { text: 'Enter a valid email address' }
    return res.render('question_email_update', { error })
  }

  if (emailUpdate && validator.isEmail(emailUpdate) && emailAndSms) {
    req.session.data.comms_preference_email_address = emailUpdate
    res.redirect('/question_phone_number_to_send_to_duo')
  }

  if (emailUpdate && validator.isEmail(emailUpdate)) {
    req.session.data.comms_preference_email_address = emailUpdate
    res.redirect('/vetcard_account_summary_extra')
  } else {
    const error = { text: 'Enter a valid email address' }
    return res.render('question_email_update', { error })
  }
})

router.post('/question_phone_number_to_send_to_choice', function (req, res) {
  const phoneNumberChoice = req.body.phone_number_choice
  const emailAndSms = req.session.data.comms_preference_email_sms

  if (!phoneNumberChoice && emailAndSms) {
    const errorDuo = { text: "Select 'Yes' or 'No'" }
    return res.render('question_phone_number_to_send_to_duo', { errorDuo })
  }

  if (!phoneNumberChoice) {
    const error = { text: "Select 'Yes' or 'No'" }
    return res.render('question_phone_number_to_send_to', { error })
  }
  if (phoneNumberChoice === 'No' && emailAndSms) {
    res.redirect('/question_phone_number_update_duo')
  }

  if (phoneNumberChoice === 'Yes') {
    req.session.data.comms_preference_phone_number = removeStringWhiteSpace(
      req.session.data.phone_number.toString()
    )
    res.redirect('/vetcard_account_summary_extra')
  }

  if (phoneNumberChoice === 'No') {
    res.redirect('/question_phone_number_update')
  }
})

router.post('/question_phone_number_update_input', function (req, res) {
  const phoneNumberUpdate = req.body.question_phone_number_update
  const emailAndSms = req.session.data.comms_preference_email_sms

  if (!phoneNumberUpdate && emailAndSms) {
    console.log('error check 1')
    const errorDuo = {
      text: 'Enter a valid UK mobile number, like 077 456 78901'
    }
    return res.render('question_phone_number_update_duo', { errorDuo })
  }

  if (!phoneNumberUpdate && !emailAndSms) {
    console.log('error check 2')
    const error = {
      text: 'Enter a valid UK mobile number, like 077 456 78901'
    }
    return res.render('question_phone_number_update', { error })
  }

  if (phoneNumberUpdate && regexUkMobileNumber(phoneNumberUpdate)) {
    req.session.data.comms_preference_phone_number =
      removeStringWhiteSpace(phoneNumberUpdate)
    res.redirect('/vetcard_account_summary_extra')
  } else {
    console.log('error check 3')
    const error = {
      text: 'Enter a valid UK mobile number, like 077 456 78901'
    }
    return res.render('question_phone_number_update', { error })
  }
})

router.post('/vetcard_account_summary_choice', function (req, res) {
  let idChoice = req.session.data.id_choice
  const fullName = req.session.data.full_name
  const postalAddress = req.session.data.postal_address
  const emailAddress = req.session.data.comms_preference_email_address
  const serviceNumber = req.session.data.question_service_number

  const matchStatus = req.session.data.start_veteran_match_status

  const personalisation = {
    full_name: fullName.toString(),
    postal_address: postalAddress.toString(),
    submission_reference: 'HDJ2123F',
    service_number: serviceNumber.toString()
  }

  if (!idChoice) {
    idChoice = 'Physical card'
  }

  if (matchStatus === 'Fail') {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_UNHAPPY_PATH_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation,
          reference: uuidv4()
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data))

    res.redirect('/vetcard_match_fail_explanation')
    return false
  }

  if (idChoice === 'Physical card') {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation,
          reference: uuidv4()
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data))

    res.redirect('/vetcard_application_complete_card_only')
  }

  if (idChoice === 'Digital card') {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_DIGITAL_ONLY_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation,
          reference: uuidv4()
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data))

    res.redirect('/vetcard_application_complete_digital_only')
  }

  if (idChoice === 'Physical and Digital') {
    notify
      .sendEmail(
        process.env.TEST_EMAIL_CARD_AND_DIGITAL_TEMPLATE,
        // `emailAddress` here needs to match the name of the form field in
        // your HTML page
        emailAddress.toString(),
        {
          personalisation,
          reference: uuidv4()
        }
      )
      .then((response) => console.log(response))
      .catch((err) => console.error(err.response.data))

    res.redirect('/vetcard_application_complete_card_digital')
  }
})

module.exports = router
