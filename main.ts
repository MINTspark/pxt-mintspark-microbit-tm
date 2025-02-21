//% weight=100 color=#DC22E1
//% block="MINTspark Google TM"
//% blockId="MINTspark Google TM"
//% icon="\uf0e7"
//% inlineInputMode=external
namespace ms_microbit_tm {
    let ClassNames: string[] = []
    let ClassScores: number[] = []
    let selectedClassName = "";
    let selectedClassIndex = -1;
    let selectedClassScore = -1;
    let minScore = 0;

    /**
     * The MINTspark Google Teachable Machine Extension can be used with the following site: www.mintspark.io/microbit-tm/
     */
    //% weight=100
    //% block="Use with: www.mintspark.io/microbit-tm/"
    export function showInfo(): void {
    }

    /**
     * Here you can set the minimum required threshold for a class to be selected as the detected class. If set to 0 then the top scoring class will be selected regardless of score.
     */
    //% weight=100
    //% block="Set Min Score %certainty"
    export function setClassificationThreshold(certainty: number): void {
        minScore = certainty;
    }

    let onClassificationChangedHandler: (predictionName: string, score: number) => void;

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
    export function onClassificationChanged(handler: (Class: string, Score: number) => void) {
        onClassificationChangedHandler = handler;
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

    /**
     * Gets the score of the currently selected class. If a minimum threshold has been set then this block will return -1 if no class is at the threshold or above.
     */
    //% weight=75
    //% block="Selected Class Score"
    //% color=#00B1ED
    export function getSelectedClassScore(): number {
        return selectedClassScore;
    }

    /**
     * Gets the current score for the passed in class name. The minimum threshold does not affect this block.
     */
    //% weight=70
    //% block="Get score for class %name"
    //% color=#00B1ED
    export function getClassScore(name: string): number {
        let index = ClassNames.indexOf(name);
        if (index > -1) {
            return ClassScores[index];
        }

        return NaN;
    }

    /**
     * Gets a text array with all class names.
     */
    //% weight=65
    //% block="All Class Names"
    //% color=#00B1ED
    export function getClassNames(): string[] {
        return ClassNames;
    }

    // Read serial data
    let firstUpdate = true;
    serial.redirectToUSB();
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        let rxData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
        let messageParts = rxData.split(":")

        // Clear classes and scores
        if (messageParts[0] == "reset") {
            firstUpdate = true;
            ClassNames = [];
            ClassScores = [];
            selectedClassName = "";
            selectedClassIndex = -1;
            selectedClassScore = -1;
        }
        // Get labels for classes at beginning
        else if (messageParts[0] == "label") {
            ClassNames.push(messageParts[1]);
            ClassScores.push(0);
        }
        // Update scores for classes
        else {
            for (let i = 0; i < messageParts.length; i++) {
                ClassScores[i] = parseFloat(messageParts[i]);
            }

            firstUpdate = false;
        }
    })

    // Background check to determine if classification has changed. Needs at least minimum score if set.
    control.inBackground(() => {
        let lastIndex = -1;
        let lastTopScore = 0;

        while (true) {
            if (!firstUpdate) {
                let hasChanged = false;
                setTopClassification();

                if (onClassificationChangedHandler != null) {
                    if (selectedClassScore < minScore && lastTopScore >= minScore) {
                        lastIndex = -1;
                        onClassificationChangedHandler("", -1);
                    }
                    else if (selectedClassScore >= minScore && lastTopScore < minScore) {
                        lastIndex = selectedClassIndex;
                        onClassificationChangedHandler(selectedClassName, selectedClassScore);
                    }
                    else if (lastIndex != selectedClassIndex && selectedClassScore >= minScore) {
                        lastIndex = selectedClassIndex;
                        onClassificationChangedHandler(selectedClassName, selectedClassScore);
                    }

                    lastTopScore = selectedClassScore;
                }
            }

            basic.pause(300);
        }
    })

    // Get current top Classification
    function setTopClassification(): void {
        let max: number = -1;
        let newIndex: number = -1;

        for (let i = 0; i < ClassScores.length; i++) {
            let value: number = ClassScores[i];
            if (value > max) {
                newIndex = i;
                max = value;
            }
        }

        selectedClassScore = max;
        if (newIndex != selectedClassIndex) {
            selectedClassIndex = newIndex;
            selectedClassName = ClassNames[newIndex];
        }
    }
}