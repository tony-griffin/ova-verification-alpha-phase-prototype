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

router.post(
  "/sp4v1_apply_behalf_someone_else_radio_answer",
  function (req, res) {
    var answer = req.session.data["sp4v1_apply_behalf_someone_else_radio"];

    // console.log("ANSWER: ", answer);

    if (answer === "sp4v1_apply_behalf_someone_else_radio_yes")
      res.redirect("/sp4v1_behalfOf_question_name_service");

    if (answer === "sp4v1_apply_behalf_someone_else_radio_no")
      res.redirect("/sp4v1_question_name");

    if (!answer) res.redirect("/sp4v1_apply_behalf_someone_else_radio_error");
  }
);

router.post("/mod_access_email_radio_answer", function (req, res) {
  var answer = req.session.data["mod_access_email_radio"];

  if (
    answer === "mod_access_email_radio_yes" ||
    answer === "mod_access_email_radio_no"
  ) {
    res.redirect("/mod_request_info_you_someone_else_radio");
  } else {
    res.redirect("/mod_access_email_radio_error");
  }
});

router.post("/mod_prove_id_to_continue_radio_answer", function (req, res) {
  var answer = req.session.data["mod_prove_id_to_continue_radio"];

  if (answer === "mod_prove_id_to_continue_radio_sign_up")
    res.redirect("/mod_prove_id_start");

  if (answer === "mod_prove_id_to_continue_radio_another_way")
    res.redirect("/verify_your_identity");

  if (!answer) res.redirect("/mod_prove_id_to_continue_error");
});

router.post("/mod_prove_id_gov_acc_answer", function (req, res) {
  var answer = req.session.data["mod_prove_id_gov_acc_radio"];

  if (answer === "mod_prove_id_gov_acc_radio_govuk_account")
    res.redirect("/create_govuk_acc");

  if (answer === "mod_prove_id_gov_acc_radio_govuk_verify")
    res.redirect("/postoffice_prove_id_start");

  if (!answer) res.redirect("/mod_prove_id_gov_acc_error");
});

router.post("/sp4v1_behalfOf_prove_id_gov_acc_answer", function (req, res) {
  var answer = req.session.data["sp4v1_behalfOf_prove_id_gov_acc_radio"];

  if (answer === "sp4v1_behalfOf_prove_id_gov_acc_radio_govuk_account")
    res.redirect("/sp4v1_behalfOf_create_govuk_acc");

  if (answer === "sp4v1_behalfOf_prove_id_gov_acc_radio_govuk_verify")
    res.redirect(
      "https://www.postoffice.co.uk/identity/in-branch-verification-service"
    );

  if (!answer) res.redirect("/sp4v1_behalfOf_prove_id_gov_acc_error");
});

router.post("/mod_someone_else_name_answer", function (req, res) {
  var answer = req.session.data["mod_someone_else_name_radio"];

  if (answer === "mod_prove_id_gov_acc_radio_govuk_account")
    res.redirect("/create_govuk_acc");

  if (answer === "mod_prove_id_gov_acc_radio_govuk_verify")
    res.redirect("/verify_your_identity");

  if (!answer) res.redirect("/mod_prove_id_gov_acc_error");
});

router.post(
  "/sp4v1_behalfOf_apply_question_id_choice_answer",
  function (req, res) {
    var answer = req.session.data["question_id_choice"];

    if (answer === "question_id_choice_physical_card")
      res.redirect(
        "/sp4v1_behalfOf_apply_application_complete"
      );

    if (answer === "question_id_choice_digital_card")
      res.redirect(
        "/sp4v1_behalfOf_apply_application_complete"
      );

    if (answer === "question_id_choice_both")
      res.redirect(
        "/sp4v1_behalfOf_apply_application_complete"
      );

    if (!answer) res.redirect("/sp4v1_behalfOf_apply_question_ID_choice_error");
  }
);

router.post("/question_id_choice_answer", function (req, res) {
  var answer = req.session.data["question_id_choice"];

  if (answer === "question_id_choice_physical_card")
    res.redirect("/application_complete");

  if (answer === "question_id_choice_digital_card")
    res.redirect("/application_complete");
    
  if (answer === "question_id_choice_both")
    res.redirect("/application_complete");

  if (!answer) res.redirect("/question_id_choice_error");
});



router.post(
  "/sp4v1_behalfOf_relationship_to_radio_answer",
  function (req, res) {
    var answer = req.session.data["sp4v1_behalfOf_relationship_to_radio"];

    if (answer) res.redirect("/sp4v1_behalfOf_question_email");

    if (!answer) res.redirect("/sp4v1_behalfOf_relationship_to_radio_error");
  }
);

router.post(
  "/sp4v1_behalfOf_prove_veteran_id_radio_answer",
  function (req, res) {
    var answer = req.session.data["sp4v1_behalfOf_prove_veteran_id_radio"];

    if (answer === "sp4v1_behalfOf_prove_veteran_id_radio_govuk_account")
      res.redirect("/sp4v1_behalfOf_prove_id_start");
     
    if (answer === "sp4v1_behalfOf_prove_veteran_id_radio_govuk_verify")
      res.redirect("/sp4v1_behalfOf_id_verification_radio"); 

    if (!answer) res.redirect("/sp4v1_behalfOf_prove_veteran_id_radio_error");
  }
);

router.post(
  "/sp4v1_behalfOf_id_verification_radio_answer",
  function (req, res) {
    var answer = req.session.data["sp4v1_behalfOf_id_verification_radio"];

    if (answer )
      res.redirect("/sp4v1_upload_photo");

    if (!answer) res.redirect("/sp4v1_behalfOf_id_verification_radio_error");
  }
);

// router.post(
//   "/create_govuk_acc_back_link",
//   function (req, res) {
//     var answer = req.session.data["backLink"];
//     console.log("HISTORY: ",window.history.back());
//     if (window.history.back() === "mod_prove_id_gov_acc") {
//       answer = "mod_prove_id_gov_acc";
//     }
    
//     if (window.history.back() === "sp4v1_behalfOf_prove_id_gov_acc") {
//       answer = "sp4v1_behalfOf_prove_id_gov_acc";
//     }
    
//   }
// );

// Add your routes here - above the module.exports line

module.exports = router;
