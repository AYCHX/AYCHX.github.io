import React, { Fragment } from 'react'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Table, Card, CardHeader, CardFooter } from 'reactstrap'
import { compose, setDisplayName, withHandlers, defaultProps, setPropTypes, withState } from 'recompose'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import routes from 'Routes'
import Units from 'Components/Units'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'

import { areOrdersLoading, areAllOrdersLoaded } from 'Selectors/orders'
import { retrievePaginatedSwaps } from 'Actions/swap'

import { tradeTable, tradeCoinIcon } from './style'

const NODATA = '-----'

export const CoinSymbol = ({ symbol, ...props }) => (
  <Fragment>
    <CoinIcon className={classNames(tradeCoinIcon, 'mr-1')} symbol={symbol} size='sm' inline {...props}/>
    {symbol}
  </Fragment>
)

export const TableRow = ({
  swap,
  swap: { sendAmount, sendSymbol, receiveAmount, receiveSymbol, rate, createdAtFormatted },
  ...props
}) => (
  <tr className='cursor-pointer' {...props}>
    <td>{createStatusLabel(swap)}</td>
    <td className='d-none d-sm-table-cell'>{createdAtFormatted}</td>
    <td className='d-none d-sm-table-cell'>
      <CoinSymbol symbol={sendSymbol}/>
      <i className='fa fa-long-arrow-right text-grey mx-2'/> 
      <CoinSymbol symbol={receiveSymbol}/>
    </td>
    <td>{receiveAmount
      ? (<Units value={receiveAmount} symbol={receiveSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
      : NODATA}
    </td>
    <td>{sendAmount
      ? (<Units value={sendAmount} symbol={sendSymbol} precision={6} showSymbol showIcon iconProps={{ className: 'd-sm-none' }}/>)
      : NODATA}
    </td>
    <td>{rate > 0
      ? (<Units value={rate} precision={6}/>)
      : NODATA}
    </td>
  </tr>
)

const TradeTable = ({ handleClick, hideIfNone, tableTitle, 
  swaps, tableHeadings, zeroOrdersMessage, handleShowMore, areOrdersLoading,
  areAllOrdersLoaded, showMore }) => (
  <Fragment>
    {hideIfNone && swaps.length == 0 ? null : (
      <Card className='mb-3'>
        <CardHeader>
          <h5>{tableTitle}</h5>
        </CardHeader>
        {swaps.length === 0 ? (
          <p className='text-center mt-3'>
            <i>{zeroOrdersMessage}</i>
          </p>
        ) : (
          <Table hover striped responsive className={tradeTable}>
            <thead>
              <tr>
                {tableHeadings.map(({ text, mobile }) => (
                  <th key={text} className={!mobile ? 'd-none d-sm-table-cell border-0' : 'border-0'}>{text}</th>)
                )}
              </tr>
            </thead>
            <tbody>
              {swaps.map((swap) => !swap.orderId ? null : (
                <TableRow key={swap.orderId} swap={swap} onClick={() => handleClick(swap.orderId)}/>
              ))}
            </tbody>
          </Table>
        )}
        {!areAllOrdersLoaded && showMore && (
          <CardFooter 
            tag='a'
            onClick={handleShowMore}
            className={'position-absolute p-2 text-center cursor-pointer d-block w-100'}
            style={{ bottom: 0 }}
          >
            {!areOrdersLoading ? (
              <span className='hover'>Show more orders...</span>
            ) : (
              <i className='fa fa-spinner fa-pulse'/>
            )}
          </CardFooter>
        )}
      </Card>
    )}
  </Fragment>
)


export const statusIcons = {
  complete: <i style={{ fontSize: '18px' }} className='text-success fa fa-check-circle'></i>,
  contact_support: <i className='fa fa-exclamation-circle text-warning'></i>,
  pending: <i className='fa fa-spinner fa-pulse'/>,
  failed: <i className='fa fa-exclamation-circle text-danger'></i>
}

export const createStatusLabel = (swap) => {
  const { status: { detailsCode, code, details } } = swap
  const statusIcon = statusIcons[detailsCode] || statusIcons[code]

  return <Expandable shrunk={statusIcon} expanded={details}></Expandable>
}

export default compose(
  setDisplayName('TradeTable'),
  setPropTypes({
    hideIfNone: PropTypes.bool,
    tableTitle: PropTypes.string,
    tableHeadings: PropTypes.arrayOf(PropTypes.object),
    zeroOrdersMessage: PropTypes.string,
    swaps: PropTypes.arrayOf(PropTypes.object),
    showMore: PropTypes.bool,
  }),
  defaultProps({
    tableTitle: 'Orders',
    hideIfNone: false,
    tableHeadings: [],
    zeroOrdersMessage: 'No orders to show',
    swaps: [{}],
    showMore: false,
  }),
  connect(createStructuredSelector({
    areOrdersLoading: areOrdersLoading,
    areAllOrdersLoaded: areAllOrdersLoaded,
  }), {
    push: pushAction,
    retrievePaginatedSwaps: retrievePaginatedSwaps
  }),
  withState('page', 'updatePage', 2),
  withHandlers({
    handleClick: ({ push }) => (orderId) => push(routes.tradeDetail(orderId)),
    handleShowMore: ({ page, updatePage, retrievePaginatedSwaps }) => () => {
      retrievePaginatedSwaps(page, 50)
      updatePage(page + 1)
    }
  }),
)(TradeTable)
