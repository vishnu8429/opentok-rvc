import React from 'react';
import { OTSubscriber } from 'opentok-rvc';

export default class Subscriber extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			subscribeToAudio: true,
			subscribeToVideo: true,
			dimension: 100,
			resolution: '640x480'
		};

		this.subscriberEventHandlers = {
			videoEnabled: () => {
				console.log('Subscriber video enabled');
			},
			videoDisabled: () => {
				console.log('Subscriber video disabled');
			},
		};
	}

	onSubscribe = () => {
		console.log('Subscribe Success');
	};

	onSubscribeError = error => {
		this.setState({ error });
	};

	toggleSubscribeToAudio = () => {
		this.setState(state => ({
			subscribeToAudio: !state.subscribeToAudio
		}));
	};

	toggleSubscribeToVideo = () => {
		this.setState(state => ({
			subscribeToVideo: !state.subscribeToVideo
		}));
	};

	render() {
		const { subscribeToAudio, subscribeToVideo, resolution } = this.state;
		return (
			<div>
				<OTSubscriber
					properties={{
						subscribeToAudio: subscribeToAudio,
						subscribeToVideo: subscribeToVideo,
						// preferredFrameRate: 15,
						showControls: true,
						fitMode: 'contain',
						width: 100,
						height: 100,
						resolution: resolution
					}}
					onSubscribe={this.onSubscribe}
					onError={this.onSubscribeError}
					eventHandlers={this.subscriberEventHandlers}
				/>
				<button onClick={this.toggleSubscribeToAudio}>
					{subscribeToAudio ? 'Disable' : 'Enable'} Audio
                </button>
				<button onClick={this.toggleSubscribeToVideo}>
					{subscribeToVideo ? 'Disable' : 'Enable'} Video
                </button>
			</div>
		);
	}
}
