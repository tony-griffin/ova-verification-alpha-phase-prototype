function regexUkMobileNumber(value) {
  //handle leading 0
  if (value.indexOf('0') === 0) {
    value = value.substring(1)
    
    const stripped = value.replace(
      /\s+/g,
      ''
    )

    var mobile_valid =
      /^7(?:[1-4]\d\d|5(?:0[0-8]|[13-9]\d|2[0-35-9])|624|7(?:0[1-9]|[1-7]\d|8[02-9]|9[0-689])|8(?:[014-9]\d|[23][0-8])|9(?:[04-9]\d|1[02-9]|2[0-35-9]|3[0-689]))\d{6}$/.test(
        stripped
      )

    return mobile_valid
  } else {
    return false
  }
}

module.exports = {
  regexUkMobileNumber
}
