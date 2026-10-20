const PAIRS: [RegExp, string][] = [
  [/O['‘ʻ`’]/g, 'Ў'],
  [/o['‘ʻ`’]/g, 'ў'],
  [/G['‘ʻ`’]/g, 'Ғ'],
  [/g['‘ʻ`’]/g, 'ғ'],
  [/Sh/g, 'Ш'],
  [/SH/g, 'Ш'],
  [/sh/g, 'ш'],
  [/Ch/g, 'Ч'],
  [/CH/g, 'Ч'],
  [/ch/g, 'ч'],
  [/Ng/g, 'Нг'],
  [/Yo/g, 'Ё'],
  [/yo/g, 'ё'],
  [/Yu/g, 'Ю'],
  [/yu/g, 'ю'],
  [/Ya/g, 'Я'],
  [/ya/g, 'я'],
  [/Ye/g, 'Е'],
  [/ye/g, 'е'],
  [/(^|[\s(«"-])E/g, '$1Э'],
  [/(^|[\s(«"-])e/g, '$1э'],
  [/Ts/g, 'Ц'],
  [/['‘ʻ`’]/g, 'ъ'],
]

const SINGLE: Record<string, string> = {
  A: 'А', B: 'Б', D: 'Д', E: 'Е', F: 'Ф', G: 'Г', H: 'Ҳ', I: 'И', J: 'Ж', K: 'К', L: 'Л', M: 'М', N: 'Н',
  O: 'О', P: 'П', Q: 'Қ', R: 'Р', S: 'С', T: 'Т', U: 'У', V: 'В', X: 'Х', Y: 'Й', Z: 'З',
  a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н',
  o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'с', C: 'С',
  w: 'в', W: 'В',
}

export function toCyrillic(text: string): string {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return parts
    .map((part) => {
      if (part.startsWith('{{')) return part
      let s = part
      for (const [re, rep] of PAIRS) s = s.replace(re, rep)
      return s.replace(/[A-Za-z]/g, (ch) => SINGLE[ch] ?? ch)
    })
    .join('')
}
