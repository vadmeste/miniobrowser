import { READ_ONLY, WRITE_ONLY, READ_WRITE } from '../actions'
import React, { Component, PropTypes } from 'react'
import connect from 'react-redux/lib/components/connect'
import classnames from 'classnames'
import * as actions from '../actions'

class PolicyInput extends Component {
  constructor(props, context) {
      super(props, context)
      this.state = {
          bucket: this.props.bucket || '',
          prefix: this.props.prefix || '',
          policy: READ_ONLY
      }
  }

  componentWillMount() {
      const { web, dispatch } = this.props
      web.ListAllBucketPolicies({
          bucketName: this.state.bucket
      }).then(res => {
          let policies = res.policies
          if (policies) dispatch(actions.setPolicies(policies))
      }).catch(err => {
          dispatch(actions.showAlert({type: 'danger', message: err.message}))
      })
  }

  componentWillUnmount() {}

  handleBucketPrefixChange(e) {
      this.setState({ prefix: e.target.value.trim() || '' })
  }

  handlePolicyChange(e) {
      this.setState({ policy: e.target.value })
  }

  handlePolicySubmit(e) {
    e.preventDefault()
    const { web, dispatch } = this.props
    web.SetBucketPolicy({
        bucketName: this.state.bucket,
        prefix: this.state.prefix,
        policy: this.state.policy
    })
    .then(() => dispatch(actions.addPolicy(this.state.bucket, this.state.prefix, this.state.policy)))
    .catch(e => dispatch(actions.showAlert({
        type: 'danger',
        message: e.message,
    })))
  }

  render() {
    return (
      <div className="pmb-list">
        <div className="pmbl-item">
          <input type="text"
                 className="form-control"
                 editable={true}
                 defaultValue={this.state.prefix}
                 onChange={this.handleBucketPrefixChange.bind(this)} />
        </div>

        <div className="pmbl-item">
          <select value={this.state.policy}
                  onChange={this.handlePolicyChange.bind(this)}>
            <option value={READ_ONLY}>Read Only</option>
            <option value={WRITE_ONLY}>Write Only</option>
            <option value={READ_WRITE}>Read and Write</option>
          </select>
        </div>

        <div className="pmbl-item">
          <button className="btn btn-sm btn-block btn-primary" onClick={this.handlePolicySubmit.bind(this)}>Add</button>
        </div>

      </div>
    )
  }
}

export default connect(state => state)(PolicyInput)
