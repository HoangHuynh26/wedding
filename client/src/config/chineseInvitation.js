// Editable Hán–Việt renderings used for the Simplified Chinese invitation.
export const chineseNames = {
  bride: {
    name: '阮氏秋贤',
    shortName: '秋贤',
    father: '阮清心',
    mother: '阮春梅',
  },
  groom: {
    name: '陈黎廷辉',
    shortName: '廷辉',
    father: '陈廷理',
    mother: '黎氏金蓉',
  },
};

const { bride, groom } = chineseNames;

function normalizeInviterKey(inviter) {
  return inviter
    .normalize('NFD')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[’']/g, "'")
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim();
}

const inviterLabels = new Map([
  ['co dau thu hien', `新娘${bride.shortName}`],
  ['bride thu hien', `新娘${bride.shortName}`],
  ['co dau', '新娘'],
  ['the bride', '新娘'],
  ['thu hien', bride.shortName],
  ['nguyen thi thu hien', bride.name],
  ['chu re dinh huy', `新郎${groom.shortName}`],
  ['groom dinh huy', `新郎${groom.shortName}`],
  ['chu re', '新郎'],
  ['the groom', '新郎'],
  ['dinh huy', groom.shortName],
  ['tran le dinh huy', groom.name],
  ['gia dinh nha gai', '女方家属'],
  ['nha gai', '女方家属'],
  ["bride's family", '女方家属'],
  ['gia dinh nha trai', '男方家属'],
  ['nha trai', '男方家属'],
  ["groom's family", '男方家属'],
  ['thu hien & dinh huy', `${bride.shortName}与${groom.shortName}`],
  ['thu hien va dinh huy', `${bride.shortName}与${groom.shortName}`],
  ['dinh huy & thu hien', `${groom.shortName}与${bride.shortName}`],
  ['dinh huy va thu hien', `${groom.shortName}与${bride.shortName}`],
]);

const englishInviterLabels = new Map([
  ['co dau thu hien', 'Bride Thu Hien'],
  ['co dau', 'The Bride'],
  ['thu hien', 'Thu Hien'],
  ['nguyen thi thu hien', 'Nguyen Thi Thu Hien'],
  ['chu re dinh huy', 'Groom Dinh Huy'],
  ['chu re', 'The Groom'],
  ['dinh huy', 'Dinh Huy'],
  ['tran le dinh huy', 'Tran Le Dinh Huy'],
  ['gia dinh nha gai', "Bride's Family"],
  ['nha gai', "Bride's Family"],
  ['gia dinh nha trai', "Groom's Family"],
  ['nha trai', "Groom's Family"],
  ['thu hien & dinh huy', 'Thu Hien & Dinh Huy'],
  ['thu hien va dinh huy', 'Thu Hien & Dinh Huy'],
  ['dinh huy & thu hien', 'Dinh Huy & Thu Hien'],
  ['dinh huy va thu hien', 'Dinh Huy & Thu Hien'],
  [`新娘${bride.shortName}`, 'Bride Thu Hien'],
  ['新娘', 'The Bride'],
  [`新郎${groom.shortName}`, 'Groom Dinh Huy'],
  ['新郎', 'The Groom'],
  ['女方家属', "Bride's Family"],
  ['男方家属', "Groom's Family"],
  [`${bride.shortName}与${groom.shortName}`, 'Thu Hien & Dinh Huy'],
  [`${groom.shortName}与${bride.shortName}`, 'Dinh Huy & Thu Hien'],
]);

export function formatChineseInviter(inviter) {
  if (!inviter) return '';
  if (/\p{Script=Han}/u.test(inviter) && /^[\p{Script=Han}\p{P}\p{N}\s]+$/u.test(inviter)) {
    return inviter;
  }

  const key = normalizeInviterKey(inviter);
  return inviterLabels.get(key) || '婚礼邀请方';
}

export function formatEnglishInviter(inviter) {
  if (!inviter) return '';
  const trimmed = inviter.trim();
  if (englishInviterLabels.has(trimmed)) {
    return englishInviterLabels.get(trimmed);
  }
  const key = normalizeInviterKey(trimmed);
  return englishInviterLabels.get(key) || trimmed;
}
