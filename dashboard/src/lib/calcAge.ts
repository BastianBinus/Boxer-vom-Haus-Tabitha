export function calcAge(geburtsdatum: string): string {
  const birth = new Date(geburtsdatum)
  const now = new Date()
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth()
  if (months < 1) return 'Neugeboren'
  if (months < 12) return `${months} Monat${months !== 1 ? 'e' : ''}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years} J. ${rem} Mo.` : `${years} Jahr${years !== 1 ? 'e' : ''}`
}
