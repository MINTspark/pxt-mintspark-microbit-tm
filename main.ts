/**
 * The MINTspark Google Teachable Machine Extension can be used with the following site: www.mintspark.io/microbit-tm/ to 
 */
//% weight=100 color=#DC22E1
//% block="MINTspark Google TM"
//% blockId="MINTspark Google TM"
//% icon="\uf0e7"
//% inlineInputMode=external
namespace ms_microbit_tm { 
    let selectedClassName = "";
    let lastSelectedClassName = "";
    let classNameArray : string[] = [];
    let delegateArray: (() => void)[] = [];
    let onClassificationChangedHandler: (predictionName: string) => void = null;
    let broadcastClassificationChanged = false;

    /**
     * The MINTspark Google Teachable Machine Extension can be used with the following site: www.mintspark.io/microbit-tm/
     */
    //% weight=100
    //% block="Use with: www.mintspark.io/microbit-tm/"
    export function showInfo(): void {
    }

    /**
     * This event block will run every time the classification changes. If a minimum score has been set 
     * on the website then the top scoring class needs to be at that threshold as a minimum to be triggered
     * here. If all classes fall below the threshold then this block will run once with an empty class name.
     */
    //% weight=50
    //% block="Class Changed"
    //% draggableParameters = reporter
    //% color=#00B1ED
    //% blockGap=8
    export function onClassificationChanged(handler: (Class: string) => void) {
        onClassificationChangedHandler = handler;
    }

    /**  
     * This event block will run every time the classification changes to the set class name. If a 
     * minimum score has been set on the website then the class needs to be at that threshold as a 
     * minimum to be triggered here
     */
    //% weight=50
    //% block="%ClassName selected"
    //% color=#00B1ED
    export function onClassificationChangedTo(ClassName:string, handler: () => void) {
        delegateArray.push(handler);
        classNameArray.push(ClassName);
    }

    /**  
     * Once this function has been called all subsequent changed of classification will be broadcast via radio on the passed in channel.
     */
    //% weight=95
    //% block="Start broadcast cahnges on channel %channel"
    //% color=#00B1ED
    export function startRadioBroadcastClassificationChanged(channel: number) {
        radio.setGroup(channel);
        broadcastClassificationChanged = true;       
    }

    /**
     * Gets the name of the currently selected class. If a minimum threshold has been set then this block will return an empty string if no class is at the threshold or above.
     */
    //% weight=80
    //% block="Selected Class"
    //% color=#00B1ED
    export function getSelectedClassName(): string {
        return selectedClassName;
    }

    // Read serial data
    serial.redirectToUSB();

    // Process received data and set class name
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        selectedClassName = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    })

    // Periodically check if class name has changed to trigger event blocks
    control.inBackground(() =>{
        while(true){
            if (selectedClassName != lastSelectedClassName)
            {
                lastSelectedClassName = selectedClassName;

                if (onClassificationChangedHandler != null) {
                    if (broadcastChannel >= 0) {
                        radio.sendString(lastSelectedClassName);
                    }
                    onClassificationChangedHandler(lastSelectedClassName);
                }

                let index = classNameArray.indexOf(lastSelectedClassName);
                if (index > -1) {
                    delegateArray[index]();
                }
            }
            basic.pause(100);
        }
    });
}