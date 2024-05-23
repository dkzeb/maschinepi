import { AudioController } from "./classes/AudioController"
import { DisplayController } from "./classes/DisplayController"
import { InputController } from "./classes/InputController"
import { LEDController } from "./classes/LEDController"
import { SoundEngine } from "./classes/SoundEngine"
import { StorageController } from "./classes/StorageController"

declare const globalThis: {
    inputController: InputController,
    displayController: DisplayController,
    ledController: LEDController,
    soundEngine: SoundEngine,
    audioController: AudioController,
    storageController: StorageController
}