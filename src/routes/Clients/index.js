import React from 'react'
import { Switch, Route } from 'react-router-dom'
import ClientList from './ClientList'
import Client from './Client'

const Clients = () => (
    <Switch>
        <Route exact path='/clients' component={ClientList} />
        <Route path='/clients/:name' component={Client} />
    </Switch>
)

export default Clients
