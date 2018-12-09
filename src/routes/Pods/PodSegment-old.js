import React from 'react'
import Api from '../../api'
import { Link } from 'react-router-dom'
import {Dimmer, Grid, Header, Icon, Label, List, Loader, Progress, Segment} from "semantic-ui-react";
import Gauge from "react-svg-gauge";
import {Slider} from "react-semantic-ui-range";

class Pod extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            namespace: props.namespace,
            name: props.name,
            pod: props.pod,
            isLoading: false,
            error: null,
        };
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
        const { pod, isLoading, error } = this.state;
        const { node } = this.props;

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

        const sliderSettings = {
            start: 2,
            min: 0,
            max: 10,
            step: 1,
        };

        return (
            node.show
            &&
            <Segment raised color={node.color}>
                <Grid columns={3} relaxed>
                    <Grid.Column>
                        <Segment basic>
                            <Header>
                                <Link to={`/pods/${pod.metadata.namespace}/${pod.metadata.name}`}>{pod.metadata.name}</Link>
                            </Header>
                            <List>
                                <List.Item>
                                    <Label>
                                        <Icon name='protect' /> {pod.metadata.namespace}
                                    </Label>
                                </List.Item>

                                <List.Item>
                                    <Label color={node.color}>
                                        <Icon name='server' /> {pod.spec.nodeName}
                                    </Label>
                                </List.Item>

                                <List.Item>
                                    <Label>
                                        <Icon name='docker' /> {pod.spec.containers.length}
                                    </Label>
                                </List.Item>
                            </List>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment basic textAlign="center">
                            <Gauge value={50} width={200} height={160} label="Calculated load" />
                            <br/>
                            <h4>Load generator:</h4>
                            <Slider discrete color="red" settings={sliderSettings}/>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment basic>
                            <List>
                                <List.Item>
                                    <Progress percent={45} progress size='small'>
                                        CPU usage
                                    </Progress>
                                </List.Item>
                                <List.Item>
                                    <Progress percent={75} progress size='small'>
                                        Memory usage
                                    </Progress>
                                </List.Item>
                                <List.Item>
                                    Value1: 123
                                </List.Item>
                                <List.Item>
                                    Value2: 456
                                </List.Item>
                                <List.Item>
                                    Value3: 789
                                </List.Item>
                            </List>
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Segment>
        );
    }
}


export default Pod
