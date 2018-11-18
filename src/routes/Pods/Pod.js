import React from 'react'
import Api from '../../api'
import { Link } from 'react-router-dom'
import { Dimmer, Loader } from "semantic-ui-react";

class Pod extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            namespace: props.match.params.namespace,
            name: props.match.params.name,
            pod: null,
            isLoading: false,
            error: null,
        };
    }

    componentDidMount() {
        this.setState({ isLoading: true });

        Api.getOne(this.state.namespace, this.state.name).then(result => {
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
        })
    }

    render() {
        const { pod, isLoading, error } = this.state;

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

        if (!pod) {
            return <p>??? ...</p>;
        }

        return (
            <div>
                <h1>Pod <b>{pod.metadata.name}</b></h1>
                <h2>Status</h2>
                <ul>
                    <li>Phase: {pod.status.phase}</li>
                    <li>Pod IP: {pod.status.podIP}</li>
                    <li>Host IP: {pod.status.hostIP}</li>
                </ul>
                <h2>Meta</h2>
                <ul>
                    <li>Uid: {pod.metadata.uid}</li>
                    <li>Namespace: {pod.metadata.namespace}</li>
                    <li>Labels: {Object.keys(pod.metadata.labels).map(label => <span><b>{label}</b>: {pod.metadata.labels[label]} </span>)}</li>
                </ul>
                <h2>Spec</h2>
                <ul>
                    <li>Node name: {pod.spec.nodeName}</li>
                    <li>DNS policy: {pod.spec.dnsPolicy}</li>
                    <li>Restart policy: {pod.spec.restartPolicy}</li>
                </ul>
                <h2>Containers</h2>
                {
                    pod.spec.containers.map((c,i) => (
                        <div>
                            <h3>#{i}</h3>
                            <ul>
                                <li>Name: {c.name}</li>
                                <li>Image: {c.image}</li>
                            </ul>
                        </div>
                    ))
                }

                <Link to='/pods'>Back</Link>
            </div>
        );
    }
}


export default Pod
