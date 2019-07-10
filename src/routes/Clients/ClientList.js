import React from 'react'
import ClientRow from './ClientRow'
import { Dimmer, Loader, Grid, Form, Button, Icon, Table } from 'semantic-ui-react'

let socket = null;

class PodList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clients: {},
            isLoading: false,
            error: null,

            control: {
                running: false,
                host: '127.0.0.1',
                port: NaN,
                desired: NaN,
                stepUp: NaN,
            }
        };

        this.controlForm = {
            host: React.createRef(),
            port: React.createRef(),
            desired: React.createRef(),
            stepUp: React.createRef(),
        }
    }

    connect() {
        //const url = `${document.location.protocol.replace("http", "ws")}//${location}/bgw`;
        // init client websocket
        //socket = new WebSocket("ws://192.168.36.221:4001/bgw");
        socket = new WebSocket("ws://127.0.0.1:4001/bgw");
        socket.onopen = (event) => {
            console.log('BGW Socket opened');
            //socket.send("HELLO-FROM-BROWSER")
        };

        socket.onclose = (event) => {
            console.log('BGW Socket closed');
        };

        socket.onerror = (event) => {
            console.log('BGW Socket error', event);
        };
    }

    send(data) {
        socket.send(JSON.stringify(data));
    }

    sendControl(controlData) {
        this.send({ t: 'control', d: controlData });
    }

    componentDidUpdate() {
        if (!socket) {
            this.connect()
        }

        socket.onmessage = (event) => {
             //console.log('BGW Socket message', event.data);
            const msg = JSON.parse(event.data);
            const data = msg.d;

            switch (msg.t) {
                case "control":
                    this.setState({
                        control: data
                    });
                    Object.keys(data).forEach((name) => {
                       if (this.controlForm[name] && this.controlForm[name].current) {
                           this.controlForm[name].current.value = data[name];
                       }
                    });
                    break;

                case "cc":
                    // CLIENT connected
                    this.setState((state) => {
                        let client = state.clients[data.cid];
                        if (!client) {
                            let cid = data.cid
                            client = {
                                app: this,
                                ref: React.createRef(),
                                cid: cid,
                                name: data.name,

                                killClient: () => {
                                    this.send({ t: 'kill', d: { cid: cid } })
                                }
                            };
                        }

                        state.clients[data.cid] = client;
                        return {
                            clients: state.clients,
                        }
                    });
                    console.log('* CLIENT connected', msg.d);
                    break;

                case "cd":
                    // CLIENT disconnected
                    this.setState((state) => {
                        //delete state.clients[data.cid];
                        let client = this.state.clients[data.cid];
                        if (client) {
                            client.ref.current.disconnected(data);
                        }
                        return {
                            clients: state.clients,
                        }
                    });
                    console.log('* CLIENT disconnected', msg.d);
                    break;

                case "cr":
                    // CLIENT report
                    //console.log('* CLIENT report', msg.d);
                    let client = this.state.clients[data.cid];
                    if (client) {
                        client.ref.current.recvReport(data);
                    }

                    break;

                case "loaded":
                    // LOAD done
                    console.log('* LOAD done', msg.d);
                    this.setState({ isLoading: false });
                    break;

                default:
                    console.error("* Invalid type of message")
            }
        }
    }

    componentDidMount() {
        this.setState({ isLoading: true });
    }


    handleFormEdit = (e) => {
        console.log(e);
        console.log(e.target);
        console.log(e.target.name);
        console.log(e.target.value);

        let name = e.target.name;
        let value = e.target.value;

        if (['port', 'desired', 'stepUp'].indexOf(name) > -1) {
            value = parseInt(value, 10);
            if (isNaN(value)) {
                value = this.state.control[name];
                this.controlForm[name].current.value = value;
            }
        }

        this.setState((state) => {
            let control = state.control;
            control[name] = value;

            if (['desired', 'stepUp'].indexOf(name) > -1) {
                this.sendControl(control);
            }

            return {
                control: control,
            }
        })
    };

    handleStop = () => {
      this.setState((state) => {
          let control = state.control;
          control.running = false;

          this.sendControl(control);
          return {
              control: control,
          }
      });
    };

    handleStart = () => {
        this.setState((state) => {
            let control = state.control;
            control.running = true;

            this.sendControl(control);
            return {
                control: control,
            }
        });

    };


    render() {
        const { clients, control, isLoading, error } = this.state;

        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return (
                <Dimmer active inverted>
                    <Loader size='massive'>Loading</Loader>
                </Dimmer>
            );
        }

        let controlButtonStartStop =
            <Button icon labelPosition='right' floated='right' color='green' onClick={this.handleStart}>
                <Icon name='play' />
                Start
            </Button>;

        if (control.running) {
            controlButtonStartStop =
                <Button icon labelPosition='right' floated='right' color='red' onClick={this.handleStop}>
                    <Icon name='stop' />
                    Stop
                </Button>;
        }

        console.log("RENDER", "clients", clients);

        return (
            <div>
                <Grid columns={2} padded>
                    <Grid.Column width={11}>
                        <h2>Clients connected:</h2>
                        {
                            <Table singleLine>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>ID</Table.HeaderCell>
                                        <Table.HeaderCell>State</Table.HeaderCell>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell>Active</Table.HeaderCell>
                                        <Table.HeaderCell>Desired</Table.HeaderCell>
                                        <Table.HeaderCell>LastId</Table.HeaderCell>
                                        <Table.HeaderCell>Actions</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {
                                        Object.keys(clients).sort().map((id, i) => (
                                            <ClientRow key={id} ref={clients[id].ref} client={clients[id]}/>
                                        ))
                                    }
                                </Table.Body>
                            </Table>
                        }
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <h2>
                            Control panel:
                            {controlButtonStartStop}
                        </h2>
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Field disabled={control.running}>
                                    <label>Server host</label>
                                    <input name='host' ref={this.controlForm.host} onBlur={this.handleFormEdit} />
                                </Form.Field>
                                <Form.Field disabled={control.running}>
                                    <label>Server port</label>
                                    <input name='port' ref={this.controlForm.port} onBlur={this.handleFormEdit} />
                                </Form.Field>
                            </Form.Group>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <label>Desired connections</label>
                                    <input name='desired' ref={this.controlForm.desired} onBlur={this.handleFormEdit} />
                                </Form.Field>
                                <Form.Field>
                                    <label>Step up connections</label>
                                    <input name='stepUp' ref={this.controlForm.stepUp} onBlur={this.handleFormEdit} />
                                </Form.Field>
                            </Form.Group>
                        </Form>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default PodList
