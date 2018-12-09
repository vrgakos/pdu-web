import React from 'react'
import {Dimmer, Grid, Label, Loader, Progress, Segment, Button, Icon} from "semantic-ui-react";

class NodeSegment extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            node: props.node,
            isLoading: false,
            error: null,

            cpu_steal: NaN,
            values_cpu_steal: [],

            initState: props.node.state,
            score: props.node.score,
        };
    }

    recv(m) {
        let changes;
        switch (m.t) {
            case "nm":
                changes = {};
                for (let i in m.d.measure) {
                    let measure = m.d.measure[i];
                    if (measure.name === 'cpu_steal') {
                        this.setState((state) => {
                            if (state.values_cpu_steal.length >= 20) {
                                state.values_cpu_steal.shift();
                            }
                            state.values_cpu_steal.push(measure.value > 0 ? measure.value : 0);
                            if (state.values_cpu_steal.length > 0) {
                                state.cpu_steal = state.values_cpu_steal[state.values_cpu_steal.length-1] - state.values_cpu_steal[0];
                            } else {
                                state.cpu_steal = NaN;
                            }
                            return state
                        })
                    }
                }
                this.setState(changes);

                break;

            case "ns":
                this.state.node.score = m.d.score;
                changes = {
                    node: this.state.node,
                    score: m.d.score,
                };
                this.setState(changes);

                break;

            case "ni":
                this.setState({ initState: m.d.state });
        }
    }

    handleInitMeasure() {
        this.state.node.initMeasure()
    }

    componentDidMount() {

    }

    render() {
        const { node, isLoading, error } = this.state;

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

        let score = 0;
        if (this.state.score) {
            let app = this.state.node.app;
            let array_cpu_zero = Object.entries(app.state.nodes).map(([k, v]) => { if (v.score) return v.score['cpu_zero'] });
            let array_vm_zero = Object.entries(app.state.nodes).map(([k, v]) => { if (v.score) return v.score['vm_zero'] });
            let array_timer_zero = Object.entries(app.state.nodes).map(([k, v]) => { if (v.score) return v.score['timer_zero'] });

            let max_cpu = Math.max(...array_cpu_zero);
            let max_vm = Math.max(...array_vm_zero);
            let max_timer = Math.max(...array_timer_zero);

            score = 33 * (this.state.score['cpu_zero'] / max_cpu) + 33 * (this.state.score['vm_zero'] / max_vm) + 33 * (this.state.score['timer_zero'] / max_timer);
            if (score < 0) {
                score = 0;
            } else if (score > 100) {
                score = 100;
            }
        }


        return (
            <Segment raised color={node.color}>
                <Grid columns={2} relaxed>
                    <Grid.Column width={6}>
                        <Label size="large" color={node.color}>{node.nid}</Label>
                        <br/>
                        <p></p>
                        <p>Init measure:</p>
                        {this.state.initState == 5 && <p><Button onClick={() => { this.handleInitMeasure() }} size='tiny' content='Calibrate' icon='redo' labelPosition='left' /></p>}
                        {this.state.initState < 5 && <p>in progress, state: { this.state.initState } / 5</p> }
                    </Grid.Column>
                    <Grid.Column width={10}>
                        <Progress percent={score} size='medium'>
                            Score
                        </Progress>
                        <br/>
                        <Label size="large">
                            CPU steal
                            <Label.Detail><b>{ this.state.cpu_steal }</b></Label.Detail>
                        </Label>
                        <br/>
                        <br/>
                        {
                            this.state.score != null &&
                            <div>
                                <div>
                                    <div style={{"display": "inline-block", "min-width": "7em"}}><b>CPU</b> score:</div>
                                    <div style={{"display": "inline-block", "min-width": "5em", "text-align": "right"}}>{this.state.score['cpu_zero']}</div>
                                    <div style={{"display": "inline-block", "min-width": "2em", "text-align": "center"}}>-></div>
                                    <div style={{display: "inline-block"}}>{this.state.score['cpu_full']}</div>
                                </div>
                                <div>
                                    <div style={{"display": "inline-block", "min-width": "7em"}}><b>VM</b> score:</div>
                                    <div style={{"display": "inline-block", "min-width": "5em", "text-align": "right"}}>{this.state.score['vm_zero']}</div>
                                    <div style={{"display": "inline-block", "min-width": "2em", "text-align": "center"}}>-></div>
                                    <div style={{"display": "inline-block", "min-width": "5em"}}>{this.state.score['vm_full']}</div>
                                </div>
                                <div>
                                    <div style={{"display": "inline-block", "min-width": "7em"}}><b>TIMER</b> score:</div>
                                    <div style={{"display": "inline-block", "min-width": "5em", "text-align": "right"}}>{this.state.score['timer_zero']}</div>
                                    <div style={{"display": "inline-block", "min-width": "2em", "text-align": "center"}}>-></div>
                                    <div style={{"display": "inline-block", "min-width": "5em"}}>{this.state.score['timer_full']}</div>
                                </div>
                            </div>
                        }

                    </Grid.Column>
                </Grid>
            </Segment>
        );
    }
}


export default NodeSegment
