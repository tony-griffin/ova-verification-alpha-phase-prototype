const express = require("express");
const router = express.Router();

// Run this code when a form is submitted to '/ask-apply-veteran-card-answer'
router.post("/ask-apply-veteran-card-answer", function (req, res) {
  var answer = req.session.data["ask-apply-veteran-card"];

  if (answer === "yes") {
    res.redirect("/start_veteran_apply_id_card");
  } else {
    res.redirect("/verify_your_identity");
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
    res.redirect("/govuk_prove_id_explanation");
  } else {
    res.redirect("/govuk_prove_id_start_no_confirm");
  }
});

// Add your routes here - above the module.exports line

module.exports = router;
