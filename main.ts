 //% weight=100 color=#DC22E1
//% block="MINTspark Google TM"
//% blockId="MINTspark Google TM"
//% icon="\uf0e7"
//% inlineInputMode=external
namespace ms_microbit_tm { 
    let selectedClassName = "";
    let delegateArray : { (): void;} [] = [];
    let classNameArray : string[] = [];

    /**
     * The MINTspark Google Teachable Machine Extension can be used with the following site: www.mintspark.io/microbit-tm/
     */
    //% weight=100
    //% block="Use with: www.mintspark.io/microbit-tm/"
    export function showInfo(): void {
    }

    let onClassificationChangedHandler: (predictionName: string) => void;

    /**
     * This event block will run every time the classification changes. If a minimum score has been set then the top 
     * scoring class needs to be at that threshold as a minimum for this block to run. If all classes are below the 
     * threshold then this block will NOT run.
     */
    //% weight=50
    //% block="Class Changed"
    //% draggableParameters = reporter
    //% color=#00B1ED
    //% blockGap=8
    export function onClassificationChanged(handler: (Class: string) => void) {
        onClassificationChangedHandler = handler;
    }

    //% weight=50
    //% block="%ClassName selected"
    //% draggableParameters = reporter
    //% color=#00B1ED
    //% blockGap=8
    export function onClassificationChangedTo(ClassName:string, handler: () => void) {
        delegateArray.push(handler);
        classNameArray.push(ClassName);
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
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let rxData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
        if (rxData != selectedClassName)
        {
            selectedClassName = rxData;
            onClassificationChangedHandler(rxData);
            let index = classNameArray.indexOf(selectedClassName);
            if (index > -1)
            {
                delegateArray[index]();
            }
        }
    })
}