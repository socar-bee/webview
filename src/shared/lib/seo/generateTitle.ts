const operatorList = ['하이파킹', '카카오 T', 'Tmap주차', '아마노', '나이스파크', 'TURU']

function generateDiscountInfo(name: string) {
  return name.endsWith('주차장') ? `${name} 할인 정보 - 모두의주차장` : `${name} 주차장 할인 정보 - 모두의주차장`
}

export function removeOperatorPrefix(name: string) {
  for (const prefix of operatorList) {
    if (name.startsWith(prefix)) {
      return generateDiscountInfo(name.substring(prefix.length).trim())
    }
  }
  return generateDiscountInfo(name)
}
