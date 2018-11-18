import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PodList from './PodsList'
import Pod from './Pod'

const Pods = () => (
    <Switch>
        <Route exact path='/pods' component={PodList} />
        <Route path='/pods/:namespace/:name' component={Pod} />
    </Switch>
)

export default Pods
