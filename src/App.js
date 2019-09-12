import React from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-rvc';
import { Container, Segment, Header, Checkbox, Form, Icon, Popup } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			connection: 'Connecting',
			publishAudio: true,
			publishVideo: true,
			publishVideoSource: 'camera',
			subscribeToAudio: true,
			subscribeToVideo: true,
			fitMode: 'cover',
			dimension: 100,
			resolution: '640x480',
			type: 'DEFAULT',
			token: this.props.credentials.token,
			providerToken: this.props.credentials.providerToken,
			subscriberTokenA: this.props.credentials.subscriberTokenA,
			subscriberTokenB: this.props.credentials.subscriberTokenB,
			signal: {
				type: '',
				data: ''
			},
			text: '',
			callActionType: '',
			audioDevices: [],
			videoDevices: [],
			publisherName: 'John'
		};

		this.otSession = React.createRef();

		this.setUserToken = this.setUserToken.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.onSignalSend = this.onSignalSend.bind(this);
		this.onCallAction = this.onCallAction.bind(this);
		this.changeVideoDimension = this.changeVideoDimension.bind(this);
		this.changeVideoResolution = this.changeVideoResolution.bind(this);
		this.changeFitmode = this.changeFitmode.bind(this);

		this.sessionEventHandlers = {
			sessionConnected: () => {
				this.setState({ connection: 'Connected' });
			},
			sessionDisconnected: () => {
				this.setState({ connection: 'Disconnected' });
			},
			sessionReconnected: () => {
				this.setState({ connection: 'Reconnected' });
			},
			sessionReconnecting: () => {
				this.setState({ connection: 'Reconnecting' });
			}
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

		this.subscriberEventHandlers = {
			videoEnabled: () => {
				console.log('Subscriber video enabled');
			},
			videoDisabled: () => {
				console.log('Subscriber video disabled');
			},
		};
	}

	onSessionError = error => {
		console.log(error);
	};

	onPublish = () => {
		console.log('Publish Success');
	};

	onPublishError = error => {
		this.setState({ publishVideoSource: 'camera' });
		let errMsg = '';
		if (typeof error === 'object') {
			errMsg = error.originalMessage;
		} else {
			errMsg = error
		}
		this.setState({ error: errMsg });
		console.log(error);
	};

	onSubscribe = () => {
		console.log('Subscribe Success');
	};

	onSubscribeError = error => {
		this.setState({ error });
	};

	// set media devices used 
	onMediaDevices = (devices) => {
		const audioDevices = [];
		const videoDevices = [];
		devices.forEach(device => {
			if(device.kind === 'audioInput') {
				audioDevices.push(device);
			} else {
				videoDevices.push(device);
			}
			this.setState({ audioDevices: audioDevices })
			this.setState({ videoDevices: videoDevices })
		});
	}

	// check screen sharing is possible or not
	checkScreenSharing = (response) => {
		if (!response.supported || response.extensionRegistered === false) {
			// This browser does not support screen sharing
			console.log('This browser does not support screen sharing');
			alert('This browser does not support screen sharing');
		} else if (response.extensionInstalled === false) {
			// Prompt to install the extension
			console.log('Prompt to install the extension');
			prompt("Please install the extension for screenshare", "Opentok react video chat");
		} else {
			// Screen sharing is available.
			console.log('Screen sharing is available');
		}
	}

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

	changeVideoSource = (publishVideoSource) => {
		(this.state.publishVideoSource !== 'camera') ? this.setState({ publishVideoSource: 'camera' }) : this.setState({ publishVideoSource: 'screen' })
	}

	changeVideoDimension = (event) => {
		this.setState({ dimension: event.target.value })
	}

	changeVideoResolution = (event) => {
		this.setState({ resolution: event.target.value })
		// return '1280x720';
	}

	changeFitmode = (event) => {
		this.setState({ fitMode: event.target.value })
	};

	toggleToken = () => {
		let publisherName = this.state.type === 'DEFAULT' ? 'John' : 'Manu';
		let userType = this.state.type === 'DEFAULT' ? 'PROVIDER' : 'DEFAULT';
		let token = this.state.type === 'DEFAULT' ? this.props.credentials.providerToken : this.props.credentials.token;
		this.setState({ type: userType });
		this.setState({ token: token });
		this.setState({ publisherName: publisherName });
	}

	setUserToken = (event) => {
		let token = this.props.credentials.providerToken;
		let type = event.target.value;
		if (type === 'select') {
			alert('Please select user type');
			return;
		} else if (type === 'provider') {
			token = this.state.providerToken;
		} else if (type === 'subscriberA') {
			token = this.state.subscriberTokenA;
		} else {
			token = this.state.subscriberTokenB;
		}
		this.setState({ type: type })
		this.setState({ token: token })
	}

	handleChange(event) {
		this.setState({ text: event.target.value });
	}

	// send opentok signal
	onSignalSend = () => {
		let value = this.state.text;
		this.otSession.current.sessionHelper.session.signal({
			type: 'msg',
			data: value
		}, function signalCallback(error) {
			if (error) {
				console.error('Error sending signal:', error.name, error.message);
			} else {
				console.log(value);
			}
		});
	}

	// recieve opentok signal
	onSignalRecieve = (signal) => {
		console.log('onSignalRecieve');
		console.log(signal);
		this.setState({ callActionType: signal.data })
	}

	// change video call action
	onCallAction = (type) => {
		this.otSession.current.sessionHelper.session.signal({
			type: 'msg',
			data: type
		}, function signalCallback(error) {
			if (error) {
				console.error('Error sending signal:', error.name, error.message);
			} else {
				console.log(type);
			}
		});
	}

	_renderBtns = () => {
		if (this.state.type === 'DEFAULT') {
			if (this.state.callActionType === "" ||
				this.state.callActionType === "STOP_CALL" ||
				this.state.callActionType === "DECLINE_CALL") {
				return (
					<Popup
						trigger={<Icon circular name='phone' size="large" color="blue" onClick={() => this.onCallAction('CALL_INITIATED')} />}
						content='Make Call'
						position='top center'
					/>
				)
			} else if (this.state.callActionType === "CALL_INITIATED") {
				return (
					<Popup
						trigger={<Icon circular name='phone' size="large" color="red" onClick={() => this.onCallAction('STOP_CALL')} />}
						content='Cancel Call'
						position='top center'
					/>
				)
			} else if (this.state.callActionType === "ACCEPT_CALL") {
				return (
					<Popup
						trigger={<Icon circular name='phone' size="large" color="red" onClick={() => this.onCallAction('STOP_CALL')} />}
						content='Stop Call'
						position='top center'
					/>
				)
			}
		} else {
			if (this.state.callActionType === "CALL_INITIATED") {
				return (
					<>
						<Popup
							trigger={<Icon circular name='phone' size="large" color="teal" onClick={() => this.onCallAction('ACCEPT_CALL')} />}
							content='Accept Call'
							position='top center'
						/>
						<Popup
							trigger={<Icon circular name='phone' size="large" color="red" onClick={() => this.onCallAction('DECLINE_CALL')} />}
							content='Decline Call'
							position='top center'
						/>
					</>
				)
			}
		}
	}

	render() {
		const { apiKey, sessionId } = this.props.credentials;
		const { error, connection, token, publishAudio, publishVideo, subscribeToAudio, subscribeToVideo, publishVideoSource, fitMode, callActionType, type, dimension, resolution, publisherName } = this.state;
		return (
			<Container className="app-container">
				<div>
					<Segment color='red'>
						<div onClick={() => this.toggleToken()}>
							<Header as='h3'>Opentok react video chat</Header>
							<div>Toggle Token</div>
							<Checkbox toggle />
							<div>Current Type: {type}</div>
							<div>Current Token: {token}</div>
						</div>

						{/* <div>
						    <label>
								Select user chat role:
                                <select value={this.state.type} onChange={this.setUserToken}>
									<option value="select">select</option>
									<option value="provdier">Provider</option>
									<option value="subscriberA">Subscriber A</option>
									<option value="subscriberB">Subscriber B</option>
								</select>
							</label>
						</div> */}
					</Segment>

					<Segment color='teal'>
						Resolution: {this.state.resolution}
						<div id="sessionStatus">Session Status: {connection}</div>
						{error ? (
							<div className="error">
								<strong>Error:</strong> {error}
							</div>
						) : null}
					</Segment>

					<Segment color='yellow'>
						<input type="text" placeholder="Enter signal message" value={this.state.text} onChange={this.handleChange} /><br />
						<button onClick={this.onSignalSend}>SEND</button>
					</Segment>

					<Segment color="blue" className="video-segment">
						<OTSession
							ref={this.otSession}
							apiKey={apiKey}
							sessionId={sessionId}
							token={token}
							onError={this.onSessionError}
							eventHandlers={this.sessionEventHandlers}
							onSignalRecieve={this.onSignalRecieve}
							onMediaDevices={this.onMediaDevices}
							checkScreenSharing={this.checkScreenSharing}
						>
							<OTPublisher
							    publisherName={publisherName}
								properties={{
									insertMode: "append",
									publishAudio: publishAudio,
									publishVideo: publishVideo,
									videoSource: publishVideoSource === 'screen' ? 'screen' : undefined,
									audioFallbackEnabled: true,
									showControls: true,
									width: dimension,
									height: dimension,
									maxResolution: { width: 1920, height: 1080 },
									facingMode: 'right', // user. environment, left, right
									fitMode: fitMode, // cover, contain,
									frameRate: 30,
									insertDefaultUI: true,
									// resolution: '640x480'
									resolution: resolution
								}}
								onPublish={this.props.onPublish}
								onError={this.onPublishError}
								eventHandlers={this.publisherEventHandlers}
							/>
							{
								callActionType === 'ACCEPT_CALL' &&
								<OTStreams>
									<OTSubscriber
										resolution={resolution}
										properties={{
											insertMode: "append",
											subscribeToAudio: subscribeToAudio,
											subscribeToVideo: subscribeToVideo,
											// preferredFrameRate: 15,
											showControls: true,
											fitMode: fitMode,
											width: 100,
											height: 100,
											resolution: resolution
										}}
										onSubscribe={this.onSubscribe}
										onError={this.onSubscribeError}
										eventHandlers={this.subscriberEventHandlers}
									/>
								</OTStreams>
							}
						</OTSession>

						<div className="btn-container">
							{this._renderBtns()}
							<Popup
								trigger={publishAudio ? <Icon circular name='unmute' size="large" onClick={this.togglePublishAudio} /> : <Icon circular name='mute' size="large" onClick={this.togglePublishAudio} />}
								content='Toggle Audio'
								position='top center'
							/>
							<Popup
								trigger={publishVideo ? <Icon circular name='video' size="large" onClick={this.togglePublishVideo} /> : <Icon circular name='video' size="large" onClick={this.togglePublishVideo} />}
								content='Toggle Video'
								position='top center'
							/>
							<Popup
								trigger={publishVideoSource ? <Icon circular name='tv' size="large" onClick={this.changeVideoSource} /> : <Icon circular name='tv' size="large" onClick={this.changeVideoSource} />}
								content='Share your screen'
								position='top center'
							/>
							{
								callActionType === "ACCEPT_CALL" &&
								<>

									<Popup
										trigger={subscribeToAudio ? <Icon circular name='unmute' size="large" onClick={this.toggleSubscribeToAudio} /> : <Icon circular name='mute' size="large" onClick={this.toggleSubscribeToAudio} />}
										content='Toggle Subscribe to Audio'
										position='top center'
									/>
									<Popup
										trigger={subscribeToVideo ? <Icon circular name='video' size="large" onClick={this.toggleSubscribeToVideo} /> : <Icon circular name='video' size="large" onClick={this.toggleSubscribeToVideo} />}
										content='Toggle Subscribe to Video'
										position='top center'
									/>
								</>
							}
							<Popup
								trigger={<Icon circular name='setting' size="large" />}
								content={<Form onSubmit={this.handleSubmit}>
									<Header size='small'>Video</Header>
									<Form.Field>
									    <label>
											Video dimension
                                            <select value={dimension} onChange={this.changeVideoDimension}>
												<option value="50">50</option>
												<option value="100">100</option>
												<option value="200">200</option>
											</select>
										</label>
										<label>
											Video quality
                                            <select value={resolution} onChange={this.changeVideoResolution}>
												<option value="320x240">Default</option>
												<option value="640x480">Low Definition</option>
												<option value="1280x720">High Definition</option>
											</select>
										</label>
									</Form.Field>
									<Form.Field>
										<label>
											Webcam
                                            <select>
												{
													this.state.videoDevices.map(device => 
														<option key={device.deviceId} value={device.deviceId}>{device.label}</option>
													)
												}
											</select>
										</label>
									</Form.Field>
									<Form.Field>
										<label>
											Video mode
                                            <select value={fitMode} onChange={this.changeFitmode}>
												<option value="cover">Cover</option>
												<option value="contain">Contain</option>
											</select>
										</label>
									</Form.Field>
									<Header size='small'>Audio</Header>
									<Form.Field>
										<label>
											Microphone
                                            <select>
												{
													this.state.audioDevices.map(device => 
														<option key={device.deviceId} value={device.deviceId}>{device.label}</option>
													)
												}
											</select>
										</label>
									</Form.Field>
								</Form>}
								position='top center'
								hoverable={true}
							/>
						</div>
					</Segment>
				</div>
			</Container>
		);
	}
}

export default App;
