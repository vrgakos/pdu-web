import React from 'react'
import {Table, Button, Icon, Dimmer, Loader} from "semantic-ui-react";

class ClientRow extends React.Component {
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
                <Table.Row>
                    <Dimmer active inverted>
                        <Loader size='small'>Loading</Loader>
                    </Dimmer>
                </Table.Row>
            );
        }

        if (! client) {
            return (
                <Table.Row>

                </Table.Row>
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
            <Table.Row>
                <Table.Cell>
                    #{client.cid}
                </Table.Cell>
                <Table.Cell>
                    {currentState}
                </Table.Cell>
                <Table.Cell>
                    <b>{client.name}</b>
                </Table.Cell>

                <Table.Cell>
                    <b>{lastReport.active}</b>
                </Table.Cell>
                <Table.Cell>
                    <b>{lastReport.desired}</b>
                </Table.Cell>
                <Table.Cell>
                    <b>{lastReport.lastId}</b>
                </Table.Cell>

                <Table.Cell>
                    <Button onClick={() => this.state.client.killClient()} circular color='red' icon='delete' />
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default ClientRow
