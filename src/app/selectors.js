export const getCurrentPortfolio = ({ portfolio, portfolios }) => portfolios[portfolio.current]
export const getCurrentWallet = (state) => state.wallets[((getCurrentPortfolio(state) || {}).wallets || [])[0]] || {}