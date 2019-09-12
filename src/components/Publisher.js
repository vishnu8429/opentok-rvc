import React from 'react';
import { OTPublisher } from 'opentok-rvc';
import 'semantic-ui-css/semantic.min.css';

export default class Publisher extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			publishAudio: true,
			publishVideo: true,
			publishVideoSource: 'camera',
			dimension: 100,
			resolution: '640x480'
		};

		this.publisherEventHandlers = {
			accessDenied: () => {
				console.log('User denied access to media source');
			},
			streamCreated: () => {
				console.log('Publisher stream created');
			},
			streamDestroyed: ({ reason }) => {
				console.log(`Publisher stream destroyed because: ${reason}`);
			}
		};
	}

	onPublish = () => {
		console.log('Publish Success');
	};

	onError = error => {
		this.setState({ error });
	};

	togglePublishAudio = () => {
		this.setState(state => ({
			publishAudio: !state.publishAudio
		}));
	};

	togglePublishVideo = () => {
		this.setState(state => ({
			publishVideo: !state.publishVideo
		}));
	};

	changeVideoSource = (publishVideoSource) => {
		(this.state.publishVideoSource !== 'camera') ? this.setState({ publishVideoSource: 'camera' }) : this.setState({ publishVideoSource: 'screen' })
	}

	render() {
		const { publishAudio, publishVideo, publishVideoSource, dimension, resolution } = this.state;
		return (
			<React.Fragment>
				<OTPublisher
					properties={{
						// insertMode: "before",
						publishAudio: publishAudio,
						publishVideo: publishVideo,
						videoSource: this.state.publishVideoSource === 'screen' ? 'screen' : undefined,
						audioFallbackEnabled: true,
						showControls: true,
						width: dimension,
						height: dimension,
						facingMode: 'right', // user. environment, left, right
						fitMode: 'contain', // cover, contain,
						frameRate: 30,
						insertDefaultUI: true,
						// resolution: '640x480'
						resolution: resolution
					}}
					onPublish={this.props.onPublish}
					onError={this.props.onError}
					eventHandlers={this.props.eventHandlers}
				/>

				<button onClick={this.togglePublishAudio}>
					{publishAudio ? 'Disable' : 'Enable'} Audio
				</button>
				<button onClick={this.togglePublishVideo}>
					{publishVideo ? 'Disable' : 'Enable'} Video
				</button>
				<button onClick={this.changeVideoSource}>
					{publishVideoSource ? 'Disable' : 'Enable'} Video source
				</button>
			</React.Fragment>
		);
	}
}
