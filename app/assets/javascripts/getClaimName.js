function getClaimNames(getFakeDIClaimResponse) {
  const claimNames = getFakeDIClaimResponse.vc.credentialSubject.name;

  let currentName = [];
  let previousNames = [];
  let nameAtDischarge = [];
  let namesExport = [];
  

  claimNames.map((name) => {
    if (name.validFrom) {
      name.nameParts.map((namePart) => {
        currentName.push(namePart.value);
      });
    }

    if (name.validUntil) {
      name.nameParts.map((namePart) => {
        
        previousNames.push(namePart.value);
      });
    }
  });

  namesExport.push(currentName.join(" "));
  namesExport.push(previousNames.join(" "));

  return namesExport;
}

function getNameAtDischarge(validUntilDate) {
  let matchDistance = {};
  matchDistance.validUntil = validUntilDate;

  let validUntilArray = matchDistance.validUntil.split("-");
  let validUntilYear = Number(validUntilArray[0]);
  let yearArray = [];
  yearArray.push(dischargeYear);
  yearArray.push(validUntilYear);
  //descending order
  yearArray.sort((a, b) => b - a);
  let yearDiff = yearArray[0] - yearArray[1];

  matchDistance.yearDiff = yearDiff;
  distanceFromDischargeYear.push(matchDistance);
  let uniqueDateValues = [
    ...new Set(distanceFromDischargeYear.map((el) => JSON.stringify(el))),
  ].map((el) => JSON.parse(el));

  //ascending order
  uniqueDateValues.sort(
    (objA, objB) => Number(objA.yearDiff) - Number(objB.yearDiff)
  );
  console.log("UNIQUE--------", uniqueDateValues);
  let mostLikelyYear = Number(uniqueDateValues[0].validUntil.split("-")[0]);
  console.log(mostLikelyYear);

  let upperLikelyRange = dischargeYear + 5;
  let lowerLikelyRange = dischargeYear - 5;

  if (
    mostLikelyYear === dischargeYear ||
    mostLikelyYear <= upperLikelyRange ||
    mostLikelyYear >= lowerLikelyRange
  ) {
  }
}

module.exports = {
  getClaimNames,
};
