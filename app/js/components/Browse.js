/*
 * Minio Browser (C) 2016 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import classNames from 'classnames'
import browserHistory from 'react-router/lib/browserHistory'
import connect from 'react-redux/lib/components/connect'
import humanize from 'humanize'
import Moment from 'moment'
import Modal from 'react-bootstrap/lib/Modal'
import ModalBody from 'react-bootstrap/lib/ModalBody'
import ModalHeader from 'react-bootstrap/lib/ModalHeader'
import ProgressBar from 'react-bootstrap/lib/ProgressBar'
import Alert from 'react-bootstrap/lib/Alert'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import Scrollbars from 'react-custom-scrollbars/lib/Scrollbars'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import InputGroup from '../components/InputGroup'

import logo from '../../img/logo.svg'

import * as actions from '../actions'
import * as utils from '../utils'
import * as mime from '../mime'
import { minioBrowserPrefix } from '../constants'

let SideBar = ({ visibleBuckets, loadBucket, currentBucket, selectBucket, searchBuckets, landingPage, sidebarStatus, clickOutside, showPolicy }) => {
    let ClickOutHandler = require('react-onclickout');

    const list = visibleBuckets.map((bucket, i) => {
        return <li className={classNames({'active': bucket === currentBucket})} key={i} onClick={(e) => selectBucket(e, bucket)}>
            <a href="" className={classNames({'fesli-loading': bucket === loadBucket})}>
                {bucket}
                {bucket === loadBucket ? <span className="loading l-bucket"><i /></span> : ''}
            </a>

            <i className="fa fa-ellipsis-h" onClick={showPolicy}></i>
        </li>
    })

    return (
        <ClickOutHandler onClickOut={clickOutside}>
            <div className={classNames({'fe-sidebar': true, 'toggled': sidebarStatus})}>
                <div className="fes-header clearfix hidden-sm hidden-xs">
                    <a href="" onClick={landingPage}>
                        <img src={logo} alt=""/>
                        <h2 className="fe-h2">Minio Browser</h2>
                    </a>
                </div>

                <div className="fes-list">
                    <div className="fesl-search">
                        <input type="text" onChange={searchBuckets} placeholder="Search Buckets..."/>
                        <i></i>
                    </div>
                    <div className="fesl-inner">
                        <Scrollbars
                            renderScrollbarVertical={props => <div className="scrollbar-vertical"/>}
                        >
                            <ul>
                                {list}
                            </ul>
                        </Scrollbars>
                    </div>
                </div>

                <div className="fes-host">
                    <i className="fa fa-globe"></i>
                    <a href="/">{window.location.host}</a>
                </div>
            </div>
        </ClickOutHandler>
    )
}
SideBar = connect(state => state) (SideBar)

let ObjectsList = ({objects, currentPath, selectPrefix, dataType, removeObject, loadPath }) => {
    const list = objects.map((object, i) => {
        let size = object.name.endsWith('/') ? '-' : humanize.filesize(object.size)
        let lastModified = object.name.endsWith('/') ? '-' : Moment(object.lastModified).format('lll')
        let loadingClass = loadPath === `${currentPath}${object.name}` ? 'fesl-loading' : ''
        return (
            <div key={i} className={"fesl-row " + loadingClass} data-type={dataType(object.name, object.contentType)}>

                {loadPath === `${currentPath}${object.name}` ? <span className="loading l-listing"><i /></span> : ''}

                <div className="fesl-item fi-name">
                    <a href="" onClick={(e) => selectPrefix(e, `${currentPath}${object.name}`)}>
                        {object.name}
                    </a>
                </div>
                <div className="fesl-item fi-size">{size}</div>
                <div className="fesl-item fi-modified">{lastModified}</div>
            </div>
        )
    })
    return (
        <div>{list}</div>
    )
}
ObjectsList = connect(state => state) (ObjectsList)

let Path = ({currentBucket, currentPath, selectPrefix}) => {
    let dirPath = []
    let path = currentPath.split('/').map((dir, i) => {
        dirPath.push(dir)
        let dirPath_ = dirPath.join('/') + '/'
        return <span key={i}><a href="" onClick={(e) => selectPrefix(e, dirPath_)}>{dir}</a></span>
    })
    return (
        <h2 className="fe-h2">
            <span className="main">
               <a onClick={(e) => selectPrefix(e, '')} href="">
                  {currentBucket}
               </a>
            </span>
            {path}
        </h2>
    )
}
Path = connect(state => state) (Path)

let ConfirmModal = ({baseClass, text, okText, okIcon, cancelText, cancelIcon, okHandler, cancelHandler}) => {
    return <Modal animation={false} show={true} className={baseClass}>
        <ModalBody>
            <div className="cm-text">{text}</div>
            <div className="cm-footer">
                <button className="cmf-btn" onClick={okHandler}><i className={okIcon}></i>{okText}</button>
                <button className="cmf-btn" onClick={cancelHandler}><i className={cancelIcon}></i>{cancelText}</button>
            </div>
        </ModalBody>
    </Modal>
}
ConfirmModal = connect(state => state) (ConfirmModal)

// removed below i tag's onClick in favour of parent a href
let BrowserUpdate = ({latestUiVersion}) => {
  if (latestUiVersion === currentUiVersion) return <noscript></noscript>
  return  <li className="hidden-xs hidden-sm">
            <a href="">
                <OverlayTrigger placement="left" overlay={<Tooltip id="tt-version-update">New update available. Click to refresh.</Tooltip>}>
                    <i className="fa fa-refresh"></i>
                </OverlayTrigger>
            </a>
          </li>
}
BrowserUpdate = connect(state => state) (BrowserUpdate)

export default class Browse extends React.Component {
    componentDidMount() {
        const { web, dispatch, currentBucket } = this.props
        web.StorageInfo()
            .then(res => {
                let storageInfo = Object.assign({}, {
                    total: res.storageInfo.Total,
                    free: res.storageInfo.Free
                })
                storageInfo.used = storageInfo.total - storageInfo.free
                dispatch(actions.setStorageInfo(storageInfo))
                return web.ServerInfo()
            })
            .then(res => {
                let serverInfo = Object.assign({}, {
                    version: res.MinioVersion,
                    memory: res.MinioMemory,
                    platform: res.MinioPlatform,
                    runtime: res.MinioRuntime,
                    envVars: res.MinioEnvVars
                })
                dispatch(actions.setServerInfo(serverInfo))
            })
            .catch(err => {
                dispatch(actions.showAlert({type: 'danger', message: err.message}))
            })
    }

    componentWillMount() {
      const { dispatch } = this.props
      // Clear out any stale message in the alert of Login page
      dispatch(actions.showAlert({type: 'danger', message: ''}))
      web.ListBuckets()
          .then(res => {
            let buckets
            if (!res.buckets) buckets = []
            else buckets = res.buckets.map(bucket => bucket.name)
            if (buckets.length) {
              dispatch(actions.setBuckets(buckets))
              dispatch(actions.setVisibleBuckets(buckets))
              if (location.pathname === minioBrowserPrefix || location.pathname === minioBrowserPrefix + '/') {
                browserHistory.push(utils.pathJoin(buckets[0]))
              }
            }
          })
      this.history = browserHistory.listen(({pathname}) => {
        if (pathname === `${minioBrowserPrefix}/login`) return // FIXME: better organize routes and remove this
        if (!pathname.endsWith('/')) pathname += '/'
        if (pathname === minioBrowserPrefix + '/') {
          dispatch(actions.setCurrentBucket(''))
          dispatch(actions.setCurrentPath(''))
          dispatch(actions.setObjects([]))
          return
        }
        let obj = utils.pathSlice(pathname)
        dispatch(actions.selectBucket(obj.bucket, obj.prefix))
      })
    }

    componentWillUnmount() {
      this.history()
    }

    selectBucket(e, bucket) {
        e.preventDefault()
        if (bucket === this.props.currentBucket) return
        browserHistory.push(utils.pathJoin(bucket))
    }

    searchBuckets(e) {
        e.preventDefault()
        let { buckets } = this.props
        this.props.dispatch(actions.setVisibleBuckets(buckets.filter(bucket => bucket.indexOf(e.target.value) > -1)))
    }

    selectPrefix(e, prefix) {
        const { dispatch, currentPath, web, currentBucket } = this.props
        e.preventDefault()
        if (prefix.endsWith('/') || prefix === '') {
            if (prefix === currentPath) return
            browserHistory.push(utils.pathJoin(currentBucket, prefix))
        } else {
            window.location = `${window.location.origin}/minio/download/${currentBucket}/${prefix}?token=${localStorage.token}`
        }
    }

    makeBucket(e) {
        e.preventDefault()
        const bucketName = this.refs.makeBucketRef.value
        this.refs.makeBucketRef.value = ''
        const { web, dispatch } = this.props
        this.hideMakeBucketModal()
        web.MakeBucket({bucketName})
            .then(() => {
              dispatch(actions.addBucket(bucketName))
              dispatch(actions.selectBucket(bucketName))
            })
            .catch(err => dispatch(actions.showAlert({
                type: 'danger',
                message: err.message
            })))
    }

    hideMakeBucketModal() {
        const { dispatch } = this.props
        dispatch(actions.hideMakeBucketModal())
    }

    showMakeBucketModal(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.showMakeBucketModal())
    }

    showAbout(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.showAbout())
    }

    hideAbout() {
        const { dispatch } = this.props
        dispatch(actions.hideAbout())
    }

    showBucketPolicy() {
        const { dispatch } = this.props
        dispatch(actions.showBucketPolicy())
    }

    hideBucketPolicy(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.hideBucketPolicy())
    }

    uploadFile(e) {
        e.preventDefault()
        const { dispatch, upload } = this.props
        if (upload.inProgress) {
            dispatch(actions.showAlert({
                type: 'danger',
                message: 'An upload already in progress'
            }))
            return
        }
        let file = e.target.files[0]
        e.target.value = null
        this.xhr = new XMLHttpRequest ()
        dispatch(actions.uploadFile(file, this.xhr))
    }

    removeObject(e, object) {
      const { web, dispatch, currentBucket, currentPath } = this.props
      web.RemoveObject({
        bucketName: currentBucket,
        objectName: currentPath + object.name
      })
      .then(() => dispatch(actions.selectPrefix(currentPath)))
      .catch(e => dispatch(actions.showAlert({
        type: 'danger',
        message: e.message
      })))
    }

    uploadAbort(e) {
        e.preventDefault()
        const { dispatch } = this.props
        this.xhr.abort()
        dispatch (actions.setUpload({inProgress: false, percent: 0}))
        this.hideAbortModal(e)
    }

    showAbortModal(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch (actions.setShowAbortModal(true))
    }

    hideAbortModal(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.setShowAbortModal(false))
    }

    hideAlert() {
        const { dispatch } = this.props
        dispatch(actions.hideAlert())
    }

    dataType(name, contentType) {
      return mime.getDataType(name, contentType)
    }

    sortObjectsByName(e) {
        const { dispatch, objects, sortNameOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsByName(objects, !sortNameOrder)))
        dispatch (actions.setSortNameOrder(!sortNameOrder))
    }

    sortObjectsBySize() {
        const { dispatch, objects, sortSizeOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsBySize(objects, !sortSizeOrder)))
        dispatch (actions.setSortSizeOrder(!sortSizeOrder))
    }

    sortObjectsByDate() {
        const { dispatch, objects, sortDateOrder } = this.props
        dispatch (actions.setObjects(utils.sortObjectsByDate(objects, !sortDateOrder)))
        dispatch (actions.setSortDateOrder(!sortDateOrder))
    }

    logout(e) {
        const { web } = this.props
        e.preventDefault()
        web.Logout()
        browserHistory.push(`${minioBrowserPrefix}/login`)
    }

    landingPage(e) {
        e.preventDefault()
        this.props.dispatch(actions.selectBucket(this.props.buckets[0]))
    }

    fullScreen(e) {
        e.preventDefault()
        let el = document.documentElement
        if (el.requestFullscreen) {
            el.requestFullscreen()
        }
        if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen()
        }
        if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen()
        }
        if (el.msRequestFullscreen) {
            el.msRequestFullscreen()
        }
    }

    multiSelect(e) {
        alert('yes')
    }

    toggleSidebar(status){
        this.props.dispatch(actions.setSidebarStatus(status))
    }

    hideSidebar(event){
        let e = event || window.event;

        // Support all browsers.
        let target = e.srcElement || e.target;
        if (target.nodeType === 3) // Safari support.
            target = target.parentNode;

        let targetID = target.id;
        if (!(targetID === 'mh-trigger')) {
            this.props.dispatch(actions.setSidebarStatus(false))
        }
    }

    showSettings(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.showSettings())
        let accessKeyEnv = ''
        let secretKeyEnv = ''
        this.props.serverInfo.envVars.forEach(envVar => {
            let keyVal = envVar.split('=')
            if (keyVal[0] == 'MINIO_ACCESS_KEY'){
                accessKeyEnv = keyVal[1]
            } else if (keyVal[0] == 'MINIO_SECRET_KEY') {
                secretKeyEnv = keyVal[1]
            }
        })
        if (accessKeyEnv != '' || secretKeyEnv != '') {
            dispatch(actions.setSettings({accessKey: accessKeyEnv, secretKey: secretKeyEnv, keysReadOnly: true}))
        } else {
            web.GetAuth()
                .then(data => {
                    dispatch(actions.setSettings({accessKey: data.accessKey, secretKey: data.secretKey}))
                })
        }
    }

    hideSettings(e) {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(actions.setSettings({accessKey:'', secretKey:'', secretKeyVisible: false}))
        dispatch(actions.hideSettings())
    }

    accessKeyChange(e) {
      const { dispatch } = this.props
      dispatch(actions.setSettings({accessKey: e.target.value}))
    }

    secretKeyChange(e) {
      const { dispatch } = this.props
      dispatch(actions.setSettings({secretKey: e.target.value}))
    }

    secretKeyVisible(secretKeyVisible) {
      const { dispatch } = this.props
      dispatch(actions.setSettings({secretKeyVisible}))
    }

    generateAuth(e) {
      e.preventDefault()
      const { dispatch } = this.props
      web.GenerateAuth()
        .then(data => {
          dispatch(actions.setSettings({secretKeyVisible: true}))
          dispatch(actions.setSettings({accessKey: data.accessKey, secretKey: data.secretKey}))
        })
    }

    setAuth(e) {
      e.preventDefault()
      const { web, dispatch } = this.props
      let accessKey = document.getElementById('accessKey').value
      let secretKey = document.getElementById('secretKey').value
      web.SetAuth({accessKey, secretKey})
        .then(data => {
          dispatch(actions.setSettings({accessKey:'', secretKey:'', secretKeyVisible: false}))
          dispatch(actions.hideSettings())
          dispatch(actions.showAlert({
            type: 'success',
            message: 'Changed credentials'
          }))
        })
        .catch(err => {
          dispatch(actions.setSettings({accessKey:'', secretKey:'', secretKeyVisible: false}))
          dispatch(actions.hideSettings())
          dispatch(actions.showAlert({
            type: 'danger',
            message: err.message
          }))
        })
    }

    render() {
        const { total, free } = this.props.storageInfo
        const { showMakeBucketModal, showAbortModal, upload, alert, sortNameOrder, sortSizeOrder, sortDateOrder, showAbout, showBucketPolicy, showSettings, settings } = this.props
        const { version, memory, platform, runtime, envVars } = this.props.serverInfo
        const { sidebarStatus } = this.props

        let progressBar = ''
        let percent = (upload.loaded / upload.total) * 100
        if (upload.inProgress) {
            progressBar = <div className="alert progress animated fadeInUp alert-info">
                <button type="button" className="close" onClick={this.showAbortModal.bind(this)}>
                    <span>&times;</span>
                </button>
                <div className="text-center">
                    <small>{upload.filename}</small>
                </div>
                <ProgressBar now={percent}/>
                <div className="text-center">
                    <small>{humanize.filesize(upload.loaded)} ({percent.toFixed(2)} %)</small>
                </div>
            </div>
        }
        let alertBox = <Alert className={classNames({
                                          'alert': true,
                                          'animated': true,
                                          'fadeInDown': alert.show,
                                          'fadeOutUp': !alert.show
                                        })} bsStyle={alert.type} onDismiss={this.hideAlert.bind(this)}>
                            <div className='text-center'>
                                {alert.message}
                            </div>
                        </Alert>
        // Make sure you don't show a fading out alert box on the initial web-page load.
        if (!alert.message) alertBox = ''
        let abortModal = ''
        let baseClass = classNames({'abort-upload': true})
        let okIcon = classNames({'fa': true, 'fa-stop': true})
        let cancelIcon = classNames({'fa': true, 'fa-play': true})
        if (showAbortModal) {
            abortModal = <ConfirmModal
                baseClass={baseClass}
                text="Abort the upload in progress?"
                okText='Abort'
                okIcon={okIcon}
                cancelText='Continue'
                cancelIcon={cancelIcon}
                okHandler={this.uploadAbort.bind(this)}
                cancelHandler={this.hideAbortModal.bind(this)}>
            </ConfirmModal>
        }
        let signoutTooltip = <Tooltip id="tt-sign-out">Sign out</Tooltip>
        let uploadTooltip = <Tooltip id="tt-upload-file">Upload file</Tooltip>
        let makeBucketTooltip = <Tooltip id="tt-create-bucket">Create bucket</Tooltip>

        let used = total - free
        let usedPercent = (used / total) * 100+'%'
        let freePercent = free * 100 / total
        return (
            <div className={classNames({'file-explorer': true, 'toggled': sidebarStatus})}>
                {abortModal}
                <SideBar landingPage={this.landingPage.bind(this)}
                            searchBuckets={this.searchBuckets.bind(this)}
                            selectBucket={this.selectBucket.bind(this)}
                            clickOutside={this.hideSidebar.bind(this)}
                            showPolicy={this.showBucketPolicy.bind(this)}/>

                <div className="fe-body">
                    {alertBox}

                    <header className="mobile-header hidden-lg hidden-md">
                        <div id="mh-trigger" className={'mh-trigger '+ (classNames({'mht-toggled': sidebarStatus}))} onClick={this.toggleSidebar.bind(this, !sidebarStatus)}>
                            <div className="mht-lines">
                                <div className="top"></div>
                                <div className="center"></div>
                                <div className="bottom"></div>
                            </div>
                        </div>

                        <img className="mh-logo" src={logo} alt=""/>
                    </header>

                    <header className="fe-header">
                        <Path selectPrefix={this.selectPrefix.bind(this)}/>

                        <div className="feh-usage">
                            <div className="fehu-chart">
                                <div style={{width: usedPercent}}></div>
                            </div>

                            <ul>
                                <li>Used: {humanize.filesize(total - free)}</li>
                                <li className="pull-right">Free: {humanize.filesize(total - used)}</li>
                            </ul>
                        </div>

                        <ul className="feh-actions">
                            <BrowserUpdate />
                            <li>
                                <Dropdown pullRight id="top-right-menu">
                                    <Dropdown.Toggle noCaret>
                                        <i className="fa fa-reorder"></i>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="dm-right">
                                        <li>
                                            <a target="_blank" href="https://github.com/minio/miniobrowser">Github <i className="fa fa-github"></i></a>
                                        </li>
                                        <li>
                                            <a href="" onClick={this.fullScreen.bind(this)}>Fullscreen <i className="fa fa-expand"></i></a>
                                        </li>
                                        <li>
                                            <a target="_blank" href="https://gitter.im/minio/minio">Ask for help <i className="fa fa-question-circle"></i></a>
                                        </li>
                                        <li>
                                            <a href="" onClick={this.showAbout.bind(this)}>About <i className="fa fa-info-circle"></i></a>
                                        </li>
                                        <li>
                                            <a href="" onClick={this.showSettings.bind(this)}>Settings <i className="fa fa-cog"></i></a>
                                        </li>
                                        <li>
                                            <a href="" onClick={this.logout.bind(this)}>Sign Out <i className="fa fa-sign-out"></i></a>
                                        </li>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </li>
                        </ul>
                    </header>
                    <div className="feb-container">
                        <header className="fesl-row" data-type="folder">
                            <div className="fesl-item fi-name" onClick={this.sortObjectsByName.bind(this)} data-sort="name">
                              Name
                              <i className={classNames({
                                  'fesli-sort': true,
                                  'fa': true,
                                  'fa-sort-alpha-desc': sortNameOrder,
                                  'fa-sort-alpha-asc': !sortNameOrder
                                })}/>
                            </div>
                            <div className="fesl-item fi-size" onClick={this.sortObjectsBySize.bind(this)} data-sort="size">
                              Size
                              <i className={classNames({
                                  'fesli-sort': true,
                                  'fa': true,
                                  'fa-sort-amount-desc': sortSizeOrder,
                                  'fa-sort-amount-asc': !sortSizeOrder
                                })}/>
                            </div>
                            <div className="fesl-item fi-modified" onClick={this.sortObjectsByDate.bind(this)} data-sort="last-modified">
                              Last Modified
                              <i className={classNames({
                                  'fesli-sort': true,
                                  'fa': true,
                                  'fa-sort-numeric-desc': sortDateOrder,
                                  'fa-sort-numeric-asc': !sortDateOrder
                                })}/>
                            </div>
                        </header>
                    </div>

                    <div className="feb-container">
                        <ObjectsList removeObject={this.removeObject.bind(this)} dataType={this.dataType.bind(this)} selectPrefix={this.selectPrefix.bind(this)}/>
                    </div>
                    {progressBar}

                    <Dropdown dropup className="feb-actions" id="fe-action-toggle">
                        <Dropdown.Toggle noCaret className="feba-toggle">
                            <span><i className="fa fa-plus"></i></span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <OverlayTrigger placement="left" overlay={uploadTooltip}>
                                <a href="#" className="feba-btn feba-upload">
                                    <input type="file" onChange={this.uploadFile.bind(this)} style={{display:'none'}}
                                           id="file-input"></input>
                                    <label htmlFor="file-input">
                                        <i style={{cursor:'pointer'}} className="fa fa-cloud-upload"></i>
                                    </label>
                                </a>
                            </OverlayTrigger>
                            <OverlayTrigger placement="left" overlay={makeBucketTooltip}>
                                <a href="#" className="feba-btn feba-bucket"
                                   onClick={this.showMakeBucketModal.bind(this)}>
                                    <i className="fa fa-hdd-o"></i>
                                </a>
                            </OverlayTrigger>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Modal className="feb-modal" animation={false} show={showMakeBucketModal} onHide={this.hideMakeBucketModal.bind(this)}>

                        <button className="close" onClick={this.hideMakeBucketModal.bind(this)}><span>&times;</span></button>

                        <ModalBody>
                            <form onSubmit={this.makeBucket.bind(this)}>
                                <div className="create-bucket">
                                    <input type="text" ref="makeBucketRef" placeholder="Bucket Name" autoFocus/>
                                    <i></i>
                                </div>
                            </form>
                        </ModalBody>
                    </Modal>

                    <Modal className="about-modal modal-dark" show={showAbout} onHide={this.hideAbout.bind(this)}>
                        <div className="am-inner">
                            <div className="ami-item hidden-xs">
                                <a href="https://minio.io" target="_blank">
                                   <img className="amii-logo" src={logo} alt=""/>
                                </a>
                            </div>
                            <div className="ami-item">
                                <ul className="amii-list">
                                    <li>
                                        <div>Version</div>
                                        <small>{version}</small>
                                    </li>
                                    <li>
                                        <div>Memory</div>
                                        <small>{memory}</small>
                                    </li>
                                    <li>
                                        <div>Platform</div>
                                        <small>{platform}</small>
                                    </li>
                                    <li>
                                        <div>Runtime</div>
                                        <small>{runtime}</small>
                                    </li>
                                </ul>

                                <div className="modal-footer p-0 p-t-10 text-left">
                                    <a href="" className="mf-btn" onClick={this.hideAbout.bind(this)}>
                                        <i className="fa fa-check"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <Modal className="policy-modal" show={showBucketPolicy} onHide={this.hideBucketPolicy.bind(this)}>
                        <ModalHeader>
                            Bucket Policy
                            <small>Cras justo odio, dapibus ac facilisis in, egestas eget quam.</small>

                            <a href="" className="mh-close" onClick={this.hideBucketPolicy.bind(this)}>
                                <i className="fa fa-times"></i>
                            </a>
                        </ModalHeader>

                        <div className="pm-body">
                            <header className="pmb-list">
                                <div className="pmbl-item">
                                    <input type="text" className="form-control" value="bucket"/>
                                </div>
                                <div className="pmbl-item">
                                    <select className="form-control">
                                        <option>Read Only</option>
                                        <option>Write Only</option>
                                        <option>Read and Write</option>
                                    </select>
                                </div>
                                <div className="pmbl-item">
                                    <a href="" className="btn btn-sm btn-block btn-primary">Add</a>
                                </div>
                            </header>

                            <div className="pmb-list">
                                <div className="pmbl-item">bucket/photos</div>
                                <div className="pmbl-item">
                                    <select className="form-control">
                                        <option>Read Only</option>
                                        <option>Write Only</option>
                                        <option>Read and Write</option>
                                    </select>
                                </div>
                                <div className="pmbl-item">
                                    <a href="" className="btn btn-sm btn-block btn-danger">Remove</a>
                                </div>
                            </div>

                            <div className="pmb-list">
                                <div className="pmbl-item">bucket/photos</div>
                                <div className="pmbl-item">
                                    <select className="form-control">
                                        <option>Read Only</option>
                                        <option>Write Only</option>
                                        <option>Read and Write</option>
                                    </select>
                                </div>
                                <div className="pmbl-item">
                                    <a href="" className="btn btn-sm btn-block btn-danger">Remove</a>
                                </div>
                            </div>

                            <div className="pmb-list">
                                <div className="pmbl-item">bucket/photos</div>
                                <div className="pmbl-item">
                                    <select className="form-control">
                                        <option>Read Only</option>
                                        <option>Write Only</option>
                                        <option>Read and Write</option>
                                    </select>
                                </div>
                                <div className="pmbl-item">
                                    <a href="" className="btn btn-sm btn-block btn-danger">Remove</a>
                                </div>
                            </div>

                            <div className="pmb-list">
                                <div className="pmbl-item">bucket/photos</div>
                                <div className="pmbl-item">
                                    <select className="form-control">
                                        <option>Read Only</option>
                                        <option>Write Only</option>
                                        <option>Read and Write</option>
                                    </select>
                                </div>
                                <div className="pmbl-item">
                                    <a href="" className="btn btn-sm btn-block btn-danger">Remove</a>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <Modal bsSize="sm" show={showSettings}>
                        <ModalHeader>
                            Change Password
                        </ModalHeader>
                        <ModalBody className="m-t-20">

                            <InputGroup value={settings.accessKey} onChange={this.accessKeyChange.bind(this)} id="accessKey" label="Access Key" name="accesskey" type="text" spellCheck="false" required="required" autoComplete="false" align="ig-left" readonly={settings.keysReadOnly} ></InputGroup>

                            <div className="p-relative">
                                <InputGroup value={settings.secretKey} onChange={this.secretKeyChange.bind(this)} id="secretKey" label="Secret Key" name="accesskey" type={settings.secretKeyVisible ? "text" : "password"} spellCheck="false" required="required" autoComplete="false" align="ig-left" readonly={settings.keysReadOnly}></InputGroup>
                                <i onClick={this.secretKeyVisible.bind(this, !settings.secretKeyVisible)} className={"toggle-password fa fa-eye " + (settings.secretKeyVisible ? "toggled" : "")} />
                            </div>

                            <div className="clearfix" />
                        </ModalBody>

                        <div className="modal-footer clearfix p-t-0">
                            <OverlayTrigger placement="bottom" overlay={<Tooltip id="tt-password-generate">Generate Keys</Tooltip>}>
                                <a href="" className="mf-btn mf-highlight" onClick={this.generateAuth.bind(this)}>
                                    <i className="fa fa-repeat"></i>
                                </a>
                            </OverlayTrigger>

                            <a href="" className="mf-btn" onClick={this.setAuth.bind(this)}>
                                <i className="fa fa-check"></i>
                            </a>
                            <a href="" className="mf-btn" onClick={this.hideSettings.bind(this)}>
                                <i className="fa fa-times"></i>
                            </a>
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
}
