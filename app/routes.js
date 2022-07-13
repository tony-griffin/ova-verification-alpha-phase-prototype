const express = require('express')
const router = express.Router()

// Run this code when a form is submitted to '/ask_apply_veteran_card_answer'
router.post("/ask_apply_veteran_card_answer", function (req, res) {
  
  // Make a variable and give it the value from 'how-many-balls'
  var answer = req.session.data["ask-apply-veteran-card"];

  // Check whether the variable matches a condition
  if (answer == "yes") {
    // Send user to next page
    res.redirect("/juggling-trick");
  } else {
    // Send user to ineligible page
    res.redirect("/prove_id_start");
  }
});


router.post("/verify_your_identity_answer", function (req, res) {
  var answer = req.session.data["verify-your-identity"];

  if (answer == "verify-identity-photo-address") {
    res.redirect("/upload_photo_passport");
  } else {
    res.redirect("/upload_photo_drivers_licence");
  }
});

// Add your routes here - above the module.exports line

module.exports = router
