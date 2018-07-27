import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers, mapProps } from 'recompose'
import { connect } from 'react-redux'
import { push, goBack } from 'react-router-redux'
import { Route } from 'react-router-dom'
import { pick } from 'lodash'

export default compose(
  setDisplayName('ModalRoute'),
  setPropTypes({
    closePath: PropTypes.string, // Path to redirect to on model close
    ...Route.propTypes
  }),
  defaultProps({
    closePath: null, // closePath === null -> history goBack on close modal
  }),
  connect(null, { routerPush: push, routerGoBack: goBack }),
  withHandlers({
    render: ({ routerPush, routerGoBack, closePath, component, render }) => (props) => {
      // <Route component> takes precedence over <Route render> so don’t use both in the same <Route>
      if (component) { return undefined }
      const toggle = () => closePath ? routerPush(closePath) : routerGoBack()
      return render({ ...props, isOpen: true, toggle })
    }
  }),
  mapProps((props) => ({
    ...pick(props, Object.keys(Route.propTypes)),
  })),
)(Route)
