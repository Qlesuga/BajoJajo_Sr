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
  "incel",
  "kys",
  "kms",
  "onlyfans",
  "anal",
  "fag",
  "nood",
  "gay",
  "rape",
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
  "0": "0OoΟοОоՕ〇ꓳⲞⲟＯ𝟎𝟘𝟢𝟬∅⌀⓪",
  "1": "1Ilɪ｜ǀⅠⅼ∣𝟏𝟙𝟣𝟭᧚𐄇",
  "2": "2ƧϨᒿꙄ𝟐𝟚𝟤𝟮²ᒿ²᪂",
  "3": "3ƷȜЗӠ𝟑𝟛𝟥𝟯³ǫʒ꣓",
  "4": "4Ꮞ４𝟒𝟜𝟦𝟰᪄᥊",
  "5": "5Ƽ５𝟓𝟝𝟧𝟱ƽ᥋",
  "6": "6бᏮⳒ６𝟔𝟞𝟨𝟲",
  "7": "7𐓒７𝟕𝟟𝟩𝟳𐌣𐏓",
  "8": "8Ȣȣ৮８𝟖𝟠𝟪𝟴꣘",
  "9": "9৭Ⳋ９𝟗𝟡𝟫𝟵գ꣙",
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
