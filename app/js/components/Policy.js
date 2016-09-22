import { READ_ONLY, WRITE_ONLY, READ_WRITE } from '../actions'

import React, { Component, PropTypes } from 'react'
import connect from 'react-redux/lib/components/connect'
import classnames from 'classnames'
import * as actions from '../actions'

class Policy extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {}
  }

  handlePolicyChange(e) {
    this.setState({ policy: e.target.value })
  }

  removePolicy(e) {
    e.preventDefault()
    const { dispatch } = this.props

    dispatch(actions.removePolicy(policy.bucket, policy.prefix))
  }

  render() {
    const { policy } = this.props

    return (
      <li className={classnames()}>
          <div className="pmbl-item">{policy.prefix}</div>
          <div className="pmbl-item">
            <select className="form-control"
                    value={policy.policy}
                    onChange={this.handlePolicyChange.bind(this)}>
              <option value={READ_ONLY}>Read Only</option>
              <option value={WRITE_ONLY}>Write Only</option>
              <option value={READ_WRITE}>Read and Write</option>
            </select>
          </div>

          <div className="pmbl-item">
            <button className="btn btn-sm btn-block btn-danger" onClick={this.removePolicy.bind(this)}>Remove</button>
          </div>
      </li>
    )
  }
}


export default connect(state => {
    return { policy: state.policy }
})(Policy)
