import React from 'react'
import Api from '../../api'
import { Link } from 'react-router-dom'
import { Container, Label, Segment, Dimmer, Loader, Grid, Header, Progress, List, Icon, Item } from 'semantic-ui-react'
import { Slider } from 'react-semantic-ui-range'
import Chart from 'react-apexcharts'

class PodList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pods: [],
            isLoading: false,
            error: null,

            options: {
                chart: {
                    id: 'apexchart-example',
                    toolbar: {
                        show: false
                    }
                },
                xaxis: {
                    labels: {
                        show: false
                    }
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
            },
            series: [{
                name: 'series-1',
                data: [30, 40, 45, 50, 49, 60, 70, 91]
            }]
        };
    }

    componentDidMount() {
        this.setState({ isLoading: true });

        Api.getAll().then(result => {
            this.setState({
                pods: result,
                isLoading: false
            })
        }).catch(error => {
            this.setState({
                error,
                isLoading: false
            })
        })
    }

    render() {
        const { pods, isLoading, error } = this.state;

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

        const settings = {
            start:2,
            min:0,
            max:10,
            step:1,
        }

        return (
            <div>
                <h2>Current pod's in the cluster:</h2>

                <Container>
                    <Segment.Group>
                        {
                            pods.map(p => (
                                <Segment raised>
                                    <Grid columns={3} relaxed>
                                        <Grid.Column>
                                            <Segment basic>
                                                <Header>
                                                    <Link to={`/pods/${p.metadata.namespace}/${p.metadata.name}`}>{p.metadata.name}</Link>
                                                </Header>
                                                <List>
                                                    <List.Item>
                                                        <Label>
                                                            <Icon name='protect' /> {p.metadata.namespace}
                                                        </Label>
                                                    </List.Item>

                                                    <List.Item>
                                                        <Label>
                                                            <Icon name='server' /> {p.spec.nodeName}
                                                        </Label>
                                                    </List.Item>

                                                    <List.Item>
                                                        <Label>
                                                            <Icon name='docker' /> {p.spec.containers.length}
                                                        </Label>
                                                    </List.Item>
                                                </List>

                                                <br/>
                                                <h4>Load generator:</h4>
                                                <Slider discrete color="red" settings={settings}/>


                                            </Segment>
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Segment basic>
                                                <Chart options={this.state.options} series={this.state.series} type="area"  />
                                            </Segment>
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Segment basic>
                                                <List>
                                                    <List.Item>
                                                        <Progress percent={31} indicating size='medium'>
                                                            Calculated overall load
                                                        </Progress>
                                                    </List.Item>
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
                            ))
                        }
                    </Segment.Group>
                </Container>
            </div>
        );
    }
}

export default PodList
