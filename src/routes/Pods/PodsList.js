import React from 'react'
import PodSegment from './PodSegment'
import NodeSegment from './NodeSegment'
import { Container, Label, Segment, Dimmer, Loader, Grid, Header, Progress, List, Icon, Item, Button } from 'semantic-ui-react'

let socket = null;
let colors = [ "green", "yellow", "red", "purple", "black" ];

class PodList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pods: {},
            nodes: {},
            isLoading: false,
            error: null,
        };

        const url = `${document.location.protocol.replace("http", "ws")}//${location}/bgw`;
        // init client websocket
        socket = new WebSocket("ws://152.66.244.15:3001/bgw");
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

    componentDidUpdate() {
        socket.onmessage = (event) => {
            // console.log('BGW Socket message', event.data);
            const msg = JSON.parse(event.data);
            const data = msg.d;

            let pod;
            switch (msg.t) {
                case "cc":
                    // CLIENT connected
                    this.setState((state) => {
                        let pod = state.pods[data.id];
                        if (!pod) {
                            pod = {
                                app: this,
                                ref: React.createRef(),
                                id: data.id,
                                clients: {},
                                node: state.nodes[data.nid],
                                messages: [],

                                changeLoadGen: (v) => {
                                    socket.send(JSON.stringify({ t:"loadGen", d:{id: data.id, value: v} }))
                                },
                            };
                        }

                        let key = { 0: "measure", 1: "stress" }[data.mode];
                        pod.clients[key] = data;

                        state.pods[data.id] = pod;
                        return {
                            pods: state.pods,
                        }
                    });
                    console.log('* CLIENT connected', msg.d);
                    break;

                case "cd":
                    // CLIENT disconnected
                    this.setState((state) => {
                        let pod = state.pods[data.id];
                        if (!pod) {
                            // ERROR
                        }

                        let key = { 0: "measure", 1: "stress" }[data.mode];
                        let client = pod.clients[key];
                        if (!client) {
                            // ERROR
                        }

                        delete pod.clients[key];

                        state.pods[data.id] = pod;
                        return {
                            pods: state.pods,
                        }
                    });
                    console.log('* CLIENT disconnected', msg.d);
                    break;

                case "m":
                case "lc":
                    // MEASURE from client
                    pod = this.state.pods[data.id];
                    if (pod) {
                        if (pod.ref && pod.ref.current) {
                            pod.ref.current.recv(msg);
                        } else {
                            this.setState((state) => {
                                state.pods[data.id].messages.push(msg);
                                return state
                            });
                        }
                    }
                    break;

                case "nm":
                case "ns":
                case "ni":
                    // MEASURE from node
                    // console.log('* MEASURE', msg.d);
                    let node = this.state.nodes[data.nid];
                    if (!node) {
                        // ERROR
                    } else {
                        node.ref.current.recv(msg);
                    }
                    break;

                case "nc":
                    // NODE connected
                    this.setState((state) => {
                        let node = state.nodes[data.nid];
                        if (!node) {
                            let nextColorIndex = Object.keys(state.nodes).length;
                            node = {
                                app: this,
                                ref: React.createRef(),
                                nid: data.nid,
                                name: data.name,
                                score: data.score,
                                state: data.state,
                                color: colors[nextColorIndex],

                                initMeasure: () => {
                                    socket.send(JSON.stringify({ t:"initMeasure", d:{nid: data.nid} }))
                                },
                            };
                        }

                        state.nodes[data.nid] = node;
                        return {
                            nodes: state.nodes,
                        }
                    });
                    console.log('* NODE connected', msg.d);
                    break;

                case "nd":
                    // NODE connected
                    console.log('* NODE disconnected', msg.d);
                    break;

                case "loaded":
                    // LOAD done
                    console.log('* LOAD done', msg.d);
                    this.setState({ isLoading: false });
                    break;

                default:
                    console.error("Invalid type of message")
            }
        }
    }

    nodesAll(b) {
        console.log(b);
        console.log(this);
        Object.keys(this.state.nodes).forEach(nodeName => {
            this.state.nodes[nodeName].show = b;
        });

        this.setState({ nodes: this.state.nodes })
    }

    nodesAllShow(e) { this.nodesAll(this, true); e.preventDefault(); }
    nodesAllHide(e) { this.nodesAll(this, false); e.preventDefault(); }

    componentDidMount() {
        this.setState({ isLoading: true });


    }

    render() {
        const { pods, nodes, isLoading, error } = this.state;

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

        console.log("RENDER", "pods", pods);

        return (
            <div>
                <Grid columns={2} padded>
                    <Grid.Column width={11}>
                        <h2>Pods connected:</h2>
                        {
                            Object.keys(pods).sort().map((id, i) => (
                                <PodSegment key={id} ref={pods[id].ref} pod={pods[id]} />
                            ))
                        }
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <h2>Nodes in the cluster:</h2>
                        {
                            Object.keys(nodes).sort().map((id, i) => (
                                <NodeSegment key={id} ref={nodes[id].ref} node={nodes[id]} />
                            ))
                        }
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default PodList
