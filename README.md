# opentok-rvc
Opentok react video chat which support stream and signalling

## install
npm install opentok-rvc --save

## working
To get npm components here please import below code in your opentok custom component

```
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-rvc';

method to send signal
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

method to recieve signal 
onSignalRecieve = (data) => {
    console.log('onSignalRecieve');
    console.log(data);
}

render below code
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
          // ref={(instance) => {
          //   this.otSession = instance;
          // }}
          ref={this.otSession}
          apiKey={apiKey}
          sessionId={sessionId}
          token={this.state.token}
          onError={this.onSessionError}
          eventHandlers={this.sessionEventHandlers}
          // onSignalSend={this.onSignalSend}
          onSignalRecieve={this.onSignalRecieve}
        >
          <button id="videoButton" onClick={this.toggleVideo}>
            {publishVideo ? 'Disable' : 'Enable'} Video
          </button>

          <input type="text" value={this.state.text} onChange={this.handleChange} />
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
```