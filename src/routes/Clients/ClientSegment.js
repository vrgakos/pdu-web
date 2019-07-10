import React from 'react'
import Api from '../../api'
import { Link } from 'react-router-dom'
import {Dimmer, Grid, Header, Icon, Label, Button, Loader, Progress, Segment} from "semantic-ui-react";
import Gauge from "react-svg-gauge";
import {Slider} from "react-semantic-ui-range";

class ClientSegment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            client: props.client,
            lastReport: { active: NaN, desired: NaN, lastId: NaN },
            connected: true,
            isLoading: true,
            error: null,
        };
    }

    recvReport(msg) {
        this.setState((state) => {
            state.isLoading = false;
            state.lastReport = msg;
            return state;
        })
    }

    disconnected() {
        this.setState((state) => {
            state.connected = false;
            return state;
        })
    }

    componentDidMount() {
        //this.setState({ isLoading: true });
        /*Api.getOne(this.state.namespace, this.state.name).then(result => {
            this.setState({
                pod: result,
                isLoading: false
            })
            console.log('result')
            console.log(result)
        }).catch(error => {
            this.setState({
                error,
                isLoading: false
            })
            console.log('error')
            console.log(error)
        })*/
    }

    render() {
        const { client, lastReport, isLoading, error } = this.state;

        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return (
                <Segment>
                    <Dimmer active inverted>
                        <Loader size='small'>Loading</Loader>
                    </Dimmer>
                </Segment>
            );
        }

        if (! client) {
            return (
                <p>ASD</p>
            );
        }

        let currentState = "unknown";
        if (lastReport.running) {
            currentState = "running"
        } else {
            currentState = "stopped"
        }

        if (!this.state.connected) {
            currentState = "disconnected"
        }

        return (
            <Segment>
                #{client.cid} - <b>{client.name}</b> - {currentState}
                <div>Active connections / desired connections: {lastReport.active} / {lastReport.desired}</div>
                <Button onClick={() => this.state.client.killClient()} floated='right'>Kill</Button>
            </Segment>
        );
    }
}

export default ClientSegment
