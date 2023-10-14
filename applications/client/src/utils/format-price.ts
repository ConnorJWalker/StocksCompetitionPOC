const formatPrice = (price: number, currencyCode: string): string =>  {
    switch (currencyCode) {
        case 'USD': return '$' + price
        case 'EUR': return '€' + price
        case 'GBP': return '£' + price
        case 'GBX': return price + 'p'
        default: return price + currencyCode
    }
}

export default formatPrice
