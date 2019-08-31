import React from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-rvc';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      connection: 'Connecting',
      publishVideo: true,
      type: 'DEFAULT',
      token: this.props.credentials.token,
      signal: {
        type: '',
        data: ''
      },
      text: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.onSignalSend = this.onSignalSend.bind(this);

    this.otSession = React.createRef();

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
    this.setState({ error });
  };

  onPublish = () => {
    console.log('Publish Success');
  };

  onPublishError = error => {
    this.setState({ error });
  };

  onSubscribe = () => {
    console.log('Subscribe Success');
  };

  onSubscribeError = error => {
    this.setState({ error });
  };

  toggleVideo = () => {
    this.setState(state => ({
      publishVideo: !state.publishVideo,
    }));
  };

  toggleToken = () => {
    var userType = this.state.type === 'DEFAULT' ? 'PROVIDER' : 'DEFAULT';
    var token = this.state.type === 'DEFAULT' ? this.props.credentials.providerToken : this.props.credentials.token;
    this.setState({ type: userType });
    this.setState({ token: token });
  }

  handleChange(event) {
    this.setState({ text: event.target.value });
  }

  onSignalSend = () => {
    var value = this.state.text;
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

  onSignalRecieve = (data) => {
    console.log('onSignalRecieve');
    console.log(data);
  }

  render() {
    const { apiKey, sessionId } = this.props.credentials;
    const { error, connection, publishVideo } = this.state;
    return (
      <div>
        <div onClick={() => this.toggleToken()}>
          <div>Toggle Token</div>
          <div>Current Type: {this.state.type}</div>
          <div>Current Token: {this.state.token}</div>
        </div>

        <div id="sessionStatus">Session Status: {connection}</div>
        {error ? (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        ) : null}
        <OTSession
          ref={this.otSession}
          apiKey={apiKey}
          sessionId={sessionId}
          token={this.state.token}
          onError={this.onSessionError}
          eventHandlers={this.sessionEventHandlers}
          onSignalRecieve={this.onSignalRecieve}
        >
          <div>
            <button id="videoButton" onClick={this.toggleVideo}>
              {publishVideo ? 'Disable' : 'Enable'} Video
            </button>
          </div><br />

          <input type="text" placeholder="Enter signal message" value={this.state.text} onChange={this.handleChange} /><br />
          <button onClick={this.onSignalSend}>SEND</button>

          <OTPublisher
            properties={{ publishVideo, width: 50, height: 50, }}
            onPublish={this.onPublish}
            onError={this.onPublishError}
            eventHandlers={this.publisherEventHandlers}
          />
          <OTStreams>
            <OTSubscriber
              properties={{ width: 100, height: 100 }}
              onSubscribe={this.onSubscribe}
              onError={this.onSubscribeError}
              eventHandlers={this.subscriberEventHandlers}
            />
          </OTStreams>
        </OTSession>
      </div>
    );
  }
}
