import { TransformationSettings, ImageResponse } from '../types';

export class WebSocketService {
    private ws: WebSocket;
    private messageCallback: (response: ImageResponse) => void;

    constructor(onMessage: (response: ImageResponse) => void) {
        this.ws = new WebSocket('ws://localhost:8000/ws');
        this.messageCallback = onMessage;

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        this.ws.onmessage = (event) => {
            console.log('Received message:', event.data);
            try {
                const response: ImageResponse = JSON.parse(event.data);
                this.messageCallback(response);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                console.log('Raw message:', event.data);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                this.connect();
            }, 5000);
        };
    }

    private connect() {
        this.ws = new WebSocket('ws://localhost:8000/ws');
    }

    public sendTransformation(settings: TransformationSettings) {
        if (this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending settings:', settings);
            this.ws.send(JSON.stringify(settings));
        } else {
            console.error('WebSocket is not connected. State:', this.ws.readyState);
        }
    }

    public disconnect() {
        this.ws.close();
    }
} 