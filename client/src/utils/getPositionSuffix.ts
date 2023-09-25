const getPositionSuffix = (position: number) => {
    const endCharacter = position.toString().split('').pop()

    if (endCharacter === '1') return 'st'
    else if (endCharacter === '2') return 'nd'
    else if (endCharacter === '3') return 'rd'
    else return 'th'
}

export default getPositionSuffix
