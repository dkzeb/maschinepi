
export const BUTTONS = {
    ADDR: 0x80,    
    CHANNEL_MIDI: 1,
    PLUGIN_INSTANCE: 2,
    ARRANGER: 3,
    MIXER: 4,
    BROWSER_PLUGIN: 5,
    SAMPLER: 6,
    ARROW_LEFT: 7,
    ARROW_RIGHT: 8,
    FILE_SAVEAS: 9,
    SETTINGS: 10,
    MACRO_SET: 11,

    DISPLAY_BTN_1: 13,
    DISPLAY_BTN_2: 14,
    DISPLAY_BTN_3: 15,
    DISPLAY_BTN_4: 16,
    DISPLAY_BTN_5: 17,
    DISPLAY_BTN_6: 18,
    DISPLAY_BTN_7: 19,
    DISPLAY_BTN_8: 20,

    VOLUME: 21,
    SWING: 22,
    NOTE_REPEAT_ARP: 23,
    TEMPO: 24,
    LOCK: 25,
    PITCH: 26,
    MOD: 27,
    PERFORM_FX_SELECT: 28,
    NOTES: 29,
};


function generateByteArray(value: number, idx: number, length: number) {
    const bArr = [];
    for(let i = 0; i < length; i++) {
        bArr.push(0x00);
    }
    bArr[idx] = value;
    return bArr;
}