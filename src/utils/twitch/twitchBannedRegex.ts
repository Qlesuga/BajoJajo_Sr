const BANNED = [
  "nigg",
  "czarnuch",
  "murzyn",
  "cwel",
  "pedał",
  "incel",
  "simp",
  "virgin",
  "ciota",
  "kys",
  "kms",
  "onlyfans",
  "anal",
  "fag",
  "nood",
  "gay",
  "rape",
  "tranny",
];

const charSubstitutions: Record<string, string> = {
  a: "aаạąäàáᴀₐᵃAΑΑ̇АᎪᗅꓮꓯＡ𐊠𝐀𝐴𝑨𝒜𝓐𝔄𝔸𝕬𝖠𝗔𝘈𝘼𝙰𝚨𝛢𝜜𝝖𝞐ᴬªɑǟꬱ@",
  b: "bƅᵇᵦBƁΒВᏴᏼᗷᛒℬꓐꞴＢᴮ",
  c: "cсƈċᴄᵓᶜCϹСᏟ𐐕ᑕℂℭ⸦ꓚＣ𐊢𐌂ↄɔꜾ",
  d: "dԁɗᶁꝺᵈDᎠᗞᗪᴅⅅⅮꓓＤᴰ",
  e: "eеẹėéèₑᵉEΕЕᎬⴹꓰＥ𑢮ᴱɛɇꬲ",
  f: "fᶠFϜᖴℱꓝꞘＦ𐊇𐊥ꜰ",
  g: "gġɡցᶃǥǵᵍGℊ⅁ꓖＧᴳցǵǥ",
  h: "hһʰHΗНᎻᏂℋℌꓧＨᴴ",
  i: "iіíïⁱᵢIⅠⅠⅼ丨ιℐℑ∣⍳Ⲓⵏꓲᴵ1!",
  j: "jјʝϳʲJЈᴊꞲＪᴶ",
  k: "kκᵏKΚКᛕⲔꓗＫᴷĸꝁ",
  l: "lӏḷˡLⅠⅼℓ∣⏽Ⲓⵏꓲᴸ",
  m: "mᵐMΜМᴍℳꟽⲘꓟＭᴹɱꟿ",
  n: "nոⁿₙNΝՆᴎℕꓠＮᴺŋɴꞃ",
  o: "oоοօȯọỏơóòöᵒº0OΟОՕ०ꓳ〇ⲞⲟＯᴼ",
  p: "pрᵖPΡРℙⲢꓑＰᴾ",
  q: "qզԛɋʠᵠQℚꝖＱ",
  r: "rгᴦʳRΓℛⲢꓣＲᴿɼʁꝛ",
  s: "sʂˢSЅꚂꙄꙅⴑＳꜱſꞩ",
  t: "tτꚋᵗTΤТᴛⲦꓔＴᵀŧʈꞇ",
  u: "uυսüúùᵘᵤU∪𝕌𝖀ꓴＵᵁμυᴜ",
  v: "vνѵᴠꝟᵛV∨𝖁ꓦＶⱽʌʋ",
  w: "wѡԝʷWᴡꓪＷᵂɯωꝡ",
  x: "xхҳẋˣX×⤫⤬⨯ꓫＸ",
  y: "yуýʸYΥҮɣꓬＹ",
  z: "zʐżƶᶻZℤꓜＺ",
};

function createBannedStringRegex(bannedList: string[]) {
  const patterns = bannedList.map((word) => {
    let pattern = "";

    for (const char of word.toLowerCase()) {
      const charSubstitution = charSubstitutions[char] as string | undefined;
      if (charSubstitution) {
        pattern += charSubstitution;
      } else {
        pattern += `[${char}${char.toUpperCase()}]`;
      }

      pattern += "[\\s\\W]*";
    }

    pattern = pattern.replace(/\[\\s\\W\]\*$/, "");

    return pattern;
  });

  return new RegExp(patterns.join("|"), "i");
}

export function containsBannedString(input: string) {
  const regex = createBannedStringRegex(BANNED);
  return regex.test(input);
}
