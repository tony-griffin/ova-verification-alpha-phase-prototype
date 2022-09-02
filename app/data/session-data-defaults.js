/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

// "postal_address": ["14 Lime Court<br>Weston-super-mare<br>BS22 0AA"],
// "govuk_question_email" : ["sandy.smith@example.com"],
//"govuk_password" : ["q1w2e3r4t5y6"],
//"govuk_email_code" : ["123456"],
// "national_insurance_number" : ["QQ 12 34 56 C"],
// "service_number" : ["200210293847"],
// "date-of-birth" : ["01", "06", "1960"],
// "previous_name" : ["Sandy Williams"],
*/

module.exports = {
  // Insert values here
  full_name: ['Sandy Smith'],
  govuk_question_email: [''],
  postal_address: ['14 Lime Court, Weston-super-mare BS22, 0AA'],
  phone_number: ['07700 900457'],
  birthYear: [''],
  communications_choice: ['N/A']
}
