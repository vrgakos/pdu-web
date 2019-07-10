import React from 'react'

import { CustomMessage, Navbar } from 'components'
import { Home, Clients } from 'routes'

import { Switch, Route, Link } from 'react-router-dom'

import 'styling/semantic.less'

const leftItems = [
  {
    as: Link,
    to: '/clients',
    content: 'Clients',
    icon: 'book',
    key: 'docs',
  },
];

const rightItems = [
  {
    as: Link,
    content: 'Home',
    to: '/',
    icon: 'home',
  },
  {
    as: Link,
    content: 'Refresh',
    to: '#',
    icon: 'redo',
    disabled: true
  },
];

const App = () => (
<div>
    <Navbar leftItems={leftItems} rightItems={rightItems} />
    <main>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/clients' component={Clients} />
        </Switch>
    </main>
</div>
)

export default App
