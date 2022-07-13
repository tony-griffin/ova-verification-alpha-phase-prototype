const express = require('express')
const router = express.Router()

// Run this code when a form is submitted to '/ask-apply-veteran-card-answer'
router.post("/ask-apply-veteran-card-answer", function (req, res) {
  
  var answer = req.session.data["ask-apply-veteran-card"];
  
  if (answer === "yes") {
    res.redirect("/start_veteran_apply_id_card");
  } else {
    res.redirect("/prove_id_start");
  }
});


router.post("/verify-your-identity-answer", function (req, res) {
  var answer = req.session.data["verify-your-identity"];

  if (answer == "verify-identity-photo-address") {
    res.redirect("/upload_photo_passport");
  } else {
    res.redirect("/upload_photo_drivers_licence");
  }
});

router.post("/govuk-prove-id-start-answer", function (req, res) {
  var answer = req.session.data["govuk-prove-id-confirmation-check"];

  if (answer == "govuk-prove-id-confirmation-check-agree") {
    res.redirect("/govuk_prove_id_choice");
  } else {
    res.redirect("/govuk_prove_id_start_no_confirm");
  }
});

router.post("/govuk-prove-id-choice-verify-answer", function (req, res) {
  var answer = req.session.data["govuk-prove-id-choice-verify-your-identity"];

  if (answer == "govuk-prove-id-choice-sign-create") {
    res.redirect("/govuk_create_or_sign_in");
  } else {
    res.redirect("/govuk_redirect_verify_your_identity");
  }
});

// Add your routes here - above the module.exports line

module.exports = router
