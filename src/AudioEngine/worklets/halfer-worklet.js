// src/audioEngine/worklets/yourWorkletProcessor.js
class HalfGainer extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = this.handleMessage.bind(this);
    }

    handleMessage(event) {
        // Handle messages from the main thread if needed
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        // Process each channel
        for (let channel = 0; channel < output.length; channel++) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            // Apply your custom audio processing here
            for (let i = 0; i < outputChannel.length; i++) {
                outputChannel[i] = inputChannel[i] * 0.5; // Example: reduce volume by 50%
            }
        }

        // Return true to keep the processor alive
        return true;
    }
}

registerProcessor('HalfGainer', HalfGainer);
