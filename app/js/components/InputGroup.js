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
import connect from '../../../node_modules/react-redux/lib/components/connect'

let InputGroup = ({label, id, name, type, spellCheck, required, autoComplete, align}) => {
    return <div className={"input-group " + align}>
        <input id={id} name={name} className="ig-text" type={type} spellCheck={spellCheck} required={required} autoComplete={autoComplete}/>
        <label className="ig-label">{label}</label>
        <div className="ig-helpers">
            <i></i><i></i>
        </div>
    </div>

}

export default InputGroup 