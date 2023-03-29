import { useState, useEffect } from 'react';
import './App.css';
import 'regenerator-runtime/runtime';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

const delimWords = ['then', 'and', 'next'];
const directWords = ['up', 'down', 'left', 'right'];
const clickWords = ['left', 'middle', 'right'];
const clickActions = ['hold', 'release', 'click'];
const pressWords = [
    'shift',
    'control',
    'enter',
    'escape',
    'alt',
    'space',
    'windows',
    'tab',
    'backspace',
    'gui',
    'app',
    'menu',
    'shift',
    'ctrl',
    'downarrow',
    'down',
    'leftarrow',
    'left',
    'rightarrow',
    'right',
    'uparrow',
    'up',
    'break',
    'pause',
    'capslock',
    'delete',
    'caps',
    'end',
    'esc',
    'home',
    'insert',
    'numlock',
    'pageup',
    'pagedown',
    'printscreen',
    'scrolllock',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
];
const punctuation = {
    colon: ':',
    semicolon: ';',
    fullstop: '.',
    asterisk: '*',
    exclamation: '!',
    comma: ',',
    dash: '-',
    hyphen: '-',
    bracket: '[]',
    braces: '{}',
    paranthesis: '()',
    apostrophe: "'",
    quotation: '"',
};

const parseTranscript = (transcript, symbol, setSymbol) => {
    const transcriptList = transcript.trim().toLowerCase().split(' ');
    const commandsList = [];
    let command = [];
    transcriptList.forEach((word) => {
        word = word.trim();
        command.push(word);
        if (delimWords.includes(word)) {
            command.splice(command.length - 1, 1);
            commandsList.push(command);
            command = [];
        }
    });
    if (command.length > 0) {
        commandsList.push(command);
    }
    console.log(commandsList);

    let commandObjects = commandsList.map((command) => {
        if (command.includes('move')) {
            let units = 50;
            let direction = '';
            command.forEach((word) => {
                if (!isNaN(word)) {
                    units = parseInt(word);
                } else if (directWords.includes(word)) {
                    direction = word;
                }
            });
            console.log(direction);
            console.log(direction.toUpperCase());
            console.log(units);

            return {
                type: 'MOVE',
                body: {
                    type: direction.toUpperCase(),
                    magnitude: units,
                },
            };
        } else if (command.includes('click')) {
            let clickType = 'left';
            let clickAction = 'click';
            command.forEach((word) => {
                if (clickWords.includes(word)) {
                    clickType = word;
                } else if (clickActions.includes(word)) {
                    clickAction = word;
                }
            });
            return {
                type: 'CLICK',
                body: {
                    type: clickType.toUpperCase(),
                    action: clickAction.toUpperCase(),
                },
            };
        } else if (command.includes('type')) {
            let text = '';
            command = command.slice(1);
            command.forEach((word) => {
                if (symbol === 1 && word in punctuation) {
                    text += punctuation[word] + ' ';
                } else {
                    text += word + ' ';
                }
            });
            return {
                type: 'TYPE',
                body: {
                    text,
                },
            };
        } else if (command.includes('press')) {
            let keycodes = [];
            command.forEach((word) => {
                if (
                    pressWords.includes(word) ||
                    (word.length === 1 && word.match(/[a-z]/i))
                ) {
                    keycodes.push(word.toUpperCase());
                }
            });
            return {
                type: 'PRESS',
                body: {
                    keycodes,
                },
            };
        } else if (command.includes('scroll')) {
            let units1 = 3;
            let direction1 = 'down';
            let d_words = ['up', 'down'];

            command.forEach((word) => {
                if (!isNaN(word)) {
                    units1 = parseInt(word);
                } else if (d_words.includes(word)) {
                    direction1 = word;
                }
            });

            return {
                type: 'SCROLL',
                body: {
                    type: direction1.toUpperCase(),
                    magnitude: units1,
                },
            };
        } else if (command.includes('mod')) {
            command.forEach((word) => {
                if (word == '1') setSymbol(0);
                else setSymbol(1);
            });
            return {
                type: 'MODE',
                body: {
                    type: !symbol ? 'LITERAL' : 'PARSED',
                },
            };
        }
    });
    console.log(commandsList);
    console.log(commandObjects);
    commandObjects = commandObjects.filter((object) => {
        if (object === undefined) {
            return false;
        }
        return true;
    });
    if (commandObjects.length > 0) {
        fetch('http://192.168.137.237/execute', {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                commands: commandObjects,
            }),
        });
    }
};

const Dictaphone = () => {
    const [symbol, setSymbol] = useState(0);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    useEffect(() => {
        if (!listening) {
            if (transcript) {
                parseTranscript(transcript, symbol, setSymbol);
            }
        }
    }, [listening]);

    return (
        <div>
            <p>Microphone: {listening ? 'on' : 'off'}</p>
            <button onClick={SpeechRecognition.startListening}>Start</button>
            <button onClick={SpeechRecognition.stopListening}>Stop</button>
            <button onClick={resetTranscript}>Reset</button>
            <p>{transcript}</p>
        </div>
    );
};

function App() {
    return (
        <div className='App'>
            <div className='centerText'>
                <h1>
                    <span>HIDDEN</span>
                    <span>HIDDEN</span>
                    <span>HIDDEN</span>
                </h1>
            </div>
            <Dictaphone />
        </div>
    );
}

export default App;
