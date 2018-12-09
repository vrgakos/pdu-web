import Moment from 'moment'
import React from 'react'
import {Dimmer, Grid, Header, Icon, Label, List, Loader, Progress, Segment, Checkbox, Table} from "semantic-ui-react";
import Gauge from "react-svg-gauge";
import {Slider} from "react-semantic-ui-range";

class PodSegment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
//            namespace: props.namespace,
//            name: props.name,
            loadGen: 0,
            pod: props.pod,
            isLoading: false,
            error: null,


            time: 0,
            vMem: {
                total: NaN,
                used: NaN,
            },
            sng: {},
            calculatedLoad: NaN,
            calculatedLoadAvg: NaN,

            values_cpu: [],
            last_cpu: NaN,
            avg_cpu: NaN,
            use_cpu: true,

            values_vm: [],
            last_vm: NaN,
            avg_vm: NaN,
            use_vm: true,

            values_timer: [],
            last_timer: NaN,
            avg_timer: NaN,
            use_timer: true,
        };
    }

    handleChangeLoadGen = (value) => {
        this.state.pod.changeLoadGen(value);
        this.setState({ loadGen: value });
    };

    newvalue_cpu(v) {
        this.setState((state) => {
            if (state.values_cpu.length >= 10) {
                state.values_cpu.shift();
            }
            state.last_cpu = v;
            state.values_cpu.push(v);
            if (state.values_cpu.length > 0) {
                state.avg_cpu = Math.round(state.values_cpu.reduce((a, b) => a + b, 0) / state.values_cpu.length);
            }
            return state
        })
    }

    newvalue_vm(v) {
        this.setState((state) => {
            if (state.values_vm.length >= 10) {
                state.values_vm.shift();
            }
            state.last_vm = v;
            state.values_vm.push(v);
            if (state.values_vm.length > 0) {
                state.avg_vm = Math.round(state.values_vm.reduce((a, b) => a + b, 0) / state.values_vm.length);
            }
            return state
        })
    }

    newvalue_timer(v) {
        this.setState((state) => {
            if (state.values_timer.length >= 10) {
                state.values_timer.shift();
            }
            state.last_timer = v;
            state.values_timer.push(v);
            if (state.values_timer.length > 0) {
                state.avg_timer = Math.round(state.values_timer.reduce((a, b) => a + b, 0) / state.values_timer.length);
            }
            return state
        })
    }

    recalc_score() {
        this.setState((state) => {
            let score = state.pod.node.score;

            let load_cpu = 100 * (score['cpu_zero'] - state.last_cpu) / (score['cpu_zero'] - score['cpu_full']);
            let load_vm = 100 * (score['vm_zero'] - state.last_vm) / (score['vm_zero'] - score['vm_full']);
            let load_timer = 100 * (score['timer_zero'] - state.last_timer) / (score['timer_zero'] - score['timer_full']);
            //console.log("LOAD CPU", load_cpu);
            //console.log("LOAD VM", load_vm);
            //console.log("LOAD TIMER", load_timer);

            let componentsCount = 0;
            let sum = 0;
            if (state.use_cpu) { componentsCount++; sum += load_cpu; }
            if (state.use_vm) { componentsCount++; sum += load_vm; }
            if (state.use_timer) { componentsCount++; sum += load_timer; }

            if (componentsCount > 0) {
                state.calculatedLoad = Math.round(sum / componentsCount);
                if (state.calculatedLoad < 0) {
                    state.calculatedLoad = 0;
                } else if (state.calculatedLoad > 100) {
                    state.calculatedLoad = 100
                }
            } else {
                state.calculatedLoad = NaN;
            }

            // AVG
            let avg_load_cpu = 100 * (score['cpu_zero'] - state.avg_cpu) / (score['cpu_zero'] - score['cpu_full']);
            let avg_load_vm = 100 * (score['vm_zero'] - state.avg_vm) / (score['vm_zero'] - score['vm_full']);
            let avg_load_timer = 100 * (score['timer_zero'] - state.avg_timer) / (score['timer_zero'] - score['timer_full']);

            let avg_componentsCount = 0;
            let avg_sum = 0;
            if (state.use_cpu) { avg_componentsCount++; avg_sum += avg_load_cpu; }
            if (state.use_vm) { avg_componentsCount++; avg_sum += avg_load_vm; }
            if (state.use_timer) { avg_componentsCount++; avg_sum += avg_load_timer; }

            if (avg_componentsCount > 0) {
                state.calculatedLoadAvg = Math.round(avg_sum / avg_componentsCount);
                if (state.calculatedLoadAvg < 0) {
                    state.calculatedLoadAvg = 0;
                } else if (state.calculatedLoadAvg > 100) {
                    state.calculatedLoadAvg = 100
                }
            } else {
                state.calculatedLoadAvg = NaN;
            }

            return state;
        })
    }

    recv(m) {
        //console.log("** RECV", this.state.pod.id, m);
        switch (m.t) {
            case "m":
                let changes = {
                    vMem: Object.assign({}, this.state.vMem),
                    sng: {},
                    time: m.d.time,
                };
                for (let i in m.d.measure) {
                    let measure = m.d.measure[i];
                    if (measure.name === 'vmem_total') {
                        changes.vMem.total = measure.value;
                    }
                    if (measure.name === 'vmem_used') {
                        changes.vMem.used = measure.value;
                    }
                    if (measure.name.startsWith("sng_")) {
                        changes.sng[measure.name.substring(4)] = measure.value;
                        if (measure.name === "sng_cpu") {
                            this.newvalue_cpu(measure.value);
                        }
                        if (measure.name === "sng_vm") {
                            this.newvalue_vm(measure.value);
                        }
                        if (measure.name === "sng_timer") {
                            this.newvalue_timer(measure.value);
                        }
                    }
                }
                this.recalc_score();
                this.setState(changes);

                break;

            case "lc":
                this.setState({ loadGen: +m.d.value });
                break;
        }
    }

    componentDidMount() {
        let messages = [];
        this.setState((state) => {
            messages = state.pod.messages.slice(0);
            state.pod.messages = [];
        }, () => {
            for (let i in messages) {
                let m = messages[i];
                this.recv(m);
            }
        });
    }

    render() {
        const { pod, isLoading, error } = this.state;
        const node = pod.node;
        const modTime = Moment(new Date(this.state.time / 1000000));

        if (error) {
            return <p>{error.message}</p>;
        }

        if (isLoading) {
            return (
                <Dimmer active inverted>
                    <Loader size='small'>Loading</Loader>
                </Dimmer>
            );
        }

        if (!pod) {
            return <p>??? ...</p>;
        }


        const clientMeasure = pod.clients['measure'];
        const clientStress = pod.clients['stress'];

        return (
            <Segment raised color={node.color}>
                <Grid columns={3} relaxed>
                    <Grid.Column>
                        <Segment basic textAlign="center">
                            <div>
                                <Label size="large" color={node.color}>
                                    <Icon name='server' /> {node.nid}
                                </Label>
                                <Label size="large" color={node.color}>
                                    {pod.id}
                                </Label>
                            </div>
                            <br/>
                            <Gauge value={this.state.calculatedLoad} width={200} height={160} label="Calculated load" />
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment basic textAlign="center">
                            <Label size="large" color={(clientStress) ? "olive" : ""}>
                                <Icon name='play circle' /> Load generator
                            </Label>
                            <Label size="large" circular>
                                {clientStress ? clientStress.cid : "NaN"}
                            </Label>
                            <br/>
                            <h4>Load level:</h4>
                            <Slider discrete color="red" settings={{
                                start: this.state.loadGen,
                                min: 0,
                                max: 3,
                                step: 1,
                                onChange: (v) => { this.handleChangeLoadGen(v) },
                            }}/>
                            <br/>
                            <h3>AVG: {this.state.calculatedLoadAvg}</h3>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment basic textAlign="center">
                            <List>
                                <List.Item>
                                    <Label size="large" color={(clientMeasure) ? "olive" : ""}>
                                        <Icon name='chart bar' /> Measure
                                    </Label>
                                    <Label size="large" circular>
                                        {clientMeasure ? clientMeasure.cid : "NaN"}
                                    </Label>
                                </List.Item>
                                <List.Item>
                                    Last data: <b>{modTime.format("HH:mm:ss")}</b>
                                </List.Item>

                                <List.Item key="table">
                                    <Table basic="very" celled textAlign="center">
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell></Table.HeaderCell>
                                                <Table.HeaderCell>AVG</Table.HeaderCell>
                                                <Table.HeaderCell>Current</Table.HeaderCell>
                                                <Table.HeaderCell>Use?</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>

                                        <Table.Body>
                                            <Table.Row>
                                                <Table.Cell>
                                                    <Header as='h4' textAlign="right">
                                                        <Header.Content>
                                                            CPU
                                                        </Header.Content>
                                                    </Header>
                                                </Table.Cell>
                                                <Table.Cell>{this.state.avg_cpu}</Table.Cell>
                                                <Table.Cell>{this.state.last_cpu}</Table.Cell>
                                                <Table.Cell>
                                                    <Checkbox
                                                        label=''
                                                        onChange={() => {
                                                            this.setState({ use_cpu: !this.state.use_cpu });
                                                            this.recalc_score();
                                                        }}
                                                        checked={this.state.use_cpu}
                                                    />
                                                </Table.Cell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.Cell>
                                                    <Header as='h4' textAlign="right">
                                                        <Header.Content>
                                                            VM
                                                        </Header.Content>
                                                    </Header>
                                                </Table.Cell>
                                                <Table.Cell>{this.state.avg_vm}</Table.Cell>
                                                <Table.Cell>{this.state.last_vm}</Table.Cell>
                                                <Table.Cell><Checkbox
                                                    label=''
                                                    onChange={() => {
                                                        this.setState({ use_vm: !this.state.use_vm });
                                                        this.recalc_score();
                                                    }}
                                                    checked={this.state.use_vm}
                                                /></Table.Cell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.Cell>
                                                    <Header as='h4' textAlign="right">
                                                        <Header.Content>
                                                            Timer
                                                        </Header.Content>
                                                    </Header>
                                                </Table.Cell>
                                                <Table.Cell>{this.state.avg_timer}</Table.Cell>
                                                <Table.Cell>{this.state.last_timer}</Table.Cell>
                                                <Table.Cell><Checkbox
                                                    label=''
                                                    onChange={() => {
                                                        this.setState({ use_timer: !this.state.use_timer });
                                                        this.recalc_score();
                                                    }}
                                                    checked={this.state.use_timer}
                                                /></Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                    </Table>
                                </List.Item>

                            </List>
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Segment>
        );
    }
}


export default PodSegment
