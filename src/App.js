import React from 'react'
import { Button, Segment, Grid, Header, List, Icon, Item } from 'semantic-ui-react'

import { CustomMessage, Navbar } from 'components'
import { Home, Pods } from 'routes'

import { Switch, Route, Link } from 'react-router-dom'

import 'styling/semantic.less'

const leftItems = [
  {
    as: Link,
    to: '/pods',
    content: 'Pods',
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
            <Route path='/pods' component={Pods} />
        </Switch>
    </main>
</div>
)

export default App
