const BANNED = [
  "nigga",
  "nigger",
  "czarnuch",
  "murzyn",
  "cwel",
  "pedał",
  "incel",
  "simp",
  "s1mp",
  "virgin",
  "ciota",
  "incel",
  "kys",
  "kms",
];

function createBannedStringRegex(bannedList: string[]) {
  const escapedStrings = bannedList.map((str) =>
    str
      .split("")
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("[\\s\\W]*"),
  );

  const pattern = escapedStrings.join("|");

  return new RegExp(pattern, "i");
}

export function containsBannedString(input: string) {
  const regex = createBannedStringRegex(BANNED);
  return regex.test(input);
}
