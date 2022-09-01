function getClaimNames(getFakeDIClaimResponse) {
  const claimNames = getFakeDIClaimResponse.vc.credentialSubject.name;

  let currentName = [];
  let previousNames = [];
  let namesExport = [];

  claimNames.map((name) => {
    if (name.validFrom) {
      let fullName = [];
      name.nameParts.map((namePart) => {
        fullName.push(namePart.value);
      });
      currentName.push(fullName.join(" "));
    }

    if (name.validUntil) {
      let fullName = [];
      name.nameParts.map((namePart) => {
        fullName.push(namePart.value);
      });

      previousNames.push(fullName.join(" "));
    }
  });

  namesExport.push(currentName[0]);
  namesExport.push(previousNames);

  return namesExport.flat();
}

function getPreviousNames(claimNames) {
  return claimNames.slice(1, claimNames.length);
}

function getLikelyDischargeName(getFakeDIClaimResponse, dischargeYear) {
  // get JWT credential subject name array
  const claimObj = getFakeDIClaimResponse.vc.credentialSubject.name;
  console.log("claimObj******:", claimObj);

  // extract name list into new array
  let fullNameListFromClaim = [];
  claimObj.map((name) => {
    if (name.validFrom) {
      let fullName = [];
      name.nameParts.map((namePart) => {
        fullName.push(namePart.value);
      });
      fullNameListFromClaim.push(fullName.join(" "));
    }

    if (name.validUntil) {
      let fullName = [];
      name.nameParts.map((namePart) => {
        fullName.push(namePart.value);
      });

      fullNameListFromClaim.push(fullName.join(" "));
    }
  });

  // set up today's date
  const dateAndNameArr = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const currentDate = [currentYear, currentMonth, currentDay]
    .join("-")
    .toString();

  // create new validUntil object
  const mostRecentUntil = {
    validUntil: currentDate,
    value: fullNameListFromClaim[0],
  };
  dateAndNameArr.push(mostRecentUntil);

  // create new validFrom DOB object
  const fromDOB = {
    validFrom: getFakeDIClaimResponse.vc.credentialSubject.birthDate[0].value,
    value: fullNameListFromClaim[fullNameListFromClaim.length - 1],
  };

  for (let i = 0; i < claimObj.length; i++) {
    let obj = {};
    if (claimObj[i].validFrom) {
      obj.validFrom = claimObj[i].validFrom;
      obj.value = fullNameListFromClaim[i];
    }

    if (claimObj[i].validUntil) {
      obj.validUntil = claimObj[i].validUntil;
      obj.value = fullNameListFromClaim[i];
    }
    dateAndNameArr.push(obj);
  }

  dateAndNameArr.push(fromDOB);

  let dischargeYearSelected = "1978";
  console.log("Discharge Year@@@@@: ", dischargeYearSelected);

  let startDischargeYear = `${dischargeYearSelected}-01-01`;
  let endDischargeYear = `${dischargeYearSelected}-12-31`;
  let likelyName;

  for (let i = 0; i < dateAndNameArr.length; i = i + 2) {
    if (
      Date.parse(startDischargeYear) >
        Date.parse(dateAndNameArr[i + 1].validFrom) &&
      Date.parse(endDischargeYear) < Date.parse(dateAndNameArr[i].validUntil)
    ) {
      likelyName = dateAndNameArr[i].value;
    }
  }

  return likelyName;
}

module.exports = {
  getClaimNames,
  getPreviousNames,
  getLikelyDischargeName,
};
