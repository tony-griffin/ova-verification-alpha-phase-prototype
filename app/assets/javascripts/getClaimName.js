let claimNames = [
  { validFrom: "2020-03-01", nameParts: [[Object], [Object]] },
  { validUntil: "2020-03-01", nameParts: [[Object], [Object]] },
];

function getClaimName(claimNames) {
  let names = [];
  let currentName = [];
  let previousNames = [];
  let namesExport = [];

  names = claimNames.map((name) => {
    if (name?.validFrom) {
      name.nameParts.map((namePart) => {
        currentName.push(namePart);
      });
    }

    if (name?.validUntil) {
      name.nameParts.map((namePart) => {
        previousNames.push(namePart);
      });
    }
  });

  namesExport.push(currentName);
  namesExport.push(previousNames);
  return namesExport;
}
