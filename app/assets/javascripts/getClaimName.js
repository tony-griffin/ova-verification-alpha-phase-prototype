function getClaimNames(getFakeDIClaimResponse) {
  const fakeJWT = getFakeDIClaimResponse;
  const claimNames = fakeJWT.vc.credentialSubject.name;

  let currentName = [];
  let previousNames = [];
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

  console.log("Names array!!!!!: ", namesExport);
  return namesExport;
}

module.exports = {
  getClaimNames,
};
