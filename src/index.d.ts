import { DisplayController } from "./classes/DisplayController"
import { InputController } from "./classes/InputController"
import { SoundEngine } from "./classes/SoundEngine"
import { StorageController } from "./classes/StorageController"

declare const globalThis: {
    inputController: InputController,
    displayController: DisplayController,    
    soundEngine: SoundEngine,    
    storageController: StorageController
}