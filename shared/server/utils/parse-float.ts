const ParseFloat = (input: string, decimalPlaces: number): number => {
    return Number(parseFloat(input).toFixed(decimalPlaces))
}

export default ParseFloat
