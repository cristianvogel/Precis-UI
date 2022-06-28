import {BasicController} from "./PrecisController";

export {}

interface PrController {
    getMappedValue(): number
}

class Dial  extends BasicController implements PrController{
    getMappedValue(): number { return 0
    }
}

class Fader extends BasicController implements PrController {
    getMappedValue(): number {return 0
    }
}

class NullCont implements PrController {
    getMappedValue(): number {
        return -1
    }
}

const widgetMap = {
    dial: Dial,
    fader: Fader
}

type Keys = keyof typeof widgetMap

type WidgetTypes = typeof widgetMap[Keys]

type ExtractInstanceType<T> = T extends BasicController ? T  : NullCont

class WidgetFactory {
    static getWidget(k: Keys, initialSettings: CommonSettings): ExtractInstanceType<WidgetTypes> {
        return new widgetMap[k](initialSettings)
    }
}



